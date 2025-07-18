<script>
import Card from 'primevue/card'
import Button from 'primevue/button'
import CreateCommunity from './Create.Community.component.vue'
import { CommunityApiService } from '../service/community-api.service'

export default {
  name: 'CommunityGrid',
  components: {
    Card,
    Button,
    CreateCommunity
  },

  data() {
    return {
      communities: [],
      showForm: false
    }
  },
  mounted() { // AL iniciar el componente, se carga automáticamente la información de comunidades en la Fake API
    this.fetchCommunities()
  },
  methods: {
    fetchCommunities() { // Permite cargar la información de comunidades dentro de la Fake API
      const service = new CommunityApiService()
      service.getCommunities().then(data => {
        this.communities = data
      })
    },
    showCreateForm() { // Permite mostrar un formulario
      this.showForm = true
    },
    hideCreateForm() { // Permite ocultar un formulario
      this.showForm = false
    },
    handleCommunityCreated(newCommunity) { // Permite registar una nueva comunidad y cierra el formulario de creación automáticamente
      this.communities.push(newCommunity)
      this.hideCreateForm()
    },
    goToDetail(community) { // Permite al usuario acceder a la pantalla de "más información" para una respectiva comunidad
      this.$router.push({ name: 'CommunityView', params: { name: community.name } })
    }
  }
}
</script>

<template>
  <div class="community-grid">
    <!-- Create Button -->
    <div class="custom-card-wrapper">
      <pv-card class="create-card" aria-label="Create community section">
        <template #content>
          <div class="create-content">
            <div class="plus-box" @click="showCreateForm">
              <span class="plus-sign">+</span>
            </div>
            <p class="create-text">{{ $t('create-community')}}</p>
          </div>
        </template>
      </pv-card>
    </div>
    <!-- Communities Grid -->
    <div
        v-for="community in [...communities].reverse()"
        :key="community.id"
        class="custom-card-wrapper"
    >
      <pv-card>
        <template #header>
          <img :src="community.image" :alt="community.name" class="community-cover" />
        </template>
        <template #title>
          <div class="community-title" aria-label="Commnity title">{{ community.name }}</div>
        </template>
        <template #footer>
          <div class="flex justify-end">
            <button @click="goToDetail(community)" class="see-more-btn" aria-label="See more for community">{{$t('see-more')}}</button>
          </div>
        </template>
      </pv-card>
    </div>

    <CreateCommunity v-if="showForm" @close="hideCreateForm" @created="handleCommunityCreated" />
  </div>
</template>

<style scoped>
.community-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 2.5rem;
  padding: 0;
}

.custom-card-wrapper {
  width: 250px;
  background-color: #f9f9f9;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 3px 2px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: .3s;
}

.custom-card-wrapper:hover{
  transform: scale(1.02);
}

.community-cover {
  width: 100%;
  height: 220px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: .5s;
}

.community-title {
  font-size: 1.1rem;
  font-weight: bold;
  text-align: left;
  margin-top: 0.75rem;
  color: #333;
  text-align: center;
}

.create-card {
  text-align: center;
  justify-content: center;
  display: flex;
  align-items: center;
  height: 100%;
}

.create-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 1rem;
}

.plus-box {
  width: 210px;
  height: 210px;
  border: 1px solid #b2ebf2;
  background-color: #e0f7fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.plus-box:hover {
  background-color: #b2ebf2;
}

.plus-sign {
  font-size: 48px;
  color: #81d4fa;
  line-height: 1;
}

.create-text {
  font-size: 1rem;
  font-weight: bold;
  margin-top: 1rem;
  color: #f4511e;
  text-transform: uppercase;
}

.see-more-btn {
  background-color: transparent;
  border: none;
  color: var(--color-accent-yellow);
}

.see-more-btn:hover {
  color: var(--color-accent-orange);
}


</style>
