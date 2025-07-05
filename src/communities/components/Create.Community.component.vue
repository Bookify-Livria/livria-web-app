<script>
import { CommunityApiService } from '../service/community-api.service'

export default {
  name: 'CreateCommunity',
  data() {
    return {
      newCommunity: {
        name: '',
        description: '',
        type: 0,
        image: '',
        banner: ''
      },
      genres: [
        { value: 0, key: 'literature' },
        { value: 1, key: 'non_fiction' },
        { value: 2, key: 'fiction' },
        { value: 3, key: 'mangas_comics' },
        { value: 4, key: 'juvenile' },
        { value: 5, key: 'children' },
        { value: 6, key: 'ebooks_audiobooks' }
      ]
    }
  },
  methods: {
    saveCommunity() { // Permite registrar una nueva comunidad
      const service = new CommunityApiService()

      const newId = this.posts?.length
          ? (Math.max(...this.posts.map(p => parseInt(p.id))) + 1)
          : 1;

      const neww = { ...this.newCommunity, id: newId }
      service.createCommunity(neww).then(() => {
        this.$emit('created', neww)
        this.newCommunity = { name: '', description: '', type: 0, image: '', banner: ''}
      })
    },
    closeForm() { // Emite el evento "close" al cerrar el formulario
      this.$emit('close')
    }
  }
}
</script>

<template>
  <div>
    <div id="overlay" @click="closeForm"></div>
    <div id="formContainer" aria-label="Form container">
      <form @submit.prevent="saveCommunity">
        <div class="top-group">
          <div class="form-group">
            <label>{{ $t("form.name")}}</label>
            <input type="text" v-model="newCommunity.name" class="form-input-orange" required>
          </div>
          <div class="same-line">
            <label>{{ $t("form.category")}}</label>
            <select id="genre-filter" v-model="newCommunity.type" class="form-input-orange" required>
              <option :value="0" disabled>{{ $t("form.select_category") }}</option>
              <option v-for="genre in genres" :key="genre.value" :value="genre.value">
                {{ $t(`genres.${genre.key}`) }}
              </option>
            </select>
          </div>
        </div>
        <div class="bottom-group">
          <div class="form-group">
            <label>{{ $t("form.description")}}</label>
            <textarea v-model="newCommunity.description" class="form-input" required></textarea>
          </div>
          <div class="form-group">
            <label>{{ $t("form.image")}}</label>
            <input type="url" v-model="newCommunity.image" class="form-input" required>
          </div>
          <div class="form-group">
            <label>{{ $t("form.sidebar")}}</label>
            <input type="url" v-model="newCommunity.banner" class="form-input" required>
          </div>
        </div>
        <button type="submit">{{ $t('create-community')}}</button>
      </form>
    </div>
  </div>
</template>

<style scoped>

*{
  outline: none;
}

#overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 998;
}

#formContainer {
  margin: 10rem calc(-1 * ((100vw - 100%) / 2)) 0;
  color: var(--color-accent-light-yellow);
  width: 500px;
  position: fixed;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: var(--color-background);
  padding: 2rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  z-index: 999;
}

#formContainer form {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.top-group {
  width: 100%;
  border-bottom: 1px solid var(--color-text);
  color: var(--color-accent-orange);
  padding-bottom: 2rem;
}

.bottom-group {
  width: 100%;
  color: var(--color-primary);
  padding-top: 1rem;
}

.form-input-orange,
.form-input {
  background-color: rgba(var(--color-accent-yellow-rgb), 0.15);
  margin: 0;
  padding: 1rem;
  width: 100%;
  border-radius: 5px;
  border: 1px solid var(--color-background);
}

.form-input-orange {
  background-color: rgba(var(--color-accent-orange-rgb), 0.15);
}

.form-input,
.form-input-orange,
textarea {
  color: var(--color-text);
  resize: none;
}

.form-input::placeholder,
textarea::placeholder {
  color: var(--color-accent-light-yellow);
  font-family: var(--font-primary);
}

.form-input:focus {
  border-color: var(--color-background);
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 0.5rem;
  margin-bottom: 1rem;
  align-items: flex-start;
}

.same-line {
  display: flex;
  align-items: center;
  gap: 1rem;
}

</style>
