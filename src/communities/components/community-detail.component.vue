<script>
import { CommunityApiService } from "../service/community-api.service.js";
import { PostApiService } from "../service/post-api.service.js";
import AuthService from "../../public/shared-services/authentication.service.js";

export default {
  name: "community-detail.component",
  components: {

  },
  data() {
    return {
      community: null,
      posts: [],
      newPost: {
        content: '',
        img: ''
      },
      genres: [
        { value: 0, key: 'literature' },
        { value: 1, key: 'non_fiction' },
        { value: 2, key: 'fiction' },
        { value: 3, key: 'mangas_comics' },
        { value: 4, key: 'juvenile' },
        { value: 5, key: 'children' },
        { value: 6, key: 'ebooks_audiobooks' }
      ],
      isMember: false,
      currentUser: null
    }
  },
  computed: {
    displayedGenreKey() { // Esta propiedad computada buscará el 'key' del género basado en 'community.type'
      if (this.community && typeof this.community.type === 'number') {
        const foundGenre = this.genres.find(genre => genre.value === this.community.type);
        return foundGenre ? foundGenre.key : 'fiction';
      }
      return '';
    },
    buttonText() {
      return this.isMember ? this.$t("comm.leave") : this.$t("comm.join");
    }
  },
  methods: {
    getMembershipLocalStorageKey(communityId, userId) {
      return `community_member_${communityId}_${userId}`;
    },
    loadInfo() { // Permite cargar la información almacenada para comunidades dentro de la Fake API
      const service = new CommunityApiService();
      const communityTitle = this.$route.params.name

      service.getCommunities().then(data => {
        this.community = data.find(b => b.name.toString().toLowerCase() === communityTitle.toLowerCase());

        if (this.community && this.community.id) {
          const communityId = this.community.id;
          const derived = new PostApiService();

          derived.getPosts().then(postsData => {
            this.posts = postsData.filter(post => post.communityId === communityId);
          }).catch(error => {
            console.error('Error loading posts:', error);
          });

          this.currentUser = AuthService.getCurrentUser();

          if (this.currentUser && this.currentUser.userId) {
            const localStorageKey = this.getMembershipLocalStorageKey(communityId, this.currentUser.userId);
            const storedMembership = localStorage.getItem(localStorageKey);

            if (storedMembership !== null) { // Check if a value exists
              this.isMember = JSON.parse(storedMembership); // Parse the stored boolean
              console.log(`Membership status loaded from localStorage: ${this.isMember}`);
            } else {
              // If nothing in localStorage, assume not a member by default for this user/community
              this.isMember = false;
              console.warn('No membership status found in localStorage for this user/community. Defaulting to not a member.');
            }
          } else {
            this.isMember = false; // Not logged in, so definitely not a member
            console.warn('User not logged in. Cannot check or store membership status.');
          }

        } else {
          console.warn('Community not found:', this.community);
        }
      }).catch(error => {
        console.error('Error loading community:', error);
      });

    },
    isValidUrl(string) {
      try {
        new URL(string);
        return true;
      } catch (e) {
        return false;
      }
    },
    async handleCommunityAction() {
      if (!this.currentUser || !this.currentUser.userId) {
        console.warn('User not logged in. Cannot perform community action.');
        return;
      }

      const communityService = new CommunityApiService();
      const communityId = this.community.id;
      const userClientId = this.currentUser.userId;
      const localStorageKey = this.getMembershipLocalStorageKey(communityId, userClientId);

      try {
        if (this.isMember) {
          await communityService.leaveCommunity(communityId, userClientId);
          this.isMember = false; // Update state
          localStorage.setItem(localStorageKey, JSON.stringify(false));
          console.log('Successfully left community and updated localStorage.');
        } else {
          await communityService.joinCommunity(communityId, userClientId);
          this.isMember = true; // Update state
          localStorage.setItem(localStorageKey, JSON.stringify(true));
          console.log('Successfully joined community and updated localStorage.');
        }
      } catch (error) {
        console.error('Error performing community action:', error);
      }
    },
    async makePost() {
      try {
        const derived = new PostApiService();
        const currentUser = AuthService.getCurrentUser();

        if (!this.community || !this.community.id || !currentUser || !currentUser.username) {
          console.error('Missing community ID or currentUser username:', this.community, currentUser);
          return;
        }
        if (!this.newPost.content || !this.newPost.content.trim()) {
          return;
        }
        if (!this.isValidUrl(this.newPost.img)) {
          return;
        }

        console.log('Community ID for post:', this.community.id);
        console.log('Current User Username for post:', currentUser.username);

        const payloadToSend = {
          username: currentUser.username,
          content: this.newPost.content,
          img: this.newPost.img
        };

        const createdPost = await derived.createPost(payloadToSend, this.community.id);

        if (createdPost && createdPost.id) {
          this.posts.push(createdPost);
          this.newPost.content = '';
          this.newPost.img = '';

        } else {
          console.error('Backend did not return a valid post object:', createdPost);
        }
      } catch (error) {
        console.error('Error posting:', error); // Changed from 'Error posting!!!' for clarity
      }
    }
  },
  mounted() { // Al iniciar el componente, automáticamente se carga la información de comunidades en la Fake API
    this.loadInfo();
  }
}
</script>

