<template>
  <WizardStep title="Confirmar Pesquisa" @back="searchStore.previousStep()">
    <v-list class="confirmation-list" lines="two">
      <v-list-item
        v-for="field in fields"
        :key="field.key"
        :prepend-icon="field.icon"
        :title="field.label"
        :subtitle="field.value"
        @click="onEdit(field.key)"
      >
        <template #append>
          <v-icon icon="mdi-pencil-outline" size="18" color="#2E7D32" />
        </template>
      </v-list-item>
    </v-list>

    <AsyncStatusBanner
      v-if="booksStore.searchScraping"
      message="A recolher informação sobre os livros..."
    />
    <ErrorState
      v-else-if="booksStore.searchError"
      :message="booksStore.searchError"
      @retry="onConfirm"
    />

    <template #actions>
      <button type="button" class="cta-btn" :disabled="booksStore.searchLoading" @click="onConfirm">
        {{ booksStore.searchLoading ? 'A pesquisar…' : 'Pesquisar Livros' }}
      </button>
    </template>
  </WizardStep>
</template>

<script setup>
import { computed } from 'vue'
import WizardStep from '../WizardStep.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import AsyncStatusBanner from '@/components/common/AsyncStatusBanner.vue'
import { useBooksStore } from '@/stores/books.store.js'
import { useSearchStore } from '@/stores/search.store.js'

const emit = defineEmits(['searched'])

const booksStore = useBooksStore()
const searchStore = useSearchStore()

// Only fields still part of the active flow are shown (e.g. 'course' may
// have been removed entirely if the school has none). Optional fields left
// empty (course, discipline) show a "Não indicado" placeholder instead of
// being hidden, so the user can still see and edit them here.
const FIELD_DEFS = [
  { key: 'district', label: 'Distrito', icon: 'mdi-map-outline' },
  { key: 'city', label: 'Concelho', icon: 'mdi-city-variant-outline' },
  { key: 'school', label: 'Escola', icon: 'mdi-school-outline' },
  { key: 'year', label: 'Ano', icon: 'mdi-calendar-outline' },
  { key: 'teachingCycle', label: 'Tipo de ensino', icon: 'mdi-book-education-outline' },
  { key: 'course', label: 'Curso', icon: 'mdi-certificate-outline' },
  { key: 'discipline', label: 'Disciplina', icon: 'mdi-bookshelf' },
]

const fields = computed(() =>
  FIELD_DEFS.filter((field) => searchStore.activeSteps.includes(field.key)).map((field) => ({
    ...field,
    value:
      field.key === 'school'
        ? (searchStore.selections.school?.name ?? 'Não indicado')
        : (searchStore.selections[field.key] ?? 'Não indicado'),
  })),
)

function onEdit(stepName) {
  searchStore.goToStep(stepName)
}

async function onConfirm() {
  await booksStore.searchBySchool({
    school: searchStore.selections.school.name,
    schoolId: searchStore.selections.school.id,
    district: searchStore.selections.district,
    city: searchStore.selections.city,
    year: searchStore.selections.year,
    teachingCycle: searchStore.selections.teachingCycle,
    course: searchStore.selections.course,
    discipline: searchStore.selections.discipline,
  })
  emit('searched')
}
</script>

<style scoped>
.confirmation-list {
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 0;
  overflow: hidden;
  color: #2e7d32;
}

.confirmation-list :deep(.v-list-item) {
  cursor: pointer;
  border-bottom: 1px solid var(--color-border);
}

.confirmation-list :deep(.v-list-item:last-child) {
  border-bottom: none;
}
</style>
