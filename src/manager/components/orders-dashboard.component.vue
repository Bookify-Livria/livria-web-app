<script>
import { OrderApiService } from '../../commerce/orders/services/order-api.service.js';

export default {
  name: "OrdersDashboard",
  data() {
    return {
      orders: [],
      stats: {
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        completedOrders: 0,
        averageOrderValue: 0,
        mostPopularBook: null
      },
      loading: true,
      selectedStatus: 'all',
      dateRange: 'all',
      sortOption: 'date_desc',
      searchQuery: '',
      showOrderModal: false,
      currentOrder: null,
      formErrors: {}, // This was in setup but not used in the provided template/methods. Keeping for completeness.

      statusOptions: [
        { value: 'pending', label: 'Pendiente' },
        { value: 'in-progress', label: 'En Progreso' },
        { value: 'delivered', label: 'Entregado' },
      ],

      // Date range options
      dateRangeOptions: [
        { value: 'today', label: 'Hoy' },
        { value: 'week', label: 'Esta Semana' },
        { value: 'month', label: 'Este Mes' },
        { value: 'year', label: 'Este Año' },
        { value: 'all', label: 'Todo el Tiempo' }
      ]
    };
  },
  computed: {
    filteredOrders() {
      let filtered = [...this.orders];

      // Filter by status
      if (this.selectedStatus !== 'all') {
        filtered = filtered.filter(order => order.status === this.selectedStatus);
      }
      // Filter by date range
      if (this.dateRange !== 'all') {
        filtered = filtered.filter(order => this.isWithinDateRange(order.date, this.dateRange));
      }
      // Filter by search query
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(order =>
            order.code.toLowerCase().includes(query) ||
            order.recipientName.toLowerCase().includes(query) ||
            order.email.toLowerCase().includes(query)
        );
      }
      // Sort orders
      filtered.sort((a, b) => {
        switch (this.sortOption) {
          case 'date_asc':
            return new Date(a.date) - new Date(b.date);
          case 'date_desc':
            return new Date(b.date) - new Date(a.date);
          case 'total_asc':
            return a.total - b.total;
          case 'total_desc':
            return b.total - a.total;
          default:
            return 0;
        }
      });

      return filtered;
    }
  },
  methods: {
    async loadOrders() {
      try {
        this.loading = true;
        const service = new OrderApiService();
        const data = await service.getOrders();
        this.orders = data;
        this.calculateStats(data);

        this.loading = false;
      } catch (error) {
        console.error('Error loading orders:', error);
        this.loading = false;
      }
    },
    calculateStats(orders) {
      if (!orders.length) {
        this.stats = {
          totalOrders: 0,
          totalRevenue: 0,
          pendingOrders: 0,
          completedOrders: 0,
          averageOrderValue: 0,
        };
        return;
      }
      this.stats.totalOrders = orders.length;

      // Calculate total revenue
      this.stats.totalRevenue = orders.reduce((sum, order) => {
        return sum + (order.total || 0);
      }, 0);

      // Count pending and completed orders
      this.stats.pendingOrders = orders.filter(order =>
          ['pending'].includes(order.status)).length;
      this.stats.completedOrders = orders.filter(order =>
          order.status === 'delivered').length;

      // Calculate average order value
      this.stats.averageOrderValue = this.stats.totalRevenue / orders.length;
    },
    isWithinDateRange(dateString, range) {
      if (range === 'all') return true;

      const orderDate = new Date(dateString);
      const today = new Date();

      // Reset hours for accurate day comparison
      today.setHours(0, 0, 0, 0);

      const todayTimestamp = today.getTime();

      // Calculate start of week (Sunday)
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const startOfWeekTimestamp = startOfWeek.getTime();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startOfMonthTimestamp = startOfMonth.getTime();
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      const startOfYearTimestamp = startOfYear.getTime();

      const orderTimestamp = orderDate.getTime();

      switch (range) {
        case 'today':
          return orderDate.toDateString() === today.toDateString();
        case 'week':
          return orderTimestamp >= startOfWeekTimestamp;
        case 'month':
          return orderTimestamp >= startOfMonthTimestamp;
        case 'year':
          return orderTimestamp >= startOfYearTimestamp;
        default:
          return true;
      }
    },
    viewOrderDetails(order) {
      this.currentOrder = { ...order };
      this.showOrderModal = true;
    },
    async updateOrderStatus(newStatus) {
      if (!this.currentOrder) return;
      try {
        const service = new OrderApiService();
        await service.updateOrderStatus(this.currentOrder.id, newStatus);

        // Update order in local array
        const index = this.orders.findIndex(order => order.id === this.currentOrder.id);
        if (index !== -1) {
          this.orders[index] = {
            ...this.orders[index],
            status: newStatus
          };
          this.currentOrder.status = newStatus; // Also update the currentOrder in the modal
        }

        this.calculateStats(this.orders);
      } catch (error) {
        console.error('Error updating order status:', error);
      }
    },
    closeModal() {
      this.showOrderModal = false;
      this.currentOrder = null;
    },
    getSubtotal() { // Calcula el subtotal en base al total de la orden
      if (!this.currentOrder.total) return 0;
      const shipping = this.currentOrder.delivery ? this.getShippingCost() : 0;
      const igv = this.getIGV();
      return this.currentOrder.total - igv - shipping;
    },
    getIGV() { // Calcula el IGV en base al total de la orden
      return this.currentOrder.total ? this.currentOrder.total * 0.18 / 1.18 : 0;
    },
    getShippingCost() { // Calcula el precio de envío
      return this.currentOrder.total ? this.currentOrder.total * 0.21 / 1.21 : 0;
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    },
    formatCurrency(amount) {
      const num = Number(amount);
      if (isNaN(num)) return 'S/ 0.00';
      return `S/ ${num.toFixed(2)}`;
    }
  },
  mounted() {
    this.loadOrders();
  }
};
</script>

