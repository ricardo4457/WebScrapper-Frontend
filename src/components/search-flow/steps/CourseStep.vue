<template>
  <WizardStep title="Curso" @back="searchStore.previousStep()">
    <ErrorState v-if="schoolsStore.coursesError" :message="schoolsStore.coursesError" @retry="load" />
    <v-list v-else lines="one">
      <v-list-item
        v-for="course in schoolsStore.courses"
        :key="course"
        :title="course"
        @click="onSelect(course)"
      />
    </v-list>
  </WizardStep>
</template>

<script setup>
import WizardStep from '../WizardStep.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import { useSchoolsStore } from '@/stores/schools.store.js'
import { useSearchStore } from '@/stores/search.store.js'

const schoolsStore = useSchoolsStore()
const searchStore = useSearchStore()

// Este passo só é injetado no wizard quando schoolsStore.courses já tem
// dados (ver TeachingCycleStep.vue) — não precisa de fetch próprio aqui.
function load() {
  schoolsStore.fetchCourses(searchStore.selections.school.id, {
    year: searchStore.selections.year,
    teachingCycle: searchStore.selections.teachingCycle,
  })
}

function onSelect(course) {
  searchStore.setSelection('course', course)
  searchStore.nextStep()
}
</script>
