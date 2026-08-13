<template>
  <WizardStep title="Curso" @back="searchStore.previousStep()">
    <AsyncStatusBanner v-if="schoolsStore.coursesScraping" message="A obter cursos..." />
    <ErrorState
      v-else-if="schoolsStore.coursesError"
      :message="schoolsStore.coursesError"
      @retry="load"
    />

    <v-autocomplete
      v-else
      :items="schoolsStore.courses"
      :loading="schoolsStore.coursesLoading"
      :model-value="searchStore.selections.course"
      label="Escolhe o curso"
      no-data-text="Sem cursos conhecidos para esta escola."
      variant="outlined"
      @update:model-value="onSelect"
    />

    <template #actions>
      <button v-if="!schoolsStore.coursesLoading" type="button" class="pill-btn" @click="onSkip">
        Saltar este passo
      </button>
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

const schoolsStore = useSchoolsStore()
const searchStore = useSearchStore()

function load() {
  const school = searchStore.selections.school

  if (!school?.id) return

  return schoolsStore.fetchCourses(school.id, {
    year: searchStore.selections.year,
    teachingCycle: searchStore.selections.teachingCycle,
  })
}

onMounted(() => {
  if (!schoolsStore.courses.length) load()
})

function onSelect(course) {
  if (!course) return

  searchStore.setSelection('course', course)
  searchStore.nextStep()
}

function onSkip() {
  searchStore.setSelection('course', null)
  searchStore.nextStep()
}
</script>
