<template>
  <v-card class="mb-3" :to="{ name: 'book-detail', params: { id: book.id } }">
    <v-card-item>
      <v-card-title>{{ book.title }}</v-card-title>
      <v-card-subtitle v-if="book.publisher">{{ book.publisher }}</v-card-subtitle>
    </v-card-item>
    <v-card-text>
      <PriceTag :price="book.price" />
    </v-card-text>
  </v-card>
</template>

<script setup>
import PriceTag from '@/components/common/PriceTag.vue'

defineProps({
  book: { type: Object, required: true },
})
</script>
