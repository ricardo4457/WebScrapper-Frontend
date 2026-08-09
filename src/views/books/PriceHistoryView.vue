<template>
  <PageContainer>
    <div class="d-flex align-center mb-4">
      <v-btn icon="mdi-arrow-left" variant="text" @click="goBack" />
      <PageTitle
        :text="
          booksStore.currentBook?.title
            ? `Histórico — ${booksStore.currentBook.title}`
            : 'Histórico de Preços'
        "
        class="ml-2 mb-0"
      />
    </div>

    <p v-if="booksStore.currentBook" class="text-h6 text-primary mb-6">
      {{ formattedCurrentPrice }}
    </p>

    <template v-if="booksStore.priceHistoryLoading">
      <v-skeleton-loader type="image" height="280" />
    </template>

    <ErrorState
      v-else-if="booksStore.priceHistoryError"
      :message="booksStore.priceHistoryError"
      @retry="load"
    />

    <PriceHistoryEmpty v-else-if="!booksStore.priceHistory.length" />

    <PriceHistoryChart v-else :history="booksStore.priceHistory" />
  </PageContainer>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PageContainer from '@/components/layout/PageContainer.vue'
import PageTitle from '@/components/layout/PageTitle.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import PriceHistoryChart from '@/components/history/PriceHistoryChart.vue'
import PriceHistoryEmpty from '@/components/history/PriceHistoryEmpty.vue'
import { useBooksStore } from '@/stores/books.store.js'

const props = defineProps({
  id: { type: [String, Number], required: true },
})

const router = useRouter()
const booksStore = useBooksStore()

const formattedCurrentPrice = computed(() => {
  const price = booksStore.currentBook?.price
  if (price == null) return null
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(price)
})

function goBack() {
  router.push({ name: 'book-detail', params: { id: props.id } })
}

function load() {
  // Reuse currentBook if it's already cached (from BooksDetailView);
  // otherwise fetch it, so title/price are shown even on direct access.
  if (!booksStore.currentBook || String(booksStore.currentBook.id) !== String(props.id)) {
    booksStore.fetchBookById(props.id)
  }
  booksStore.fetchPriceHistory(props.id)
}

onMounted(load)
</script>
