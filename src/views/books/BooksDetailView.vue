<template>
  <PageContainer>
    <template v-if="booksStore.detailLoading">
      <BookDetailSkeleton />
    </template>

    <ErrorState
      v-else-if="booksStore.detailError"
      :message="booksStore.detailError"
      @retry="fetchBook"
    />

    <template v-else-if="booksStore.currentBook">
      <div class="d-flex align-center mb-4">
        <BackButton @click="goBack" />
      </div>

      <h1 class="book-detail__title">
        {{ booksStore.currentBook.title }}
      </h1>

      <div class="book-detail__price-row">
        <span class="book-detail__price">
          {{ formattedPrice }}
        </span>

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
        <!-- Disciplina -->
        <v-expansion-panel>
          <v-expansion-panel-title> Disciplina </v-expansion-panel-title>

          <v-expansion-panel-text>
            <p v-if="booksStore.currentBook.discipline" class="book-detail__info">
              {{ booksStore.currentBook.discipline }}
            </p>

            <p v-else class="book-detail__empty">Sem informação de disciplina disponível.</p>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Tipo -->
        <v-expansion-panel>
          <v-expansion-panel-title> Tipo </v-expansion-panel-title>

          <v-expansion-panel-text>
            <p v-if="booksStore.currentBook.type" class="book-detail__info">
              {{ booksStore.currentBook.type }}
            </p>

            <p v-else class="book-detail__empty">Sem informação de tipo disponível.</p>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Autores -->
        <v-expansion-panel>
          <v-expansion-panel-title> Autores </v-expansion-panel-title>

          <v-expansion-panel-text>
            <v-list v-if="authorsList.length" lines="one" class="pa-0">
              <v-list-item v-for="(author, index) in authorsList" :key="index" :title="author" />
            </v-list>

            <p v-else class="book-detail__empty">Sem informação de autores disponível.</p>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Publicador -->
        <v-expansion-panel>
          <v-expansion-panel-title> Publicador </v-expansion-panel-title>

          <v-expansion-panel-text>
            <p v-if="booksStore.currentBook.publisher" class="book-detail__info">
              {{ booksStore.currentBook.publisher }}
            </p>

            <p v-else class="book-detail__empty">Sem informação de publicador disponível.</p>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Escolas -->
        <v-expansion-panel>
          <v-expansion-panel-title> Escolas Disponíveis </v-expansion-panel-title>

          <v-expansion-panel-text>
            <v-list v-if="booksStore.currentBookSchools.length" lines="two" class="pa-0">
              <v-list-item
                v-for="school in booksStore.currentBookSchools"
                :key="school.school_id"
                :title="school.name"
                :subtitle="`${school.city}, ${school.district} — ${school.year}`"
              />
            </v-list>

            <p v-else class="book-detail__empty">Sem informação de escolas disponível.</p>
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
import BookDetailSkeleton from '@/components/books/BookDetailSkeleton.vue'
import BackButton from '@/components/common/BackButton.vue'
import { useBooksStore } from '@/stores/books.store.js'

const props = defineProps({
  id: {
    type: [String, Number],
    required: true,
  },
})

const router = useRouter()
const booksStore = useBooksStore()

const currencyFormatter = new Intl.NumberFormat('pt-PT', {
  style: 'currency',
  currency: 'EUR',
})

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

  if (Array.isArray(raw)) {
    return raw.filter((author) => author)
  }

  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)

      if (Array.isArray(parsed)) {
        return parsed.filter((author) => author)
      }
    } catch {
      // Not JSON, treat the whole string as one author.
    }

    return raw.trim() ? [raw] : []
  }

  return [String(raw)]
})

function fetchBook() {
  booksStore.fetchBookById(props.id)
}

function goToHistory() {
  router.push({
    name: 'book-price-history',
    params: {
      id: props.id,
    },
  })
}

function goBack() {
  router.push({
    name: 'home',
  })
}

onMounted(fetchBook)

// If you navigate from one detail to another, the component is reused.
// Watching the id ensures the book is fetched again.
watch(() => props.id, fetchBook)
</script>

<style scoped>
.book-detail__title {
  text-align: center;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: var(--space-4);
}

.book-detail__price-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-6);
  width: 100%;
  margin-bottom: var(--space-6);
}

.book-detail__history-btn {
  margin-left: var(--space-2);
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

.book-detail__info {
  margin: 0;
}

.book-detail__empty {
  margin: 0;
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-size: 0.875rem;
}
</style>
