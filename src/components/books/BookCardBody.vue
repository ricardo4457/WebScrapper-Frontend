<template>
  <div class="book-card-body">
    <div class="book-card-body__info">
      <p v-if="book.discipline" class="book-card-body__field">
        <span class="text-medium-emphasis">Disciplina</span>
        <span class="font-weight-medium">{{ book.discipline }}</span>
      </p>
      <p v-if="book.type" class="book-card-body__field">
        <span class="text-medium-emphasis">Tipo</span>
        <span class="font-weight-medium">{{ book.type }}</span>
      </p>
      <p v-if="book.publisher" class="book-card-body__field">
        <span class="text-medium-emphasis">Editora</span>
        <span class="font-weight-medium">{{ book.publisher }}</span>
      </p>

      <v-sheet class="book-card-body__price-box" rounded="lg">
        <PriceTag :price="book.price" size="h3" class="book-card-body__price" />
        <v-btn
          size="large"
          variant="outlined"
          rounded="pill"
          color="primary"
          prepend-icon="mdi-history"
          @click.stop.prevent="goToHistory"
        >
          Ver Histórico
        </v-btn>
      </v-sheet>
    </div>

    <v-img
      v-if="book.cover_path"
      :src="book.cover_path"
      class="book-card-body__cover"
      rounded="0"
      cover
    />
    <div v-else class="book-card-body__cover book-card-body__cover--placeholder">
      <v-icon icon="mdi-book-open-page-variant-outline" size="40" />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import PriceTag from '@/components/common/PriceTag.vue'

const props = defineProps({
  book: { type: Object, required: true },
})

const router = useRouter()

function goToHistory() {
  router.push({ name: 'book-price-history', params: { id: props.book.id } })
}
</script>

<style scoped>
.book-card-body {
  display: flex;
  align-items: flex-start;
}

.book-card-body__info {
  flex: 1 1 60%;
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.book-card-body__field {
  display: flex;
  flex-direction: column;
  font-size: 0.875rem;
  line-height: 1.3;
}

.book-card-body__price-box {
  margin-top: var(--space-2);
  padding: var(--space-4) var(--space-6);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  text-align: center;
  width: 100%;
  background-color: rgb(var(--v-theme-background)) !important;
  border: 1px solid rgb(var(--v-theme-primary));
}

.book-card-body__price {
  font-size: 3rem !important;
  font-weight: 700;
  line-height: 1.1;
}

.book-card-body__cover {
  flex: 0 0 40%;
  max-width: 40%;
}

.book-card-body__cover--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(var(--v-theme-primary), 0.08);
  color: rgb(var(--v-theme-primary));
}
</style>