<template>

  <div class="community__container" v-if="community">
    <aside class="community__sidebar">
      <img :src="community.banner" class="community__sidebar-img" :alt="community.name" />
    </aside>

    <div class="community__sidebar-pfp">
      <img :src="community.image" class="community__sidebar-pfp-img" :alt="community.name" />
    </div>

    <main class="community__content">
      <header class="title__container">
        <h1 class="h1__title">{{ community.name }}</h1>
        <h2 class="h2__title">{{ $t(`genres.${displayedGenreKey}`) }}</h2>
        <p>{{ community.description }}</p>
        <button
            class="title__container-btn"
            @click="handleCommunityAction()"
            :aria-label="buttonText"
        >
          {{ buttonText }}
        </button>
      </header>

      <section class="community__content-interaction">
        <div class="community__content-post">
          <form @submit.prevent="makePost">
            <textarea v-model="newPost.content" :placeholder="$t('comm.thoughts')"></textarea>
            <input type="url" v-model="newPost.img" :placeholder="$t('comm.image')" />
            <button type="submit" class="" aria-label="Publish post">{{ $t("comm.post")}}</button>
          </form>
        </div>

        <div class="community__content-tweets">
          <article
              v-for="post in this.posts.slice().reverse()"
              :key="post.id"
              class="community__tweets-post"
          >
            <div class="post-user">@{{ post.username }}</div>
            <div :class="['post-content', { 'no-image': !post.img }]">
              <p>{{ post.content }}</p>
              <img v-if="post.img" :src="post.img" :alt="post.content" />
            </div>
          </article>
        </div>
      </section>
    </main>
  </div>


</template>

<style scoped>

.community__container {
  display: flex;
}

.community__sidebar {
  width: 15%;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 998;
}

.community__sidebar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.community__sidebar-pfp {
  width: 180px;
  height: 180px;
  position: fixed;
  top: 14rem;
  left: 12rem;
  z-index: 999;
}

.community__sidebar-pfp-img {
  border-radius: 8px;
  width: 100%;
  height: 100%;
  object-fit: cover;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.4);
}

.community__content {
  margin: 0 0 0 calc(15% + 90px);
  padding: 2rem;
  width: calc(100% - (15% + 90px));
  height: 100%;
  overflow-y: auto;
}

.community__content::-webkit-scrollbar {
  display: none;
}

.community__content header {
  border-bottom: 3px solid var(--color-blue);
}

.community__content-interaction {
  padding: 2rem;
}

.community__content-post {
  background: var(--color-light);
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
  margin-bottom: 2rem;
}

.community__content-post form {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
}

.community__content-post textarea,
.community__content-post input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 10px;
  background-color: var(--color-background);
  font-family: var(--font-primary);
  font-size: 1rem;
  color: var(--color-text);
}

.community__content-post textarea {
  background-color: rgba(var(--color-blue-rgb), 0.15);
}

.community__content-post textarea:focus,
.community__content-post input:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-secondary);
}

.community__content-tweets {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(600px, 1fr));
  gap: 2rem;
}

.community__tweets-post {
  background: var(--color-light);
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
}

.post-user {
  font-weight: bold;
  color: var(--color-blue);
  margin-bottom: 0.5rem;
}

.post-content {
  display: flex;
  flex: 1;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
}

.post-content p {
  flex: 0 0 70%;
  margin-right: 1rem;
  font-size: 0.8rem;
}

.post-content img {
  flex: 0 0 25%;
  height: 150px;
  max-width: 150px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.post-content.no-image p {
  flex: 0 0 100%;
  margin-right: 0;
}

.post-content.no-image img {
  display: none;
}

</style>