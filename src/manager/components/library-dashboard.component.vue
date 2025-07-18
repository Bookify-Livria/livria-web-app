<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { BookApiService } from '../../commerce/books/services/book-api.service.js'
import {ReviewApiService} from "../../commerce/books/services/review-api.service.js";

export default {
  name: "libraryDashboard",
  setup() {
    const router = useRouter();
    const books = ref([]);
    const reviews = ref([]);
    const genres = ref([]);
    const stats = ref({
      totalBooks: 0,
      totalGenres: 0,
      averagePrice: 0,
      mostReviewedBook: null,
      booksInStock: 0
    });
    const loading = ref(true);
    const selectedGenre = ref('all');
    const selectedLanguage = ref('all');
    const sortOption = ref('title');
    const searchQuery = ref('');
    const showEditModal = ref(false);
    const currentBook = ref(null);
    const formErrors = ref({});

    // Language options
    const languages = ref([
      { code: 'es', name: 'Español' },
      { code: 'en', name: 'English' },
    ]);

    const bookReviewCounts = ref(new Map());

    const loadBooks = async () => {
      try {
        loading.value = true;
        const service = new BookApiService();
        const data = await service.getBooks();
        books.value = data;

        const reviewsService = new ReviewApiService();
        const allReviews = await reviewsService.getReviews();
        reviews.value = allReviews;

        const tempBookReviewCounts = new Map();
        allReviews.forEach(review => {
          if (review.bookId) {
            tempBookReviewCounts.set(review.bookId, (tempBookReviewCounts.get(review.bookId) || 0) + 1);
          }
        });
        bookReviewCounts.value = tempBookReviewCounts;

        // Extract unique genres
        const uniqueGenres = [...new Set(data.map(book => book.genre))];
        genres.value = uniqueGenres;

        // Calculate statistics
        calculateStats(data);

        loading.value = false;
      } catch (error) {
        console.error('Error loading books:', error);
        loading.value = false;
      }
    };

    const calculateStats = (books) => {
      if (!books.length) {
        // Reset stats if no books
        stats.value = {
          totalBooks: 0,
          totalGenres: 0,
          averagePrice: 0,
          mostReviewedBook: null,
          booksInStock: 0
        };
        return;
      }
      stats.value.totalBooks = books.length;
      stats.value.totalGenres = [...new Set(books.map(book => book.genre))].length;

      // Calculate average salePrice
      const totalPrice = books.reduce((sum, book) => sum + book.salePrice, 0);
      stats.value.averagePrice = totalPrice / books.length;

      // Find most reviewed book using bookReviewCounts
      let mostReviewed = null;
      let maxReviews = -1;

      books.forEach(book => {
        const currentBookReviews = bookReviewCounts.value.get(book.id) || 0;
        if (currentBookReviews > maxReviews) {
          maxReviews = currentBookReviews;
          mostReviewed = book;
        }
      });
      stats.value.mostReviewedBook = mostReviewed;

      // Count books in stock
      stats.value.booksInStock = books.reduce((total, book) => total + book.stock, 0);
    };

    const filteredBooks = computed(() => {
      let filtered = [...books.value];

      // Filter by genre
      if (selectedGenre.value !== 'all') {
        filtered = filtered.filter(book => book.genre === selectedGenre.value);
      }

      // Filter by language
      if (selectedLanguage.value !== 'all') {
        filtered = filtered.filter(book => book.language === selectedLanguage.value);
      }

      // Filter by search query
      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(book =>
            book.title.toLowerCase().includes(query) ||
            book.author.toLowerCase().includes(query)
        );
      }

      // Sort books
      filtered.sort((a, b) => {
        switch (sortOption.value) {
          case 'title':
            return a.title.localeCompare(b.title);
          case 'price_asc':
            return a.salePrice - b.salePrice;
          case 'price_desc':
            return b.salePrice - a.salePrice;
          case 'reviews':
            return (b.reviews?.length || 0) - (a.reviews?.length || 0);
          default:
            return 0;
        }
      });

      return filtered;
    });

    const viewBook = (book) => {
      currentBook.value = { ...book };
      showEditModal.value = true;
      formErrors.value = {};
    };

    const closeModal = () => {
      showEditModal.value = false;
      currentBook.value = null;
    };

    const getLanguageName = (code) => {
      const lang = languages.value.find(lang => lang.code === code);
      return lang ? lang.name : code;
    };

    const getBookReviewCount = (bookId) => {
      return bookReviewCounts.value.get(bookId) || 0;
    };

    onMounted(() => {
      loadBooks();
    });

    return {
      books,
      genres,
      stats,
      loading,
      selectedGenre,
      selectedLanguage,
      sortOption,
      searchQuery,
      filteredBooks,
      showEditModal,
      currentBook,
      formErrors,
      languages,
      viewBook,
      closeModal,
      getLanguageName,
      getBookReviewCount
    };
  }
};
</script>

