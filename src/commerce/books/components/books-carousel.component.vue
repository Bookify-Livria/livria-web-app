<script>
import { BookApiService } from '../services/book-api.service.js'
import BookItem from './book-item.component.vue'

export default {
  name: 'BookCarousel',
  components: {
    BookItem,
  },
  props: {
    genre: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      books: [],
      responsiveOptions: [
        { breakpoint: '1199px', numVisible: 3, numScroll: 1 },
        { breakpoint: '767px', numVisible: 2, numScroll: 1 },
        { breakpoint: '575px', numVisible: 1, numScroll: 1 }
      ]
    }
  },
  mounted() {
    const service = new BookApiService() // Al iniciar el componente, obtiene la información de todos los libros almacenados en la Fake API
    service.getBooks().then(data => {
      this.books = data.filter(book => book.genre?.toLowerCase() === this.genre.toLowerCase())
    })
  }
}
</script>

<template>
  <div class="book-carousel-container">
    <pv-carousel
        :value="books"
        :numVisible="6"
        :numScroll="1"
        :responsiveOptions="responsiveOptions"
        circular
        :autoplayInterval="5000"
        showNavigators
        aria-label="Book carousel section"
    >
      <template #item="slotProps">
        <div class="card-wrapper">
          <BookItem :book="slotProps.data" />
        </div>
      </template>
    </pv-carousel>
  </div>
</template>

<style scoped>
.book-carousel-container {
  width: 100%;
  padding: 0 2rem;
  margin: 0;
}

.card-wrapper {
  margin: 1rem;
}

</style>

