<template>
  <v-card class="mb-3" :to="{ name: 'book-detail', params: { id: book.id } }">
    <v-card-item>
      <v-card-title>{{ book.title }}</v-card-title>
      <v-card-subtitle v-if="book.publisher">{{ book.publisher }}</v-card-subtitle>
    </v-card-item>
    <v-card-text>
      <span class="text-h6 text-primary">{{ formattedPrice }}</span>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  book: { type: Object, required: true },
})

const formattedPrice = computed(() => {
  if (props.book.price == null) return '—'
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(
    props.book.price,
  )
})
</script>
