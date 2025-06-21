<script>
import { BookApiService } from '../../commerce/books/services/book-api.service.js';

export default {
  name: "inventoryDashboard",
  data() {
    return {
      books: [],
      genres: [],
      stats: {
        totalBooks: 0,
        totalGenres: 0,
        averagePrice: 0,
        mostReviewedBook: null,
        booksInStock: 0,
        bestSellingBook: null
      },
      loading: true,
      selectedGenre: 'all',
      selectedLanguage: 'all',
      sortOption: 'title',
      searchQuery: '',
      showEditModal: false,
      currentBook: null,
      newStock: 0,
      formErrors: {},

      // Language options
      languages: [
        { code: 'es', name: 'Español' },
        { code: 'en', name: 'English' },
      ]
    };
  },
  computed: {
    filteredBooks() {
      let filtered = [...this.books];

      // Filter by genre
      if (this.selectedGenre !== 'all') {
        filtered = filtered.filter(book => book.genre === this.selectedGenre);
      }

      // Filter by language
      if (this.selectedLanguage !== 'all') {
        filtered = filtered.filter(book => book.language === this.selectedLanguage);
      }

      // Filter by search query
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(book =>
            book.title.toLowerCase().includes(query) ||
            book.author.toLowerCase().includes(query)
        );
      }

      // Sort books
      filtered.sort((a, b) => {
        switch (this.sortOption) {
          case 'title':
            return a.title.localeCompare(b.title);
          case 'price_asc':
            return a.purchasePrice - b.purchasePrice;
          case 'price_desc':
            return b.purchasePrice - a.purchasePrice;
          case 'reviews':
            return (b.reviews?.length || 0) - (a.reviews?.length || 0);
          default:
            return 0;
        }
      });
      return filtered;
    }
  },
  methods: {
    async loadBooks() {
      try {
        this.loading = true;
        const service = new BookApiService();
        const data = await service.getBooks();

        this.books = data.map(book => ({
          ...book,
          newStock: 0 // Temporary property for the quantity input, initialized to 0
        }));

        // Extract unique genres
        const uniqueGenres = [...new Set(data.map(book => book.genre))];
        this.genres = uniqueGenres;

        // Calculate statistics
        this.calculateStats(data);

        this.loading = false;
      } catch (error) {
        console.error('Error loading books:', error);
        this.loading = false;
      }
    },
    calculateStats(books) {
      if (!books.length) {
        // Reset stats if no books
        this.stats = {
          totalBooks: 0,
          totalGenres: 0,
          averagePrice: 0,
          mostReviewedBook: null,
          booksInStock: 0,
          bestSellingBook: null
        };
        return;
      }

      this.stats.totalBooks = books.length;
      this.stats.totalGenres = [...new Set(books.map(book => book.genre))].length;

      // Calculate average salePrice
      const totalPrice = books.reduce((sum, book) => sum + (book.salePrice || 0), 0);
      this.stats.averagePrice = books.length > 0 ? totalPrice / books.length : 0;

      // Find most reviewed book
      let mostReviewed = null;
      if (books.length > 0) {
        mostReviewed = books[0]; // Initialize with the first book
        books.forEach(book => {
          if ((book.reviews?.length || 0) > (mostReviewed.reviews?.length || 0)) {
            mostReviewed = book;
          }
        });
      }
      this.stats.mostReviewedBook = mostReviewed;

      // Count books in stock
      this.stats.booksInStock = books.filter(book => book.stock > 0).length;

      // Find best selling book
      let bestSelling = null;
      if (books.length > 0) {
        bestSelling = books[0]; // Initialize with the first book
        books.forEach(book => {
          // Assuming 'sales' property exists and represents sales count
          if ((book.sales || 0) > (bestSelling.sales || 0)) {
            bestSelling = book;
          }
        });
      }
      this.stats.bestSellingBook = bestSelling;
    },
    getLanguageName(code) {
      const lang = this.languages.find(lang => lang.code === code);
      return lang ? lang.name : code;
    },
    getAmount(book) {
      const quantityToAdd = parseFloat(book.newStock) || 0;
      const amount = book.purchasePrice * quantityToAdd;
      // Format as Peruvian Sol (S/) for clarity
      return `S/ ${amount.toFixed(2)}`;
    },
    // New method to handle adding stock
    async addStock(book) {
      const quantityToAdd = parseInt(book.newStock);

      if (isNaN(quantityToAdd) || quantityToAdd <= 0) {
        return;
      }
      try {
        const service = new BookApiService();
        const newTotalStock = book.stock + quantityToAdd;

        await service.updateStockByBookId(book.id, newTotalStock);

        book.stock = newTotalStock;
        book.newStock = 0;

        this.calculateStats(this.books);

      } catch (error) {
        console.error(`Error al actualizar el stock de "${book.title}":`, error);
      }
    }
  },
  mounted() {
    this.loadBooks();
  }
};
</script>

