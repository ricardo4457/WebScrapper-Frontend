<template>
  <WizardStep title="Confirmar Pesquisa" @back="searchStore.previousStep()">
    <v-list lines="one" density="compact">
      <v-list-item :title="`Distrito: ${searchStore.selections.district}`" />
      <v-list-item :title="`Concelho: ${searchStore.selections.city}`" />
      <v-list-item :title="`Escola: ${searchStore.selections.school?.name}`" />
      <v-list-item :title="`Ano: ${searchStore.selections.year}`" />
      <v-list-item :title="`Tipo de ensino: ${searchStore.selections.teachingCycle}`" />
      <v-list-item
        v-if="searchStore.selections.course"
        :title="`Curso: ${searchStore.selections.course}`"
      />
      <v-list-item
        v-if="searchStore.selections.discipline"
        :title="`Disciplina: ${searchStore.selections.discipline}`"
      />
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
import WizardStep from '../WizardStep.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import AsyncStatusBanner from '@/components/common/AsyncStatusBanner.vue'
import { useBooksStore } from '@/stores/books.store.js'
import { useSearchStore } from '@/stores/search.store.js'

const emit = defineEmits(['searched'])

const booksStore = useBooksStore()
const searchStore = useSearchStore()

async function onConfirm() {
  await booksStore.searchBySchool({
    school: searchStore.selections.school.name,
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
