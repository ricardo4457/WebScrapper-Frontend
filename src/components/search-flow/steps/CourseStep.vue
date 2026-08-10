<template>
  <WizardStep title="Curso" @back="searchStore.previousStep()">
    <ErrorState
      v-if="schoolsStore.coursesError"
      :message="schoolsStore.coursesError"
      @retry="load"
    />

    <v-progress-circular
      v-else-if="schoolsStore.coursesLoading"
      indeterminate
      class="d-flex mx-auto my-6"
    />

    <EmptyState
      v-else-if="!schoolsStore.courses.length"
      title="Sem cursos conhecidos"
      subtitle="Podes avançar sem escolher curso."
    />

    <v-list v-else lines="one">
      <v-list-item
        v-for="course in schoolsStore.courses"
        :key="course"
        :title="course"
        @click="onSelect(course)"
      />
    </v-list>

    <v-btn v-if="!schoolsStore.coursesLoading" variant="text" class="mt-4" @click="onSkip">
      Saltar este passo
    </v-btn>
  </WizardStep>
</template>

<script setup>
import { onMounted } from 'vue'
import WizardStep from '../WizardStep.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import EmptyState from '@/components/common/EmptyState.vue'
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
  searchStore.setSelection('course', course)
  searchStore.nextStep()
}

function onSkip() {
  searchStore.setSelection('course', null)
  searchStore.nextStep()
}
</script>
