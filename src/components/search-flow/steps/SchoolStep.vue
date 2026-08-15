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
    <v-autocomplete
      v-else
      :items="schoolsStore.schools"
      :loading="schoolsStore.schoolsLoading"
      :model-value="searchStore.selections.school"
      :disabled="confirming"
      item-title="name"
      return-object
      label="Escolhe a escola"
      no-data-text="Sem escolas encontradas para este concelho."
      variant="outlined"
      @update:model-value="onSelect"
    />

    <AsyncStatusBanner v-if="confirming" message="A verificar cursos disponíveis nesta escola..." />
  </WizardStep>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import WizardStep from '../WizardStep.vue'
import ErrorState from '@/components/common/ErrorState.vue'
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

// Check for cached courses and show/hide the 'course' step accordingly.
async function onSelect(school) {
  if (!school) return

  // Prevent duplicate selection events while courses are being fetched.
  if (confirming.value) return

  searchStore.setSelection('school', { id: school.id, name: school.name })

  confirming.value = true
  try {
    const result = await schoolsStore.fetchCourses(school.id, {
      year: searchStore.selections.year,
      teachingCycle: searchStore.selections.teachingCycle,
    })

    if (result?.length) {
      // Restore the course step when courses are available.
      searchStore.restoreStep('course')
    } else if (result) {
      // Remove the course step when no courses are available.
      searchStore.removeStep('course')
      searchStore.setSelection('course', null)
    }
  } finally {
    confirming.value = false
  }

  searchStore.nextStep()
}

onMounted(load)
</script>
