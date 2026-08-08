<template>
  <WizardStep title="Escola" @back="searchStore.previousStep()">
    <AsyncStatusBanner
      v-if="schoolsStore.schoolsScraping"
      message="A procurar escolas nesta zona..."
    />
    <ErrorState
      v-else-if="schoolsStore.schoolsError"
      :message="schoolsStore.schoolsError"
      @retry="load"
    />
    <EmptyState
      v-else-if="!schoolsStore.schoolsLoading && !schoolsStore.schools.length"
      title="Sem escolas encontradas"
      subtitle="Não há escolas registadas para este concelho."
    />
    <v-list v-else lines="one" :disabled="confirming">
      <v-list-item
        v-for="school in schoolsStore.schools"
        :key="school.id"
        :title="school.name"
        @click="onSelect(school)"
      />
    </v-list>

    <v-progress-circular v-if="confirming" indeterminate class="d-flex mx-auto my-4" />
  </WizardStep>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import WizardStep from '../WizardStep.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import AsyncStatusBanner from '@/components/common/AsyncStatusBanner.vue'
import { useSchoolsStore } from '@/stores/schools.store.js'
import { useSearchStore } from '@/stores/search.store.js'

const schoolsStore = useSchoolsStore()
const searchStore = useSearchStore()

const confirming = ref(false)

function load() {
  schoolsStore.fetchSchools({
    district: searchStore.selections.district,
    city: searchStore.selections.city,
    year: searchStore.selections.year,
    teachingCycle: searchStore.selections.teachingCycle,
  })
}

// Year/cycle come from TeachingCycleStep; school is known here.
// Check for cached courses and remove the 'course' step if none exist.
async function onSelect(school) {
  searchStore.setSelection('school', { id: school.id, name: school.name })

  if (searchStore.activeSteps.includes('course')) {
    confirming.value = true
    try {
      await schoolsStore.fetchCourses(school.id, {
        year: searchStore.selections.year,
        teachingCycle: searchStore.selections.teachingCycle,
      })

      if (!schoolsStore.courses.length) {
        searchStore.removeStep('course')
        searchStore.setSelection('course', null)
      }
    } finally {
      confirming.value = false
    }
  }

  searchStore.nextStep()
}

onMounted(load)
</script>
