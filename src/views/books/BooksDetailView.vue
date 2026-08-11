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
      <div class="d-flex align-center mb-4">
        <v-btn icon="mdi-arrow-left" variant="text" @click="goBack" />
      </div>

      <h1 class="book-detail__title">{{ booksStore.currentBook.title }}</h1>

      <div class="book-detail__price-row">
        <span class="book-detail__price">{{ formattedPrice }}</span>
        <v-btn
          icon="mdi-history"
          variant="tonal"
          color="primary"
          size="small"
          class="book-detail__history-btn"
          @click="goToHistory"
        />
      </div>

      <v-img
        v-if="booksStore.currentBook.cover_path"
        :src="booksStore.currentBook.cover_path"
        class="book-detail__cover"
        rounded="lg"
        aspect-ratio="3/4"
      />
      <div v-else class="book-detail__cover book-detail__cover--placeholder">
        <v-icon icon="mdi-book-open-page-variant-outline" size="56" />
      </div>

      <v-expansion-panels variant="accordion" class="book-detail__accordion mt-6">
        <v-expansion-panel v-if="booksStore.currentBook.discipline">
          <v-expansion-panel-title>Disciplina</v-expansion-panel-title>
          <v-expansion-panel-text>{{ booksStore.currentBook.discipline }}</v-expansion-panel-text>
        </v-expansion-panel>

        <v-expansion-panel v-if="booksStore.currentBook.type">
          <v-expansion-panel-title>Tipo</v-expansion-panel-title>
          <v-expansion-panel-text>{{ booksStore.currentBook.type }}</v-expansion-panel-text>
        </v-expansion-panel>

        <v-expansion-panel v-if="authorsList.length">
          <v-expansion-panel-title>Autores</v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-list lines="one" class="pa-0">
              <v-list-item v-for="(author, index) in authorsList" :key="index" :title="author" />
            </v-list>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <v-expansion-panel v-if="booksStore.currentBook.publisher">
          <v-expansion-panel-title>Publicador</v-expansion-panel-title>
          <v-expansion-panel-text>{{ booksStore.currentBook.publisher }}</v-expansion-panel-text>
        </v-expansion-panel>

        <v-expansion-panel>
          <v-expansion-panel-title>Escolas Disponíveis</v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-list v-if="booksStore.currentBookSchools.length" lines="two" class="pa-0">
              <v-list-item
                v-for="school in booksStore.currentBookSchools"
                :key="school.school_id"
                :title="school.name"
                :subtitle="`${school.city}, ${school.district} — ${school.year}`"
              />
            </v-list>
            <p v-else class="text-body-2 text-medium-emphasis">
              Sem informação de escolas disponível.
            </p>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </template>
  </PageContainer>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import PageContainer from '@/components/layout/PageContainer.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import { useBooksStore } from '@/stores/books.store.js'

const props = defineProps({
  id: { type: [String, Number], required: true },
})

const router = useRouter()
const booksStore = useBooksStore()

const currencyFormatter = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' })

const formattedPrice = computed(() => {
  const price = booksStore.currentBook?.price
  if (price == null) return '—'
  return currencyFormatter.format(price)
})

// Authors can be returned as an array, a JSON-encoded string
// or plain text, which is treated as a single author.
const authorsList = computed(() => {
  const raw = booksStore.currentBook?.authors
  if (!raw) return []

  if (Array.isArray(raw)) return raw

  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    } catch {
      // not JSON, treat the whole string as one author
    }
    return [raw]
  }

  return [String(raw)]
})

function fetchBook() {
  booksStore.fetchBookById(props.id)
}

function goToHistory() {
  router.push({ name: 'book-price-history', params: { id: props.id } })
}

function goBack() {
  router.back()
}

onMounted(fetchBook)

// If you navigate from one detail to another (via RelatedBooksCarousel, in the future),
// the :id changes but the component is reused watch ensures the fetch runs again.
watch(() => props.id, fetchBook)
</script>

<style scoped>
.book-detail__title {
  text-align: center;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 12px;
}

.book-detail__price-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  width: 100%;
  margin-bottom: 24px;
}

.book-detail__history-btn {
  margin-left: 4px;
}

.book-detail__price {
  color: rgb(var(--v-theme-primary));
  font-weight: 700;
  font-size: clamp(1.75rem, 6vw, 2.5rem);
  line-height: 1;
}

.book-detail__cover {
  display: block !important;
  width: 100%;
  max-width: 280px !important;
  aspect-ratio: 3 / 4;
  margin: 0 auto !important;
}

.book-detail__cover--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background-color: rgba(var(--v-theme-primary), 0.08);
  color: rgb(var(--v-theme-primary));
}
</style>
