<template>
  <PageContainer>
    <template v-if="booksStore.detailLoading">
      <v-skeleton-loader type="article" />
    </template>

    <ErrorState
      v-else-if="booksStore.detailError"
      :message="booksStore.detailError"
      @retry="fetchBook"
    />

    <template v-else-if="booksStore.currentBook">
      <PageTitle :text="booksStore.currentBook.title" />

      <p v-if="booksStore.currentBook.publisher" class="text-body-2 text-medium-emphasis">
        {{ booksStore.currentBook.publisher }}
      </p>

      <p v-if="booksStore.currentBook.discipline" class="text-body-2 text-medium-emphasis">
        {{ booksStore.currentBook.discipline }}
      </p>

      <p class="text-h5 text-primary mt-4">{{ formattedPrice }}</p>

      <v-divider class="my-6" />

      <h2 class="text-h6 mb-3">Disponível em</h2>
      <v-list v-if="booksStore.currentBookSchools.length" lines="two">
        <v-list-item
          v-for="school in booksStore.currentBookSchools"
          :key="school.school_id"
          :title="school.name"
          :subtitle="`${school.city}, ${school.district} — ${school.year}`"
        />
      </v-list>
      <p v-else class="text-body-2 text-medium-emphasis">Sem informação de escolas disponível.</p>
    </template>
  </PageContainer>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import PageContainer from '@/components/layout/PageContainer.vue'
import PageTitle from '@/components/layout/PageTitle.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import { useBooksStore } from '@/stores/books.store.js'

const props = defineProps({
  id: { type: [String, Number], required: true },
})

const booksStore = useBooksStore()

function fetchBook() {
  booksStore.fetchBookById(props.id)
}

const formattedPrice = computed(() => {
  const price = booksStore.currentBook?.price
  if (price == null) return '—'
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(price)
})

onMounted(fetchBook)

// Se navegares de um detalhe para outro (via RelatedBooksCarousel, no futuro),
// o :id muda mas o componente é reaproveitado — watch garante que refaz o fetch.
watch(() => props.id, fetchBook)
</script>
