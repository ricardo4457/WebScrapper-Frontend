<template>
  <WizardStep title="Disciplina (opcional)" @back="searchStore.previousStep()">
    <AsyncStatusBanner v-if="schoolsStore.disciplinesScraping" message="A obter disciplinas..." />
    <ErrorState
      v-else-if="schoolsStore.disciplinesError"
      :message="schoolsStore.disciplinesError"
      @retry="load"
    />
    <EmptyState
      v-else-if="!schoolsStore.disciplinesLoading && !schoolsStore.disciplines.length"
      title="Sem disciplinas conhecidas"
      subtitle="Podes avançar sem filtrar por disciplina."
    />
    <v-list v-else lines="one">
      <v-list-item
        v-for="discipline in schoolsStore.disciplines"
        :key="discipline"
        :title="discipline"
        @click="onSelect(discipline)"
      />
    </v-list>

    <template #actions>
      <button type="button" class="pill-btn" @click="onSkip">Saltar este passo</button>
    </template>
  </WizardStep>
</template>

<script setup>
import { onMounted } from 'vue'
import WizardStep from '../WizardStep.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import EmptyState from '@/components/common/EmptyState.vue'
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
  searchStore.setSelection('discipline', discipline)
  searchStore.nextStep()
}

function onSkip() {
  searchStore.setSelection('discipline', null)
  searchStore.nextStep()
}

onMounted(load)
</script>
