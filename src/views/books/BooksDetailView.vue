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
        <PriceTag :price="booksStore.currentBook.price" size="h3" />
        <v-btn
          icon="mdi-history"
          variant="tonal"
          color="primary"
          size="small"
          class="ml-2"
          @click="goToHistory"
        />
      </div>

      <v-img
        v-if="booksStore.currentBook.cover_path"
        :src="booksStore.currentBook.cover_path"
        class="book-detail__cover mx-auto"
        rounded="lg"
        max-width="280"
        aspect-ratio="3/4"
      />
      <div v-else class="book-detail__cover book-detail__cover--placeholder mx-auto">
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

        <v-expansion-panel v-if="booksStore.currentBook.authors">
          <v-expansion-panel-title>Autores</v-expansion-panel-title>
          <v-expansion-panel-text>{{ booksStore.currentBook.authors }}</v-expansion-panel-text>
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
import { onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import PageContainer from '@/components/layout/PageContainer.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import PriceTag from '@/components/common/PriceTag.vue'
import { useBooksStore } from '@/stores/books.store.js'

const props = defineProps({
  id: { type: [String, Number], required: true },
})

const router = useRouter()
const booksStore = useBooksStore()

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
  margin-bottom: 24px;
}

.book-detail__cover {
  width: 100%;
  max-width: 280px;
  aspect-ratio: 3 / 4;
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