<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h1 class="dashboard-title">{{ $t('dashboard-orders.title') }}</h1>
      <p class="dashboard-subtitle">{{ $t('dashboard-orders.subtitle') }}</p>
    </div>

    <div v-if="loading" class="dashboard-loading">
      <p>{{ $t('dashboard-orders.loading') }}</p>
    </div>

    <div v-else class="dashboard-content">
      <div class="stats-container">
        <div class="stat-card">
          <h3>{{ $t('dashboard-orders.total-orders') }}</h3>
          <p class="stat-value">{{ stats.totalOrders }}</p>
        </div>
        <div class="stat-card">
          <h3>{{ $t('dashboard-orders.total-revenue') }}</h3>
          <p class="stat-value">{{ formatCurrency(stats.totalRevenue) }}</p>
        </div>
        <div class="stat-card">
          <h3>{{ $t('dashboard-orders.pending-orders') }}</h3>
          <p class="stat-value">{{ stats.pendingOrders }}</p>
        </div>
        <div class="stat-card">
          <h3>{{ $t('dashboard-orders.completed-orders') }}</h3>
          <p class="stat-value">{{ stats.completedOrders }}</p>
        </div>
        <div class="stat-card">
          <h3>{{ $t('dashboard-orders.avg-order-value') }}</h3>
          <p class="stat-value">{{ formatCurrency(stats.averageOrderValue) }}</p>
        </div>
      </div>

      <div class="filter-section">
        <h2 class="h2__title" style="margin-bottom: 2rem">{{ $t('dashboard-orders.order-list') }}</h2>

        <div class="search-bar">
          <input
              type="text"
              v-model="searchQuery"
              :placeholder="$t('dashboard-orders.search-orders')"
              class="search-input"
          />
        </div>

        <div class="filter-controls">
          <div class="filter-group">
            <label for="status-filter">{{ $t('dashboard-orders.filter-by-status') }}</label>
            <select id="status-filter" v-model="selectedStatus" class="filter-select">
              <option value="all">{{ $t('dashboard-orders.all-status') }}</option>
              <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                {{ $t(`${option.value}`) || option.label }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label for="date-filter">{{ $t('dashboard-orders.filter-by-date') }}</label>
            <select id="date-filter" v-model="dateRange" class="filter-select">
              <option v-for="option in dateRangeOptions" :key="option.value" :value="option.value">
                {{ $t(`dashboard-orders.date-range.${option.value}`) || option.label }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label for="sort-by">{{ $t('dashboard-orders.sort-by') }}</label>
            <select id="sort-by" v-model="sortOption" class="filter-select">
              <option value="date_desc">{{ $t('dashboard-orders.sort-date-desc') }}</option>
              <option value="date_asc">{{ $t('dashboard-orders.sort-date-asc') }}</option>
              <option value="total_desc">{{ $t('dashboard-orders.sort-total-desc') }}</option>
              <option value="total_asc">{{ $t('dashboard-orders.sort-total-asc') }}</option>
            </select>
          </div>
        </div>
      </div>

      <div class="orders-table-container">
        <table class="orders-table">
          <thead>
          <tr>
            <th>{{ $t('dashboard-orders.order-number') }}</th>
            <th>{{ $t('dashboard-orders.customer') }}</th>
            <th>{{ $t('dashboard-orders.recipient') }}</th>
            <th>{{ $t('dashboard-orders.date') }}</th>
            <th>{{ $t('dashboard-orders.total') }}</th>
            <th>{{ $t('dashboard-orders.status_t') }}</th>
            <th>{{ $t('dashboard-orders.items') }}</th>
            <th>{{ $t('dashboard-orders.actions') }}</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="order in filteredOrders" :key="order.id">
            <td><strong># {{ order.code }}</strong></td>
            <td>
              <div class="customer-info">
                <div class="customer-name">{{ order.userFullName }}</div>
              </div>
            </td>
            <td>
              <div class="customer-info">
                <div class="customer-name">{{ order.recipientName }}</div>
              </div>
            </td>
            <td>{{ formatDate(order.date) }}</td>
            <td class="order-total">{{ formatCurrency(order.total) }}</td>
            <td>
              <div class="customer-name"  style="text-transform: capitalize">{{ order.status }}</div>
            </td>
            <td class="items-count">{{ order.items?.length || 0 }}</td>
            <td>
              <button class="btn-view" @click="viewOrderDetails(order)">
                {{ $t('dashboard-orders.view-details') }}
              </button>
            </td>
          </tr>
          </tbody>
        </table>

        <div v-if="filteredOrders.length === 0" class="no-results">
          <p>{{ $t('dashboard-orders.no-orders-found') }}</p>
        </div>
      </div>
    </div>

    <!-- View Details -->
    <div v-if="showOrderModal" class="modal-backdrop">
      <div class="modal-content order-details-modal">
        <div class="modal-header">
          <h2>{{ $t('dashboard-orders.order-details') }} #{{ currentOrder.code }}</h2>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body" v-if="currentOrder">
          <div class="order-details-grid">
            <div class="order-info-section">
              <h3>{{ $t('dashboard-orders.info') }}</h3>
              <div class="order-info-grid">
                <div class="info-group">
                  <span class="info-label">{{ $t('dashboard-orders.order-number') }}:</span>
                  <span class="info-value"># {{ currentOrder.code }}</span>
                </div>
                <div class="info-group">
                  <span class="info-label">{{ $t('dashboard-orders.date') }}:</span>
                  <span class="info-value">{{ formatDate(currentOrder.date) }}</span>
                </div>
                <div class="info-group">
                  <span class="info-label">{{ $t('dashboard-orders.status_t') }}:</span>
                  <span class="info-value" style="text-transform: capitalize">{{ currentOrder.status }}</span>
                </div>
              </div>
            </div>

            <div class="customer-info-section">
              <h3>{{ $t('dashboard-orders.customer-info') }}</h3>
              <div class="customer-info-grid">
                <div class="info-group">
                  <span class="info-label">{{ $t('dashboard-orders.customer-name') }}:</span>
                  <span class="info-value">{{ currentOrder.userFullName }}</span>
                </div>
                <div class="info-group">
                  <span class="info-label">{{ $t('dashboard-orders.customer-email') }}:</span>
                  <span class="info-value">{{ currentOrder.userEmail }}</span>
                </div>
                <div class="info-group">
                  <span class="info-label">{{ $t('dashboard-orders.recipient-name') }}:</span>
                  <span class="info-value">{{ currentOrder.recipientName || $t('dashboard-orders.none') }}</span>
                </div>
                <div class="info-group">
                  <span class="info-label">{{ $t('dashboard-orders.recipient-phone') }}:</span>
                  <span class="info-value">{{ currentOrder.userPhone || $t('dashboard-orders.none') }}</span>
                </div>
              </div>
            </div>

            <div class="shipping-info-section" v-if="currentOrder.shipping">
              <h3>{{ $t('dashboard-orders.shipping-info') }}</h3>
              <div class="shipping-info-grid">
                <div class="info-group">
                  <span class="info-label">{{ $t('dashboard-orders.shipping-address') }}:</span>
                  <span class="info-value">{{ currentOrder.shipping.address || $t('dashboard-orders.none') }}</span>
                </div>
                <div class="info-group">
                  <span class="info-label">{{ $t('dashboard-orders.shipping-district') }}:</span>
                  <span class="info-value">{{ currentOrder.shipping.district || $t('dashboard-orders.none') }}</span>
                </div>
                <div class="info-group">
                  <span class="info-label">{{ $t('dashboard-orders.shipping-city') }}:</span>
                  <span class="info-value">{{ currentOrder.shipping.city || $t('dashboard-orders.none') }}</span>
                </div>
                <div class="info-group">
                  <span class="info-label">{{ $t('dashboard-orders.shipping-reference') }}:</span>
                  <span class="info-value">{{ currentOrder.shipping.reference || $t('dashboard-orders.none') }}</span>
                </div>
              </div>
            </div>

            <div class="order-items-section">
              <h3>{{ $t('dashboard-orders.items') }}</h3>
              <table class="order-items-table">
                <thead>
                <tr>
                  <th>{{ $t('dashboard-orders.item') }}</th>
                  <th>{{ $t('dashboard-orders.quantity') }}</th>
                  <th>{{ $t('dashboard-orders.unit-price') }}</th>
                  <th>{{ $t('dashboard-orders.subtotal') }}</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(item, index) in currentOrder.items" :key="index">
                  <td>
                    <div class="order-item-info" style="text-align: left">
                      <strong>{{ item.book.title }}</strong>
                      <small>{{ item.book.author }}</small>
                    </div>
                  </td>
                  <td>{{ item.quantity }}</td>
                  <td>{{ formatCurrency(item.book.salePrice) }}</td>
                  <td>{{ formatCurrency(item.quantity * item.book.salePrice) }}</td>
                </tr>
                </tbody>
              </table>
            </div>

            <div class="order-summary-section">
              <div class="order-totals">
                <div class="total-row">
                  <span>{{ $t('dashboard-orders.subtotal') }}:</span>
                  <span>{{ formatCurrency(getSubtotal()) }}</span>
                </div>
                <div class="total-row">
                  <span>{{ $t('dashboard-orders.tax') }}:</span>
                  <span>{{ formatCurrency(getIGV()) }}</span>
                </div>
                <div class="total-row" v-if="currentOrder.shipping">
                  <span>{{ $t('dashboard-orders.shipping-cost') }}:</span>
                  <span>{{ formatCurrency(getShippingCost()) }}</span>
                </div>
                <div class="total-row grand-total">
                  <span>{{ $t('dashboard-orders.total') }}:</span>
                  <span>{{ formatCurrency(currentOrder.total) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="update-status-section">
            <h3>{{ $t('dashboard-orders.update-status') }}</h3>
            <div class="status-options">
              <!-- aca codigo para hacer que se cambie el status sabiendo que hay dos opciones (pending o delivered)-->
              <button
                  :class="['status-button', { active: currentOrder.status === 'pending' }]"
                  @click="updateOrderStatus('pending')"
              >
                {{ $t('pending') }}
              </button>
              <button
                  :class="['status-button', { active: currentOrder.status === 'in progress' }]"
                  @click="updateOrderStatus('in progress')"
              >
                {{ $t('in-progress') }}
              </button>
              <button
                  :class="['status-button', { active: currentOrder.status === 'delivered' }]"
                  @click="updateOrderStatus('delivered')"
              >
                {{ $t('delivered') }}
              </button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-print" @click="window.print">
            <i class="pi pi-print"></i> {{ $t('dashboard-orders.print') }}
          </button>
          <button class="btn-close" @click="closeModal">{{ $t('dashboard-orders.close')  }}</button>
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

.stats-container {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  margin-bottom: 2.5rem;
}

.stat-card {
  background-color: rgba(var(--color-secondary-rgb), 0.15);
  border-radius: 12px;
  padding: 2rem;
  width: 300px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  text-align: center; /* Center content */
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-card h3 {
  font-size: 0.9rem;
  color: var(--color-text);
  opacity: 0.8;
  margin: 0 0 0.5rem 0; /* Added margin-bottom for spacing */
}

.stat-value {
  font-size: 1.4rem;
  font-weight: bold;
  color: var(--color-accent-orange);
  text-align: center;
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
  box-sizing: border-box;
}

.filter-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: space-between;
}

.filter-group {
  flex: 1;
  min-width: 180px;
}

.filter-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: var(--color-text);
  font-weight: 500;
}

.filter-select {
  width: 100%;
  padding: 0.7rem 1rem;
  border-radius: 6px;
  border: 1px solid #ddd;
  background-color: white;
  font-size: 0.9rem;
  color: var(--color-text);
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='feather feather-chevron-down'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.7rem center;
  background-size: 18px;
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

.order-total {
  font-weight: bold;
  color: var(--color-blue);
  text-align: center;
}

.items-count {
  text-align: center;
}

.btn-view {
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 0.85rem;
}

.btn-view:hover {
  background-color: #0056b3;
}

.no-results {
  text-align: center;
  padding: 2rem;
  color: #777;
  font-size: 1.1rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-top: 1rem;
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
  max-width: 600px;
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
  flex-grow: 1;
  padding-bottom: 1.5rem;
}

.order-details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin: 1rem 0;
}

.order-info-section,
.customer-info-section,
.shipping-info-section,
.order-items-section,
.order-summary-section,
.update-status-section {
  background-color: #fcfcfc;
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  padding: 2rem;
}

h3 {
  font-size: 1.2rem;
  color: var(--color-primary);
  margin: 0 0 1rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
}

.order-info-grid,
.customer-info-grid,
.shipping-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;
}

.shipping-info-grid .info-group.full-width {
  grid-column: 1 / -1; /* Spans full width */
}

.info-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.info-label {
  font-size: 0.8rem;
  color: #777;
  margin-bottom: 0.2rem;
}

.info-value {
  font-size: 1rem;
  color: #333;
  font-weight: 500;
}

.order-items-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.order-items-table th,
.order-items-table td {
  border: 1px solid #eaeaea;
  padding: 0.8rem;
  text-align: center;
  min-width: 100px;
}

.order-items-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: var(--color-accent-orange);
  font-size: 0.9rem;
}

.order-item-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.order-item-info strong {
  display: block;
  font-size: 1rem;
}
.order-item-info small {
  color: #777;
  font-size: 0.8em;
}

.order-summary-section {
  grid-column: 1 / -1; /* Spans full width in the grid layout */
  display: flex;
  justify-content: flex-end; /* Align totals to the right */
}

.order-totals {
  width: 100%;
  max-width: 300px; /* Max width for totals column */
}

.total-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px dashed #eee;
}

