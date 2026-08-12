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
    <ListSkeleton v-else-if="schoolsStore.schoolsLoading" />
    <EmptyState
      v-else-if="!schoolsStore.schools.length"
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

    <div v-if="confirming" class="d-flex align-center justify-center my-4">
      <v-progress-circular indeterminate color="primary" size="20" width="2" class="mr-3" />
      <span>A confirmar escola...</span>
    </div>
  </WizardStep>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import WizardStep from '../WizardStep.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import AsyncStatusBanner from '@/components/common/AsyncStatusBanner.vue'
import ListSkeleton from '@/components/common/ListSkeleton.vue'
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
