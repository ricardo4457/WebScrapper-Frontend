<template>
  <div>
    <template v-if="loading">
      <BookCardSkeleton v-for="n in 4" :key="n" />
    </template>

    <ErrorState v-else-if="error" :message="error" @retry="$emit('retry')" />

    <EmptyState
      v-else-if="!books.length"
      title="Sem livros encontrados"
      subtitle="Tenta outro termo de pesquisa."
    />

    <template v-else>
      <BookCard v-for="book in books" :key="book.id" :book="book" />
    </template>
  </div>
</template>

<script setup>
import BookCard from './BookCard.vue'
import BookCardSkeleton from './BookCardSkeleton.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import ErrorState from '@/components/common/ErrorState.vue'

defineProps({
  books: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: String, default: null },
})

defineEmits(['retry'])
</script>
