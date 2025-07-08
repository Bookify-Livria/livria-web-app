<script>
import { OrderApiService } from "../../commerce/orders/services/order-api.service.js";
import { BookApiService } from "../../commerce/books/services/book-api.service.js";
import { UserApiService } from "../../subscription/service/user-api.service.js";
import AuthService from "../../public/shared-services/authentication.service.js";

export default {
  name: "statisticsDashboard",
  data() {
    return {
      top3: [],
      chartData: null, // Data for the pie chart
      chartOptions: null, // Options for the pie chart
      allOrders: [],
      revenueChartData: null,
      revenueChartOptions: null,
      initialCapital: 0,
    }
  },
  methods: {
    async fetchAndProcessOrders() {
      try {
        const orderService = new OrderApiService();
        const bookService = new BookApiService(); // Instantiate BookApiService here
        const userApiService = new UserApiService();

        // Fetch admin user capital
        const currentUser = AuthService.getCurrentUser();
        if (currentUser && currentUser.userId) {
          const adminUser = await userApiService.getAdminUser();
          if (adminUser && adminUser.capital !== undefined) {
            this.initialCapital = parseFloat(adminUser.capital);
            console.log("Admin Capital:", this.initialCapital);
          } else {
            console.warn("Admin capital not found or user not admin.");
            this.initialCapital = 0; // Default to 0 if not found
          }
        }

        this.allOrders = await orderService.getOrders(); // Fetch all orders
        console.log("All fetched orders (before genre enrichment):", this.allOrders);

        if (this.allOrders.length === 0) {
          console.warn("No orders found to generate statistics.");
          this.top3 = [];
          this.chartData = null;
          return;
        }

        const uniqueBookIds = new Set();
        this.allOrders.forEach(order => {
          order.items.forEach(item => {
            if (item.book && item.book.id) {
              uniqueBookIds.add(item.book.id);
            }
          });
        });

        const bookDetailsCache = {};
        const bookFetches = [];

        uniqueBookIds.forEach(bookId => {
          bookFetches.push(
              bookService.getBookById(bookId)
                  .then(bookDetail => {
                    if (bookDetail) {
                      bookDetailsCache[bookId] = bookDetail; // Store full book object
                    } else {
                      console.warn(`Book details not found for ID: ${bookId}`);
                      bookDetailsCache[bookId] = { genre: 'Unknown', purchasePrice: 0, salePrice: 0 }; // Fallback
                    }
                  })
                  .catch(error => {
                    console.error(`Error fetching book details for ID ${bookId}:`, error);
                    bookDetailsCache[bookId] = { genre: 'Unknown', purchasePrice: 0, salePrice: 0 }; // Fallback
                  })
          );
        });
        await Promise.all(bookFetches);
        console.log("Book Details Cache after fetches:", bookDetailsCache);

        this.allOrders.forEach(order => {
          order.items.forEach(item => {
            const bookId = item.book.id;
            if (item.book) {
              const cachedBook = bookDetailsCache[bookId];
              item.book.genre = cachedBook.genre || 'Unknown';
              item.book.purchasePrice = parseFloat(cachedBook.purchasePrice) || 0; // Store purchasePrice
              item.book.salePrice = parseFloat(cachedBook.salePrice) || 0; // Store salePrice
            }
          });
        });

        console.log("All fetched orders (after genre enrichment):", this.allOrders);

        this.processOrderData();

      } catch (error) {
        console.error("Error fetching or processing orders:", error);
      }
    },
    processOrderData() {
      const bookSalesCount = {};
      const genreIncome = {};

      const dailyData = {};
      let cumulativeCapital = this.initialCapital;


      this.allOrders.sort((a, b) => new Date(a.date) - new Date(b.date));

      this.allOrders.forEach(order => {
        const orderDate = new Date(order.date).toISOString().split('T')[0];

        dailyData[orderDate] = dailyData[orderDate] || { income: 0, expenses: 0 };

        order.items.forEach(item => {
          console.log("Processing item: ", item); // Debugging

          const bookId = item.book.id;
          const bookTitle = item.book.title;
          const bookCover = item.book.cover;
          bookSalesCount[bookId] = bookSalesCount[bookId] || { count: 0, title: bookTitle, cover: bookCover, id: bookId };
          bookSalesCount[bookId].count += item.quantity;

          const genre = item.book.genre || 'Unknown';
          const itemRevenue = parseFloat(item.book.salePrice) || 0;
          const itemCost = (parseFloat(item.book.purchasePrice) || 0) * item.quantity; // Expense for this item (COGS)

          genreIncome[genre] = (genreIncome[genre] || 0) + itemRevenue;

          console.log("genreincome: ", itemRevenue);

          dailyData[orderDate].income += itemRevenue;
          dailyData[orderDate].expenses += itemCost;
        });
      });

      // --- Calculate Top 3 Books ---
      this.top3 = Object.values(bookSalesCount)
          .sort((a, b) => b.count - a.count)
          .slice(0, 3);
      console.log("Top 3 Books:", this.top3);

      // --- Prepare Data for Doughnut Chart (Income by Genre) ---
      const genreLabels = Object.keys(genreIncome);
      const genreData = Object.values(genreIncome);

      this.chartData = {
        labels: genreLabels,
        datasets: [
          {
            data: genreData,
            backgroundColor: this.generateChartColors(genreLabels.length),
            hoverBackgroundColor: this.generateChartColors(genreLabels.length, 0.8)
          }
        ]
      };

      this.chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'left',
            labels: {
              usePointStyle: true
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed) {
                  label += new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(context.parsed);
                }
                return label;
              }
            }
          }
        }
      };
      console.log("Chart Data:", this.chartData);

      // --- Prepare Data for Linear Chart (Capital, Income, Expenses) ---
      const sortedDates = Object.keys(dailyData).sort();
      const incomeLineData = [];
      const expensesLineData = [];
      const capitalLineData = []; // To show the cumulative capital

      let currentCapital = this.initialCapital;

      sortedDates.forEach(date => {
        const dayData = dailyData[date];
        incomeLineData.push(dayData.income);
        expensesLineData.push(dayData.expenses);

        // Update cumulative capital
        currentCapital += dayData.income - dayData.expenses;
        capitalLineData.push(currentCapital);
      });

      this.revenueChartData = {
        labels: sortedDates, // Dates for X-axis
        datasets: [
          {
            label: 'Capital',
            data: capitalLineData,
            fill: false,
            borderColor: 'rgba(75, 192, 192, 1)', // Greenish
            tension: 0.1
          },
          {
            label: 'Ganancias por Órdenes',
            data: incomeLineData,
            fill: false,
            borderColor: 'rgba(54, 162, 235, 1)', // Blue
            tension: 0.1
          },
          {
            label: 'Costos de Venta (Libros)', // Changed from "Gastos al añadir/cambiar stock"
            data: expensesLineData,
            fill: false,
            borderColor: 'rgba(255, 99, 132, 1)', // Red
            tension: 0.1
          }
        ]
      };

      this.revenueChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top'
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(context.parsed.y);
                }
                return label;
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Date'
            }
          },
          y: {
            title: {
              display: true,
              text: '(PEN)'
            },
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value);
              }
            }
          }
        }
      };
      console.log("Linear Chart Data:", this.revenueChartData);
    },
    generateChartColors(numColors, opacity = 0.6) {
      const colors = [
        `rgba(255, 99, 132, ${opacity})`,
        `rgba(54, 162, 235, ${opacity})`,
        `rgba(255, 206, 86, ${opacity})`,
        `rgba(75, 192, 192, ${opacity})`,
        `rgba(153, 102, 255, ${opacity})`,
        `rgba(255, 159, 64, ${opacity})`,
        `rgba(199, 199, 199, ${opacity})`,
        `rgba(83, 109, 254, ${opacity})`,
        `rgba(255, 99, 71, ${opacity})`,
        `rgba(60, 179, 113, ${opacity})`
      ];
      return Array.from({ length: numColors }, (_, i) => colors[i % colors.length]);
    }
  },
  mounted() {
    this.fetchAndProcessOrders();
  }
}
</script>

