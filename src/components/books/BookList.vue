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

    <v-expansion-panels v-else v-model="openPanel" variant="accordion" class="book-accordion">
      <v-expansion-panel
        v-for="book in books"
        :key="book.id"
        :value="book.id"
        rounded="lg"
        class="book-accordion__panel"
      >
        <v-expansion-panel-title class="book-accordion__title">
          {{ book.title }}
        </v-expansion-panel-title>
        <v-expansion-panel-text class="book-accordion__text">
          <router-link
            :to="{ name: 'book-detail', params: { id: book.id } }"
            target="_blank"
            class="book-accordion__link"
          >
            <BookCardBody :book="book" />
          </router-link>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import BookCardBody from './BookCardBody.vue'
import BookCardSkeleton from './BookCardSkeleton.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import ErrorState from '@/components/common/ErrorState.vue'

const props = defineProps({
  books: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: String, default: null },
})

defineEmits(['retry'])

const openPanel = ref(null)

watch(
  () => props.books,
  (books) => {
    openPanel.value = books.length ? books[0].id : null
  },
  { immediate: true },
)
</script>

<style scoped>
.book-accordion__panel {
  margin-bottom: var(--space-3);
  border: 1px solid rgb(var(--v-border-color));
}

.book-accordion__title {
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  background-color: rgb(var(--v-theme-background));
}

.book-accordion :deep(.v-expansion-panel-title:not(.v-expansion-panel-title--active)) {
  font-weight: 400;
  color: rgba(var(--v-theme-on-surface), 0.6);
  background-color: rgba(var(--v-theme-primary), 0.06);
}

.book-accordion__link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.book-accordion__text :deep(.v-expansion-panel-text__wrapper) {
  padding: 0;
}
</style>