<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h1 class="dashboard-title">{{ $t('dashboard.title') }}</h1>
    </div>

    <div v-if="loading" class="dashboard-loading">
      <p>{{ $t('dashboard.loading') }}</p>
    </div>

    <div v-else class="dashboard-content">
      <!-- Coming Soon -->
      <div class="system-info">
        <h3 class="system-info-h3">{{ $t('dashboard.inventory.add-books') }}</h3>
        <h3 class="h1__title">{{ $t('coming-soon') }}</h3>
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

      <div class="orders-table-container">
        <table class="orders-table">
          <thead>
          <tr>
            <th>{{ $t('dashboard.inventory.cover') }}</th>
            <th>{{ $t('dashboard.inventory.title') }}</th>
            <th>{{ $t('dashboard.inventory.author') }}</th>
            <th>{{ $t('dashboard.inventory.genre') }}</th>
            <th>{{ $t('dashboard.inventory.lang') }}</th>
            <th>{{ $t('dashboard.inventory.stock') }}</th>
            <th>{{ $t('dashboard.inventory.purchase-price') }}</th>
            <th>{{ $t('dashboard.inventory.quantity') }}</th>
            <th>{{ $t('dashboard.inventory.amount') }}</th>
            <th>{{ $t('dashboard.inventory.add') }}</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="book in filteredBooks" :key="book.id">
            <td>
              <img :src="book.cover" alt="Book Cover" class="book-cover"/>
            </td>
            <td>
              <div class="customer-info">
                <div class="customer-name"><strong>{{ book.title }}</strong></div>
              </div>
            </td>
            <td>
              <div class="customer-info">
                <div class="customer-name">{{ book.author }}</div>
              </div>
            </td>
            <td>
              <div class="customer-info">
                <div class="customer-name" style="text-transform: capitalize">{{ book.genre }}</div>
              </div>
            </td>
            <td>
              <div class="customer-info">
                <div class="customer-name" style="text-transform: uppercase">{{ book.language }}</div>
              </div>
            </td>
            <td>
              <div class="customer-info">
                <div class="customer-name">{{ book.stock }}</div>
              </div>
            </td>
            <td>
              <div class="customer-info">
                <div class="customer-name">S/ {{ book.purchasePrice }}</div>
              </div>
            </td>
            <td>
              <input
                  type="number"
                  v-model="book.newStock"
                  style="padding: 0.3rem 0.5rem; border-radius: 6px; width: 3.5rem"
              />
            </td>
            <td>
              <div class="customer-info">
                <div class="customer-name">{{ getAmount(book) }}</div>
              </div>
            </td>
            <td>
              <button style="padding: 0.3rem 0.5rem" @click="addStock(book)">
                <i class="pi pi-plus"></i>
              </button>
            </td>
          </tr>
          </tbody>
        </table>

        <div v-if="filteredBooks.length === 0" class="no-results">
          <p>{{ $t('dashboard.no-books-found') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

.system-info {
  background-color: rgba(var(--color-accent-yellow-rgb), 0.05);
  border-radius: 10px;
  padding: 0.75rem 1.5rem 1.5rem;
  margin-bottom: 3rem;
}

.system-info-h3 {
  font-size: 1.2rem;
  color: var(--color-primary);
  margin-bottom: 1rem;
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

.orders-table-container {
  width: 100%;
  overflow-x: auto;
  margin-top: 2rem;
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  color: var(--color-text);
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  border-radius: 8px;
  overflow: hidden;
}

.orders-table th,
.orders-table td {
  padding: 1rem;
  text-align: center;
  border-bottom: 1px solid #eaeaea;
  max-width: 250px;
}

.orders-table thead {
  background-color: #f8f9fa;
}

.orders-table th {
  font-weight: 600;
  color: #222;
  text-transform: capitalize;
  white-space: nowrap;
}

.orders-table tbody tr:hover {
  background-color: #f2f8fc;
}

.customer-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.customer-name {
  font-weight: 500;
  color: #222;
}

.book-cover {
  width: 60px;
  height: 90px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.no-results {
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem;
  color: var(--color-text);
  opacity: 0.7;
}

@media (max-width: 768px) {
  .filter-controls {
    flex-direction: column;
    gap: 1rem;
  }

}

@media (max-width: 480px) {
  .dashboard-container {
    padding: 1rem;
  }
}
</style>