.total-row:last-of-type {
  border-bottom: none;
}

.total-row span {
  font-size: 1rem;
  color: #333;
}

.total-row.grand-total {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--color-primary);
  border-top: 2px solid var(--color-primary);
  padding-top: 1rem;
  margin-top: 0.5rem;
}

.update-status-section {
  margin-top: 2rem;
  grid-column: 1 / -1; /* Spans full width */
}

.status-button {
  padding: 0.5rem 1rem;
  margin-right: 0.5rem;
  border: 1px solid #ccc;
  background-color: var(--color-light);
  color: var(--color-text);
  cursor: pointer;
  border-radius: 6px;
}

.status-button:hover,
.status-button.active {
  background-color: var(--color-accent-light-yellow);
  color: var(--color-primary);
  border: none;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  border-top: 1px solid #eee;
  padding-top: 1.5rem;
  margin-top: 1.5rem;
}

.btn-print, .btn-close {
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-print {
  background-color: #607d8b; /* Blue Grey */
  color: white;
  border: none;
}

.btn-print:hover {
  background-color: #455a64;
}

.btn-print i {
  margin-right: 0.5rem;
}

.btn-close {
  background-color: #e0e0e0;
  color: #333;
  border: none;
}

.btn-close:hover {
  background-color: #bdbdbd;
}

/* Responsive Adjustments */
@media (max-width: 1200px) {
  .stats-container {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  }
}

@media (max-width: 992px) {
  .stats-container {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  }
  .orders-table th, .orders-table td {
    padding: 0.8rem;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 1rem;
  }
  .stats-container {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }
  .filter-controls {
    flex-direction: column;
    gap: 1rem;
  }
  .filter-group {
    min-width: 100%;
  }
  .modal-content {
    width: 95%;
    padding: 1rem;
  }
  .order-details-grid {
    grid-template-columns: 1fr; /* Stack sections on small screens */
  }
  .order-summary-section {
    justify-content: center; /* Center summary */
  }
  .status-buttons {
    flex-direction: column;
    align-items: stretch; /* Stretch buttons */
  }
  .status-button {
    min-width: unset; /* Remove min-width for stacking */
  }
  .modal-footer {
    flex-direction: column;
    gap: 0.8rem;
  }
}

@media (max-width: 480px) {
  .dashboard-title {
    font-size: 1.8rem;
  }
  .stat-card {
    padding: 1rem;
  }
  .stat-value {
    font-size: 1.2rem;
  }
  .search-input, .filter-select, .btn-view {
    font-size: 0.9rem;
  }
  .orders-table th, .orders-table td {
    font-size: 0.85rem;
  }
  .customer-info {
    font-size: 0.8rem;
  }
}
</style>