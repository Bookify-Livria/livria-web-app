<script>
import BookItem from './book-item.component.vue'
import { BookApiService } from '../services/book-api.service.js'
import { FavoriteApiService} from "../services/favorite-api.service.js";
import { UserApiService } from "../../../subscription/service/user-api.service.js";
import { RecommendationsApiService } from "../services/recommendations-api.service.js";
import AuthService from "../../../public/shared-services/authentication.service.js";

export default {
  name: "recommended-books",
  components: {
    BookItem
  },
  data() {
    return {
      books: [],
      allAvailableBooks: [],
      recommendedBooksPool: [],
      loading: true,
      error: null,
      currentUser: null
    };
  },
  methods : {
    async initializeRecommendations() { // Función que se encarga de seleccionar los recomendados
      this.loading = true;
      this.error = null;
      try {
        this.currentUser = await AuthService.getCurrentUser();
        if (!this.currentUser || !this.currentUser.userId) {
          this.error = "User not logged in or user ID not available.";
          this.loading = false;
          return;
        }
        const userClientId = this.currentUser.userId;

        const recommendationsApiService = new RecommendationsApiService();
        let recommendedBooks = [];
        try {
          const apiResponse = await recommendationsApiService.getRecommendations(userClientId);
          recommendedBooks = apiResponse.recommendedBooks || [];
        } catch (err) {
          console.warn("Could not fetch user-specific recommendations, falling back to general pool.", err);
        }

        // Fetch all books for fallback if recommendations are empty or unavailable
        const bookApiService = new BookApiService();
        this.allAvailableBooks = await bookApiService.getBooks();

        // Get banned books from localStorage
        const bannedBooks = JSON.parse(localStorage.getItem('bannedBooks')) || [];

        // Filter out banned books from recommendedBooks first
        let filteredRecommendedBooks = recommendedBooks.filter(recBook =>
            !bannedBooks.some(bannedBook => bannedBook.id === recBook.id)
        );

        // If filteredRecommendedBooks is empty, use allAvailableBooks (after filtering banned) as the pool
        if (filteredRecommendedBooks.length === 0) {
          this.recommendedBooksPool = this.allAvailableBooks.filter(book =>
              !bannedBooks.some(bannedBook => bannedBook.id === book.id)
          );
        } else {
          this.recommendedBooksPool = filteredRecommendedBooks;
        }

        this.displayRandomSixBooks();

      } catch (err) {
        console.error("Error al inicializar recomendaciones:", err);
        this.error = "Failed to load recommendations: " + err.message;
      } finally {
        this.loading = false;
      }
    },
    displayRandomSixBooks() { // Muestra 6 libros aleatorios
      if (this.recommendedBooksPool.length === 0) {
        this.books = [];
        return;
      }
      let tempPool = [...this.recommendedBooksPool];
      const selectedBooks = [];

      const numberOfBooksToSelect = Math.min(6, tempPool.length);

      for (let i = 0; i < numberOfBooksToSelect; i++) {
        const randomIndex = Math.floor(Math.random() * tempPool.length);
        selectedBooks.push(tempPool[randomIndex]);
        tempPool.splice(randomIndex, 1);
      }

      this.books = selectedBooks;
    },
    refreshRecommendations() { // Refresca la selección de libros recomendados
      this.displayRandomSixBooks();
    }
  },
  mounted() {
    this.initializeRecommendations();
  }
};
</script>

<template>
  <div class="recommended__container" aria-label="Recommended books">
    <div class="recommended__cards">
      <div
          v-for="book in books"
          :key="book.id"
          class="custom-card-wrapper"
      >
        <BookItem :book="book" aria-label="Book information"/>
      </div>
    </div>
    <button
        @click="refreshRecommendations"
        :disabled="loading || recommendedBooksPool.length === 0"
        style="width: 100px; align-self: center"
    >{{ $t('Refresh') }}
    </button>
  </div>
</template>

<style scoped>
.recommended__container {
  padding-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.recommended__cards {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 2rem;
}

.custom-card-wrapper {
  margin: 0;
  height: 100%;
}
</style>