<template>
  <div class="book-card-skeleton">
    <div class="book-card-skeleton__title">
      <v-skeleton-loader type="text" class="book-card-skeleton__title-line" />
    </div>
    <div class="book-card-skeleton__body">
      <div class="book-card-skeleton__info">
        <v-skeleton-loader type="text" class="book-card-skeleton__field" />
        <v-skeleton-loader type="text" class="book-card-skeleton__field" />
        <v-skeleton-loader type="text" class="book-card-skeleton__field" />
        <div class="book-card-skeleton__price-box">
          <v-skeleton-loader type="heading" class="book-card-skeleton__price" />
          <v-skeleton-loader type="button" class="book-card-skeleton__button" />
        </div>
      </div>
      <v-skeleton-loader type="image" class="book-card-skeleton__cover" />
    </div>
  </div>
</template>

<style scoped>
/* Mirrors .book-accordion__panel so the loading state doesn't jump/shrink
   once the real list renders. */
.book-card-skeleton {
  margin-bottom: var(--space-3);
  border: 1px solid rgb(var(--v-border-color));
  border-radius: 8px;
  overflow: hidden;
}

.book-card-skeleton__title {
  padding: var(--space-4);
  background-color: rgb(var(--v-theme-background));
  border-bottom: 1px solid rgb(var(--v-border-color));
}

.book-card-skeleton__title-line {
  width: 60%;
}

.book-card-skeleton__body {
  display: flex;
  align-items: flex-start;
  background-color: rgba(var(--v-theme-primary), 0.04);
}

.book-card-skeleton__info {
  flex: 1 1 60%;
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.book-card-skeleton__field {
  width: 45%;
}

.book-card-skeleton__price-box {
  margin-top: var(--space-2);
  padding: var(--space-4) var(--space-6);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  width: 100%;
  border: 1px solid rgb(var(--v-border-color));
  border-radius: 8px;
}

.book-card-skeleton__price {
  width: 60%;
}

.book-card-skeleton__button {
  width: 50%;
}

.book-card-skeleton__cover {
  flex: 0 0 40%;
  max-width: 40%;
  height: 220px;
}
</style>
