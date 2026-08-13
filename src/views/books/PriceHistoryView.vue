<template>
  <PageContainer>
    <div class="d-flex align-center mb-4">
      <BackButton @click="goBack" />
    </div>

    <div class="d-flex align-center mb-4">
      <PageTitle
        :text="
          booksStore.currentBook?.title
            ? `Histórico  ${booksStore.currentBook.title}`
            : 'Histórico de Preços'
        "
        class="ml-2 mb-0"
      />
    </div>

    <template v-if="booksStore.priceHistoryLoading">
      <PriceHistorySkeleton />
    </template>

    <ErrorState
      v-else-if="booksStore.priceHistoryError"
      :message="booksStore.priceHistoryError"
      @retry="load"
    />

    <PriceHistoryEmpty v-else-if="!booksStore.priceHistory.length" />

    <template v-else>
      <div class="price-history__stats">
        <div class="price-history__stat">
          <span class="price-history__stat-label">Atual</span>
          <span class="price-history__stat-value">{{ formatPrice(currentPrice) }}</span>
        </div>
        <div class="price-history__stat">
          <span class="price-history__stat-label">Mín.</span>
          <span class="price-history__stat-value">{{ formatPrice(minPrice) }}</span>
        </div>
        <div class="price-history__stat">
          <span class="price-history__stat-label">Máx.</span>
          <span class="price-history__stat-value">{{ formatPrice(maxPrice) }}</span>
        </div>
        <div class="price-history__stat">
          <span class="price-history__stat-label">Desde o início</span>
          <span class="price-history__stat-value price-history__trend" :class="trendClass">
            <v-icon :icon="trendIcon" size="16" />
            {{ trendLabel }}
          </span>
        </div>
      </div>

      <PriceHistoryChart :history="booksStore.priceHistory" />
    </template>
  </PageContainer>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PageContainer from '@/components/layout/PageContainer.vue'
import PageTitle from '@/components/layout/PageTitle.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import BackButton from '@/components/common/BackButton.vue'
import PriceHistoryChart from '@/components/history/PriceHistoryChart.vue'
import PriceHistoryEmpty from '@/components/history/PriceHistoryEmpty.vue'
import PriceHistorySkeleton from '@/components/history/PriceHistorySkeleton.vue'
import { useBooksStore } from '@/stores/books.store.js'

const props = defineProps({
  id: { type: [String, Number], required: true },
})

const router = useRouter()
const booksStore = useBooksStore()

const currencyFormatter = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' })

function formatPrice(value) {
  if (value == null || Number.isNaN(value)) return 'N/D'
  return currencyFormatter.format(value)
}

// booksStore.priceHistory comes newest-first (see PriceHistoryChart.vue).
const currentPrice = computed(() => {
  const entry = booksStore.priceHistory[0]
  return entry ? Number(entry.price) : null
})

const oldestPrice = computed(() => {
  const entry = booksStore.priceHistory[booksStore.priceHistory.length - 1]
  return entry ? Number(entry.price) : null
})

const minPrice = computed(() => {
  if (!booksStore.priceHistory.length) return null
  return Math.min(...booksStore.priceHistory.map((h) => Number(h.price)))
})

const maxPrice = computed(() => {
  if (!booksStore.priceHistory.length) return null
  return Math.max(...booksStore.priceHistory.map((h) => Number(h.price)))
})

const trendDelta = computed(() => {
  if (currentPrice.value == null || oldestPrice.value == null) return null
  return currentPrice.value - oldestPrice.value
})

const trendLabel = computed(() => {
  if (trendDelta.value == null) return 'N/D'
  if (Math.abs(trendDelta.value) < 0.01) return 'Sem alteração'
  const sign = trendDelta.value > 0 ? '+' : ''
  return `${sign}${formatPrice(trendDelta.value)}`
})

const trendIcon = computed(() => {
  if (trendDelta.value == null || Math.abs(trendDelta.value) < 0.01) return 'mdi-minus'
  return trendDelta.value > 0 ? 'mdi-trending-up' : 'mdi-trending-down'
})

const trendClass = computed(() => {
  if (trendDelta.value == null || Math.abs(trendDelta.value) < 0.01)
    return 'price-history__trend--neutral'
  return trendDelta.value > 0 ? 'price-history__trend--up' : 'price-history__trend--down'
})

function goBack() {
  router.push({ name: 'book-detail', params: { id: props.id } })
}

function load() {
  // Reuse currentBook if it's already cached
  if (!booksStore.currentBook || String(booksStore.currentBook.id) !== String(props.id)) {
    booksStore.fetchBookById(props.id)
  }
  booksStore.fetchPriceHistory(props.id)
}

onMounted(load)
</script>

<style scoped>
.price-history__stats {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.price-history__stat {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 80px;
}

.price-history__stat-label {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.price-history__stat-value {
  font-size: 1.25rem;
  font-weight: 700;
}

.price-history__trend {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: 1rem;
}

.price-history__trend--down {
  color: rgb(var(--v-theme-primary));
}

.price-history__trend--up,
.price-history__trend--neutral {
  color: rgb(var(--v-theme-on-surface));
}
</style>