<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h1 class="dashboard-title">{{ $t('dashboard.title') }}</h1>
      <p class="dashboard-subtitle">{{ $t('dashboard.subtitle') }}</p>
    </div>

    <div v-if="loading" class="dashboard-loading">
      <p>{{ $t('dashboard.loading') }}</p>
    </div>

    <div v-else class="dashboard-content">
      <!-- Stats Cards -->
      <div class="stats-container">
        <div class="stat-card">
          <h3>{{ $t('dashboard.total-books') }}</h3>
          <p class="stat-value">{{ stats.totalBooks }}</p>
        </div>
        <div class="stat-card">
          <h3>{{ $t('dashboard.total-genres') }}</h3>
          <p class="stat-value">{{ stats.totalGenres }}</p>
        </div>
        <div class="stat-card">
          <h3>{{ $t('dashboard.avg-price')  }}</h3>
          <p class="stat-value">S/ {{ stats.averagePrice.toFixed(2) }}</p>
        </div>
        <div class="stat-card">
          <h3>{{ $t('dashboard.books-in-stock') }}</h3>
          <p class="stat-value">{{ stats.booksInStock }}</p>
        </div>
        <div class="stat-card">
          <h3>{{ $t('dashboard.most-reviewed') }}</h3>
          <p class="stat-value long">{{ stats.mostReviewedBook?.title || 'N/A' }}</p>
          <p class="stat-detail" v-if="stats.mostReviewedBook">
            {{ getBookReviewCount(stats.mostReviewedBook.id) }} {{ $t('dashboard.reviews')  }}
          </p>
        </div>
      </div>

      <!-- Filter and Search Options -->
      <div class="filter-section">
        <h2 class="h2__title" style="margin-bottom: 2rem">{{ $t('dashboard.book-collection') }}</h2>

        <div class="search-bar">
          <input
              type="text"
              v-model="searchQuery"
              :placeholder="$t('dashboard.search-books')"
              class="search-input"
          />
        </div>

        <div class="filter-controls">
          <div class="filter-group">
            <label for="genre-filter">{{ $t('dashboard.filter-by-genre') }}</label>
            <select id="genre-filter" v-model="selectedGenre" class="filter-select">
              <option value="all">{{ $t('dashboard.all-genres') }}</option>
              <option v-for="genre in genres" :key="genre" :value="genre">
                {{ $t(`genres.${genre}`) }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label for="language-filter">{{ $t('dashboard.filter-by-language') }}</label>
            <select id="language-filter" v-model="selectedLanguage" class="filter-select">
              <option value="all">{{ $t('dashboard.all-languages') }}</option>
              <option v-for="lang in languages" :key="lang.code" :value="lang.code">
                {{ lang.name }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label for="sort-by">{{ $t('dashboard.sort-by') }}</label>
            <select id="sort-by" v-model="sortOption" class="filter-select">
              <option value="title">{{ $t('dashboard.sort-title') }}</option>
              <option value="price_asc">{{ $t('dashboard.sort-price-asc') }}</option>
              <option value="price_desc">{{ $t('dashboard.sort-price-desc') }}</option>
              <option value="reviews">{{ $t('dashboard.sort-reviews') }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Books Grid -->
      <div class="books-grid">
        <div
            v-for="book in filteredBooks"
            :key="book.id"
            class="book-card"
        >
          <div class="book-cover">
            <img :src="book.cover" :alt="book.title" />
          </div>
          <div class="book-info">
            <h3 class="book-title">{{ book.title }}</h3>
            <p class="book-author">{{ book.author }}</p>
            <p class="book-price">S/ {{ book.salePrice.toFixed(2) }}</p>
            <div class="book-meta">
              <span class="book-language" style="text-transform: capitalize">{{ getLanguageName(book.language) }}</span>
              <span class="book-stock">Stock: {{ book.stock || 0 }}</span>
            </div>
            <div class="book-reviews">
              <span>{{ getBookReviewCount(book.id) }} {{ $t('dashboard.reviews') }}</span>
            </div>
            <div class="book-actions">
              <button class="btn-edit" @click="viewBook(book)">
                {{ $t('dashboard.view') }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="filteredBooks.length === 0" class="no-results">
          <p>{{ $t('dashboard.no-books-found') }}</p>
        </div>
      </div>
    </div>

    <!-- View Book Modal -->
    <div v-if="showEditModal" class="modal-backdrop">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ $t('dashboard.book.view-book') }}</h2>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body" v-if="currentBook">
          <div class="modal-body__upper-half">
            <div class="modal-body__left">
              <img :src="currentBook.cover" alt="Book Cover"/>
            </div>
            <div class="modal-body__right">
              <div class="modal-body__right-titles">
                <div class="modal-body__right-form-group">
                  <div class="h1__title" style="text-align: left">{{ currentBook.title }}</div>
                </div>
                <div class="modal-body__right-form-group">
                  <div class="h2__title">{{ currentBook.author }}</div>
                </div>
                <div class="modal-body__right-form-group">
                  <div><strong>{{ $t(`genres.${currentBook.genre}`) || currentBook.genre }}</strong></div>
                  <div style="text-transform: capitalize">{{ getLanguageName(currentBook.language) }}</div>
                </div>
              </div>
              <div class="modal-body__right-form-group">
                <div class="modal-body__right-column">
                  <label class="info-label">{{ $t('dashboard.book.buyprice') }}:</label>
                  <div class="price-value">S/ {{ currentBook.purchasePrice?.toFixed(2) }}</div>
                </div>
                <div class="modal-body__right-column">
                  <label class="info-label">{{ $t('dashboard.book.sellprice') }}:</label>
                  <div class="price-value">S/ {{ currentBook.salePrice?.toFixed(2) }}</div>
                </div>
              </div>
              <div class="modal-body__right-form-group" style="margin-top: auto;">
                <label class="info-label">{{ $t('dashboard.book.stock') }}:</label>
                <div class="info-value">{{ currentBook.stock }}</div>
              </div>
            </div>
          </div>
          <div class="modal-body__lower-half">
            <label class="info-label">{{ $t('synopsis') }}:</label>
            <div class="info-value">{{ currentBook.description }}</div>
          </div>

          <div class="form-group">
          </div>

        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeModal">{{ $t('dashboard.book.cancel')  }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

.modal-body__upper-half {
  display: flex;
  justify-content: space-between;
}

.modal-body__left {
  flex: 0 0 35%;
}

.modal-body__left img {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
}

.modal-body__right {
  flex: 0 0 60%;
  justify-content: space-between;
}

.modal-body__right-titles {
  margin-bottom: 2rem;
}

.modal-body__right-form-group {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.price-value {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-accent-orange);
  margin-bottom: 1rem;
}

.info-label {
  font-size: 0.8rem;
  color: #777;
  margin-bottom: 0.2rem;
}

.info-value {
  text-align: left;
}

.modal-body__lower-half {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: 2rem;
}

.dashboard-container {
  width: 100%;
  padding: 2rem;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.dashboard-title {
  font-size: 2.2rem;
  font-weight: bold;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.dashboard-subtitle {
  font-size: 1rem;
  color: var(--color-text);
  text-align: center;
  opacity: 0.8;
}

.dashboard-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  font-size: 1.2rem;
  color: var(--color-primary);
}

.dashboard-content {
  max-width: 1400px;
  margin: 0 auto;
}

.stats-container {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  margin-bottom: 2.5rem;
}

.stat-card {
  background-color: rgba(var(--color-secondary-rgb), 0.15);
  border-radius: 12px;
  width: 300px;
  padding: 2rem;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-card h3 {
  font-size: 0.9rem;
  color: var(--color-text);
  opacity: 0.8;
  margin: 0;
}

.stat-value {
  font-size: 1.4rem;
  font-weight: bold;
  color: var(--color-accent-orange);
  text-align: center;
}

.long {
  font-size: 1.2rem;
}

.stat-detail {
  font-size: 0.8rem;
  color: var(--color-text);
  text-align: center;
  opacity: 0.7;
  margin: 0;
}

.filter-section {
  margin-bottom: 2rem;
  border-bottom: 1px solid #eee;
  background-color: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 1.5rem;
}

.search-bar {
  margin-bottom: 1.5rem;
}

.search-input {
  width: 100%;
  padding: 0.8rem 1.2rem;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 1rem;
}

.filter-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.filter-group {
  flex: 1;
  min-width: 200px;
}

.filter-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: var(--color-text);
}

.filter-select {
  width: 100%;
  padding: 0.7rem 1rem;
  border-radius: 6px;
  border: 1px solid #ddd;
  background-color: white;
  font-size: 0.9rem;
  color: var(--color-text);
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
}

.book-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  background-color: var(--color-light);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.book-card:hover {
  transform: translateY(-5px);
}

.book-cover img {
  width: 135px;
  height: 210px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  margin: 2rem auto 0;
  display: block;
}

.book-info {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.book-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 0.05rem;
  margin-top: 0;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.book-author {
  font-size: 0.8rem;
  color: var(--color-text);
  margin-top: 0;
  margin-bottom: 0.25rem;
  text-align: center;
}

.book-price {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-blue);
  margin-bottom: 0.5rem;
  text-align: center;
}

.book-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--color-text);
  opacity: 0.7;
  margin-bottom: 0.25rem;
}

.book-reviews {
  font-size: 0.8rem;
  color: var(--color-text);
  opacity: 0.7;
  margin-bottom: 1rem;
}

.book-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
}

.btn-edit, .btn-view {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-edit {
  background-color: var(--color-primary);
  color: white;
}

.btn-edit:hover {
  background-color: #005a87;
}

.no-results {
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem;
  color: var(--color-text);
  opacity: 0.7;
}

/* Modal Styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  padding: 1rem;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  color: var(--color-primary);
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-text);
  opacity: 0.7;
}

.close-btn:hover {
  opacity: 1;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.2rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-row .form-group {
  flex: 1;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: var(--color-text);
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-cancel, .btn-save {
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-cancel {
  background-color: #f5f5f5;
  color: var(--color-text);
}

.btn-cancel:hover {
  background-color: #e0e0e0;
}

.btn-save {
  background-color: var(--color-primary);
  color: white;
}

.btn-save:hover {
  background-color: #005a87;
}

@media (max-width: 1200px) {
  .stats-container {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-container {
    grid-template-columns: repeat(2, 1fr);
  }

  .filter-controls {
    flex-direction: column;
    gap: 1rem;
  }

  .books-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}

@media (max-width: 480px) {
  .stats-container {
    grid-template-columns: 1fr;
  }

  .form-row {
    flex-direction: column;
    gap: 1.2rem;
  }

  .dashboard-container {
    padding: 1rem;
  }
}
</style>