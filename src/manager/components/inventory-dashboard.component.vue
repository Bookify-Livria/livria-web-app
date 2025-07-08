<script>
import { BookApiService } from '../../commerce/books/services/book-api.service.js';
import {UserApiService} from "../../subscription/service/user-api.service.js";

export default {
  name: "inventoryDashboard",
  data() {
    return {
      books: [],
      newBook: {
        title: '',
        author: '',
        description: '',
        genre: '',
        language: '',
        cover: '',
        stock: 0
      },
      selectedGenre: 'all',
      selectedLanguage: 'all',
      sortOption: 'title',
      searchQuery: '',
      showEditModal: false,
      currentBook: null,
      formErrors: {},
      admin: null,
      // Language options
      languages: [
        { code: 'es', name: 'Español', value: 'español' },
        { code: 'en', name: 'English', value: 'english' },
      ],
      genres: [
        { value: 0, key: 'literature' },
        { value: 1, key: 'non_fiction' },
        { value: 2, key: 'fiction' },
        { value: 3, key: 'mangas_comics' },
        { value: 4, key: 'juvenile' },
        { value: 5, key: 'children' },
        { value: 6, key: 'ebooks_audiobooks' }
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
        const service = new BookApiService();
        const data = await service.getBooks();

        this.books = data.map(book => ({
          ...book,
          newStock: 0 // Temporary property for the quantity input, initialized to 0
        }));

        const userApiService = new UserApiService();
        this.admin = await userApiService.getAdminUser();

      } catch (error) {
        console.error('Error loading books:', error);
      }
    },
    getLanguageName(code) {
      const lang = this.languages.find(lang => lang.code === code);
      return lang ? lang.name : code;
    },
    getAmount(book) {
      const quantityToAdd = parseFloat(book.newStock) || 0;
      const amount = book.purchasePrice * quantityToAdd;
      // Format as Peruvian Sol (S/) for clarity
      return amount.toFixed(2);
    },
    // New method to handle adding stock
    async addStock(book) {
      const quantityToAdd = parseInt(book.newStock);

      if (isNaN(quantityToAdd) || quantityToAdd <= 0) {
        this.$toast.add({severity:'warn', summary: 'Warning', detail:this.$t('purchase.invalid-quantity'), life:3000});
        return;
      }

      const amount = book.purchasePrice * quantityToAdd;

      if (this.admin.capital < amount) {
        this.$toast.add({severity:'error', summary: 'Error', detail:this.$t('purchase.no-money'), life:5000});
        return;
      }

      try {
        const service = new BookApiService();
        const newTotalStock = book.stock + quantityToAdd;

        await service.updateStockByBookId(book.id, newTotalStock);
        book.stock = newTotalStock;
        book.newStock = 0;

        if (this.admin) {
          this.admin.capital -= amount;
        }

      } catch (error) {
        console.error(`Error al actualizar el stock de "${book.title}":`, error);
      }
    },
    isValidUrl(string) {
      try {
        new URL(string);
        return true;
      } catch (e) {
        return false;
      }
    },
    async addNewBook() {
      try {
        const service = new BookApiService();

        if (!this.newBook.title.trim() || !this.newBook.author.trim() || !this.newBook.description.trim() ||
            !this.newBook.genre || !this.newBook.language || !this.newBook.cover.trim() ||
            this.newBook.stock < 0) {
          this.$toast.add({severity:'error', summary: 'Error', detail:this.$t('purchase.field-missing'), life:5000});
          return;
        }
        if (!this.isValidUrl(this.newBook.cover)) {
          return;
        }

        const bookToAdd = {
          title: this.newBook.title,
          description: this.newBook.description,
          author: this.newBook.author,
          stock: this.newBook.stock,
          cover: this.newBook.cover,
          genre: this.newBook.genre,
          language: this.newBook.language
        }

        const addedBook = await service.addNewBook(bookToAdd);

        if (addedBook && addedBook.id) {
          this.books.push(addedBook);
        } else {
          console.error('Backend did not return a valid book object after creation:', addedBook);
        }

        this.newBook.title = '';
        this.newBook.author = '';
        this.newBook.stock = 0;
        this.newBook.cover = '';
        this.newBook.genre = '';
        this.newBook.language = '';

      } catch (error) {
        console.error('Error adding book:', error);
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

    <div class="dashboard-content">
      <div class="system-info">
        <h2 class="h2__title" style="margin-bottom: 1rem">{{ $t('dashboard.inventory.add-books') }}</h2>
        <div class="inputs-block">
          <div class="left-block">
            <div class="form-group">
              <label>{{ $t("form.title")}}</label>
              <input type="text" v-model="newBook.title" class="form-input" required>
            </div>
            <div class="form-group">
              <label>{{ $t("form.author")}}</label>
              <input type="text" v-model="newBook.author" class="form-input" required>
            </div>
            <div class="form-group">
              <label>{{ $t("form.description")}}</label>
              <textarea v-model="newBook.description" class="form-input" required></textarea>
            </div>
          </div>
          <div class="right-block">
            <div class="form-group">
              <label>{{ $t("form.genre")}}</label>
              <select id="genre-filter" v-model="newBook.genre" class="form-input" required>
                <option :value="0" disabled>{{ $t("form.select_category") }}</option>
                <option v-for="genre in genres" :key="genre.value" :value="genre.key">
                  {{ $t(`genres.${genre.key}`) }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>{{ $t("form.language")}}</label>
              <select id="language-filter" v-model="newBook.language" class="form-input">
                <option value="all" disabled>{{ $t('dashboard.all-languages') }}</option>
                <option v-for="lang in languages" :key="lang.code" :value="lang.value">
                  {{ lang.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>{{ $t("form.cover")}}</label>
              <input type="url" v-model="newBook.cover" class="form-input" required>
            </div>
          </div>
        </div>
        <div class="doneinfo-block">
          <div class="mini-block">
            <p>{{ $t("form.stock")}} : </p>
            <input type="number" v-model="newBook.stock" class="stock-input" required>
          </div>
          <div class="mini-block">
            <button @click="addNewBook()">{{ $t("form.add")}}</button>
          </div>
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
                {{ $t(`genres.${genres.key}`) }}
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
                <div class="customer-name" style="text-transform: capitalize">{{ book.language }}</div>
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
                <div class="customer-name">S/ {{ getAmount(book) }}</div>
              </div>
            </td>
            <td>
              <pv-toast position="top-right" style="margin-top: 2rem" />
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

.dashboard-content {
  max-width: 1400px;
  margin: 0 auto;
}

.system-info {
  background-color: rgba(var(--color-accent-yellow-rgb), 0.05);
  border-radius: 10px;
  padding: 1rem 1.5rem;
  margin-bottom: 2rem;
}

.filter-section {
  margin-bottom: 2rem;
  border-bottom: 1px solid #eee;
  background-color: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.inputs-block {
  display: flex;
  width: 100%;
  padding: 0 1rem;
  align-items: flex-start;
  justify-content: space-around;
}

.form-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 600px;
  margin-bottom: 1rem;
}

.form-input, .form-group textarea {
  width: 100%;
  background-color: rgba(var(--color-accent-orange-rgb), 0.15);
  border: 2px solid transparent;
  border-radius: 5px;
  padding: 0.5rem;
  margin-top: 0.5rem;
  color: var(--color-text);
}

.right-block .form-input {
  background-color: rgba(var(--color-secondary-rgb), 0.15);
}

.doneinfo-block {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: flex-end;
  gap: 2rem;
  padding-right: 3rem;
}

.mini-block {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.stock-input {
  padding: 0.5rem;
  background-color: rgba(var(--color-accent-yellow-rgb), 0.15);
  border: none;
  border-radius: 5px;
  width: 55px;
  height: 40px;
  color: var(--color-text);
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