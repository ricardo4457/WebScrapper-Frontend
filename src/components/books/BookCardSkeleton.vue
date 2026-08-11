<template>
  <v-skeleton-loader type="card" class="book-card-skeleton" />
</template>

<style scoped>
/* Matches .book-accordion__panel's margin-bottom so the loading state
   doesn't jump/shrink once the real list renders. */
.book-card-skeleton {
  margin-bottom: var(--space-3);
}
</style>
