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
import { onMounted } from 'vue'
import WizardStep from '../WizardStep.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import { useSchoolsStore } from '@/stores/schools.store.js'
import { useSearchStore } from '@/stores/search.store.js'

const schoolsStore = useSchoolsStore()
const searchStore = useSearchStore()

async function load() {
  const school = searchStore.selections.school

  if (!school?.id) return

  await schoolsStore.fetchCourses(school.id, {
    year: searchStore.selections.year,
    teachingCycle: searchStore.selections.teachingCycle,
  })
}

onMounted(load)

function onSelect(course) {
  searchStore.setSelection('course', course)
  searchStore.nextStep()
}
</script>
