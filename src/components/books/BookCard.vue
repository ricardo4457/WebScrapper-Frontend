<template>
  <v-card
    class="mb-3 book-card"
    variant="outlined"
    rounded="lg"
    :to="{ name: 'book-detail', params: { id: book.id } }"
  >
    <v-card-title class="book-card__title">{{ book.title }}</v-card-title>
    <v-divider />
    <BookCardBody :book="book" />
  </v-card>
</template>

<script setup>
import BookCardBody from './BookCardBody.vue'

defineProps({
  book: { type: Object, required: true },
})
</script>

<style scoped>
.book-card__title {
  white-space: normal;
  font-weight: 600;
}
</style>
