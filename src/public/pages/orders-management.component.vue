<script>
import { ref } from 'vue'
import ordersDashboard from "../../manager/components/orders-dashboard.component.vue"
import dashboardSidebar from "../../manager/components/dashboard-sidebar.component.vue"

export default {
  name: "OrdersManagement",
  components: {
    ordersDashboard,
    dashboardSidebar
  },
  setup() {
    const loading = ref(true);
    const sidebarCollapsed = ref(false);

    const toggleSidebar = () => {
      sidebarCollapsed.value = !sidebarCollapsed.value;
    };

    return {
      loading,
      sidebarCollapsed,
      toggleSidebar
    };
  }
}
</script>

<template>
  <div class="orders-management-page" :class="{ 'sidebar-expanded': !sidebarCollapsed }">
    <dashboardSidebar
        :collapsed="sidebarCollapsed"
        @toggle-sidebar="toggleSidebar"
    />

    <div class="main-content">
      <div v-if="loading" class="loading-container">
        <p>{{ $t('loading') || 'Loading orders data...' }}</p>
      </div>

      <div v-else>
        <ordersDashboard/>
      </div>
    </div>
  </div>
</template>

<style scoped>
.orders-management-page {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 70px;
  transition: margin-left 0.3s ease;
  width: 100%;
}

.sidebar-expanded .main-content {
  margin-left: 250px;
  width: calc(100% - 250px);
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
  font-size: 1.2rem;
  color: var(--color-primary);
  margin-top: 4.5rem;
}

/* For mobile devices */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    width: 100%;
  }

  .sidebar-expanded .main-content {
    margin-left: 0;
    width: 100%;
  }
}
</style>