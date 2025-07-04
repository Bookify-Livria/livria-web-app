<script>
import dashboardSidebar from "../../manager/components/dashboard-sidebar.component.vue"
import inventoryDashboard from "@/manager/components/inventory-dashboard.component.vue";

export default {
  name: "inventory-management.component",
  components: {
    inventoryDashboard,
    dashboardSidebar,
  },
  data() {
    return {
      sidebarCollapsed: false
    };
  },
  methods: {
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    }
  }
}
</script>

<template>
  <div class="inventory-management-page" :class="{ 'sidebar-expanded': !sidebarCollapsed }">
    <dashboardSidebar
        :collapsed="sidebarCollapsed"
        @toggle-sidebar="toggleSidebar"
    />

    <div class="main-content">
      <div>
        <inventoryDashboard/>
      </div>
    </div>
  </div>
</template>

<style scoped>
.inventory-management-page {
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