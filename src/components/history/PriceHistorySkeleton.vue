<template>
  <div>
    <div class="price-history-skeleton__stats">
      <div v-for="n in 4" :key="n" class="price-history-skeleton__stat">
        <div class="price-history-skeleton__label">
          <v-skeleton-loader type="text" />
        </div>
        <div class="price-history-skeleton__value">
          <v-skeleton-loader type="text" />
        </div>
      </div>
    </div>
    <v-skeleton-loader type="image" height="280" />
  </div>
</template>

<style scoped>
.price-history-skeleton__stats {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.price-history-skeleton__stat {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 80px;
}

.price-history-skeleton__label {
  width: 50px;
  height: 12px;
}

.price-history-skeleton__value {
  width: 70px;
  height: 20px;
}
</style>
