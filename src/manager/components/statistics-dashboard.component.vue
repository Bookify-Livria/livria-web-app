<script>
export default {
  name: "statisticsDashboard"
}
</script>

<template>
  <!-- Coming Soon -->
  <div class="system-info">
    <h3 class="system-info-h3">{{ $t('dashboard-home.manage-statistics') }}</h3>
    <h3 class="h1__title">{{ $t('coming-soon') }}</h3>
  </div>
</template>

<style scoped>
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

</style>