<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h1 class="dashboard-title">{{ $t('dashboard-statistics.title') }}</h1>
      <p class="dashboard-subtitle">{{ $t('dashboard-statistics.subtitle') }}</p>
    </div>

    <div class="dashboard-content">
      <div class="dashboard-content__left">
        <div class="dashboard-content__left-top">
          <h2 class="h2__title" style="margin-bottom: 2rem">{{ $t('dashboard-statistics.top3') }}</h2>
          <div class="statistics-mega-container">
            <div
                class="stats-container"
                 v-for="book in top3"
                 :key="book.id">
              <div class="stat-card">
                <img :src="book.cover" :alt="book.title" />
                <h3>{{ book.title }}</h3>
                <p>{{ $t('dashboard-statistics.sold-count', { count: book.count }) }}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="dashboard-content__left-bottom">
          <h2 class="h2__title" style="margin-bottom: 1rem">{{ $t('dashboard-statistics.genres') }}</h2>
          <div v-if="chartData" class="chart-wrapper">
            <pv-chart
                type="doughnut"
                :data="chartData"
                :options="chartOptions"
                style="height: 100%"
            />
          </div>
          <div v-else>
            <p>{{ $t('dashboard-statistics.no-genre-data') }}</p>
          </div>
        </div>
      </div>
      <div class="dashboard-content__right">
        <h2 class="h2__title" style="margin-bottom: 2rem">{{ $t('dashboard-statistics.pitch') }}</h2>
        <div class="linear-stats">
          <pv-chart type="line" :data="revenueChartData" :options="revenueChartOptions" style="height: 60vh;" />
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

.dashboard-content {
  max-width: 1450px;
  margin: 0 auto;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.dashboard-content__left {
  width: 42%;
}
.dashboard-content__right {
  width: 55%;
  height: 70vh;
}

.dashboard-content__left-top {
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.statistics-mega-container {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.stats-container {
  display: flex;
  width: 100%;
}

.stat-card {
  background-color: rgba(var(--color-secondary-rgb), 0.15);
  border-radius: 12px;
  padding: 1rem;
  width: 180px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 0.5rem;
}
.stat-card img {
  width: 60px; /* Adjust as needed */
  height: 90px; /* Adjust as needed */
  object-fit: cover;
  border-radius: 10px;
}
.stat-card h3 {
  margin: 0;
  font-size: 1rem;
}
.stat-card p {
  margin: 0;
  color: var(--color-text);
  font-size: 0.8rem;
}
.chart-wrapper {
  position: relative;
  height: 250px;
  width: 100%;
}
</style>