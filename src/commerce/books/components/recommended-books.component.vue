<script>
import BookItem from './book-item.component.vue'
import { BookApiService } from '../services/book-api.service.js'
import { FavoriteApiService} from "../services/favorite-api.service.js";
import { BannedApiService} from "../services/banned-api.service.js";
import { UserApiService } from "../../../subscription/service/user-api.service.js";

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
    };
  },
  methods : {
    async initializeRecommendations() { // Función que se encarga de seleccionar los recomendados
      this.loading = true;
      this.error = null;
      try {
        const bookApi = new BookApiService();
        const favoriteApi = new FavoriteApiService();
        const bannedApi = new BannedApiService();
        const userApi = new UserApiService();

        this.allAvailableBooks = await bookApi.getBooks();

        const loggedInUsers = await userApi.getLoggedInUser();
        const currentUser = loggedInUsers.length > 0 ? loggedInUsers[0] : null;

        let potentialRecommendations = [...this.allAvailableBooks];

        if (currentUser) {
          const allFavorites = await favoriteApi.getFavorites();
          const userFavorites = allFavorites.filter(f => f.userId === currentUser.id);

          const allBanned = await bannedApi.getBanned();
          const userBanned = allBanned.filter(b => b.userId === currentUser.id);

          const favoriteGenres = new Set();
          userFavorites.forEach(fav => {
            const book = this.allAvailableBooks.find(b => b.id === fav.bookId);
            if (book && book.genre) {
              favoriteGenres.add(book.genre);
            }
          });

          if (favoriteGenres.size > 0) {
            potentialRecommendations = this.allAvailableBooks.filter(book =>
                favoriteGenres.has(book.genre)
            );
          }

          const bannedBookIds = new Set(userBanned.map(b => b.bookId));
          this.recommendedBooksPool = potentialRecommendations.filter(book =>
              !bannedBookIds.has(book.id)
          );
        } else {
          // Si no hay usuario logueado, el pool de recomendaciones es simplemente todos los libros disponibles
          this.recommendedBooksPool = [...this.allAvailableBooks];
        }

        this.displayRandomSixBooks();

      } catch (err) {
        console.error("Error al inicializar recomendaciones:", err);
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

      for (let i = 0; i < 6 && tempPool.length > 0; i++) {
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