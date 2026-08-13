<template>
  <WizardStep title="Disciplina (opcional)" @back="searchStore.previousStep()">
    <AsyncStatusBanner v-if="schoolsStore.disciplinesScraping" message="A obter disciplinas..." />
    <ErrorState
      v-else-if="schoolsStore.disciplinesError"
      :message="schoolsStore.disciplinesError"
      @retry="load"
    />
    <v-autocomplete
      v-else
      :items="schoolsStore.disciplines"
      :loading="schoolsStore.disciplinesLoading"
      :model-value="searchStore.selections.discipline"
      label="Escolhe a disciplina"
      no-data-text="Sem disciplinas conhecidas para esta escola."
      variant="outlined"
      @update:model-value="onSelect"
    />

    <template #actions>
      <button type="button" class="pill-btn" @click="onSkip">Saltar este passo</button>
    </template>
  </WizardStep>
</template>

<script setup>
import { onMounted } from 'vue'
import WizardStep from '../WizardStep.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import AsyncStatusBanner from '@/components/common/AsyncStatusBanner.vue'
import { useSchoolsStore } from '@/stores/schools.store.js'
import { useSearchStore } from '@/stores/search.store.js'

// discipline é enviado em /books/search como filtro server-side
// (BookSearchService::searchBySchool/searchByCity/searchByTitle) — nunca
// influencia o scraping em si, só filtra livros já existentes na BD.
// Continua opcional/saltável aqui porque a escola pode não ter disciplinas
// conhecidas ainda (mesma dependência de scraping que o CourseStep).

const schoolsStore = useSchoolsStore()
const searchStore = useSearchStore()

function load() {
  schoolsStore.fetchDisciplines(searchStore.selections.school.id, {
    year: searchStore.selections.year,
    teachingCycle: searchStore.selections.teachingCycle,
    course: searchStore.selections.course,
  })
}

function onSelect(discipline) {
  if (!discipline) return

  searchStore.setSelection('discipline', discipline)
  searchStore.nextStep()
}

function onSkip() {
  searchStore.setSelection('discipline', null)
  searchStore.nextStep()
}

onMounted(load)
</script>
