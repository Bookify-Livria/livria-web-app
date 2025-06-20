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
      loading: true,
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
      <div v-if="loading" class="loading-container">
        <p>{{ $t('loading') || 'Loading orders data...' }}</p>
      </div>

      <div v-else>
        <inventoryDashboard/>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>