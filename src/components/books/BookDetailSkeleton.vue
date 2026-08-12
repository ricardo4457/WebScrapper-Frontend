<template>
  <div class="book-detail-skeleton">
    <div class="book-detail-skeleton__title">
      <v-skeleton-loader type="text" />
    </div>

    <div class="book-detail-skeleton__price-row">
      <div class="book-detail-skeleton__price">
        <v-skeleton-loader type="heading" />
      </div>
      <v-skeleton-loader type="avatar" />
    </div>

    <div class="book-detail-skeleton__cover">
      <v-skeleton-loader type="image" height="100%" />
    </div>

    <div class="book-detail-skeleton__row">
      <v-skeleton-loader type="list-item" />
    </div>
    <div class="book-detail-skeleton__row">
      <v-skeleton-loader type="list-item" />
    </div>
    <div class="book-detail-skeleton__row">
      <v-skeleton-loader type="list-item" />
    </div>
  </div>
</template>

<style scoped>
.book-detail-skeleton {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.book-detail-skeleton__title {
  width: 70%;
  margin-bottom: var(--space-4);
}

.book-detail-skeleton__price-row {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  margin-bottom: var(--space-6);
}

.book-detail-skeleton__price {
  width: 120px;
}

.book-detail-skeleton__cover {
  width: 100%;
  max-width: 280px;
  aspect-ratio: 3 / 4;
  margin-bottom: var(--space-6);
}

.book-detail-skeleton__row {
  width: 100%;
  margin-bottom: var(--space-2);
}
</style>
