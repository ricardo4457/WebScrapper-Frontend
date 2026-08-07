<template>
  <WizardStep title="Ciclo de ensino" @back="searchStore.previousStep()">
    <v-select
      :items="teachingTypes"
      label="Ciclo de ensino"
      variant="outlined"
      v-model="selectedType"
    />

    <v-btn
      color="primary"
      class="mt-4"
      :loading="confirming"
      :disabled="!canContinue"
      @click="onContinue"
    >
      Continuar
    </v-btn>
  </WizardStep>
</template>

<script setup>
import { ref, computed } from 'vue'
import WizardStep from '../WizardStep.vue'
import { useSchoolsStore } from '@/stores/schools.store.js'
import { useSearchStore } from '@/stores/search.store.js'

const confirming = ref(false)

const canContinue = computed(() => !!selectedYear.value && !!selectedType.value)

const schoolsStore = useSchoolsStore()
const searchStore = useSearchStore()

const selectedYear = ref(searchStore.selections.year)
const selectedType = ref(searchStore.selections.teachingCycle)

const teachingTypes = computed(() =>
  schoolsStore.getTeachingTypesForYear(searchStore.selections.year),
)

async function onContinue() {
  // Validate required selections
  if (!selectedYear.value) return
  if (!selectedType.value) return

  searchStore.setSelection('year', selectedYear.value)
  searchStore.setSelection('teachingCycle', selectedType.value)

  const needsCourse = schoolsStore.needsTeachingTypeStep(selectedYear.value)

  // 1º/2º ciclo: no course step
  if (!needsCourse) {
    searchStore.removeStep('course')
    searchStore.setSelection('course', null)
    searchStore.nextStep()
    return
  }

  // If no school is selected yet, continue and let CourseStep load later
  const school = searchStore.selections.school
  if (!school?.id) {
    searchStore.restoreStep('course')
    searchStore.nextStep()
    return
  }

  // 3º ciclo / secundário: check cached courses
  confirming.value = true

  try {
    await schoolsStore.fetchCourses(school.id, {
      year: selectedYear.value,
      teachingCycle: selectedType.value,
    })

    if (schoolsStore.courses.length) {
      searchStore.restoreStep('course')
    } else {
      searchStore.removeStep('course')
      searchStore.setSelection('course', null)
    }

    searchStore.nextStep()
  } finally {
    confirming.value = false
  }
}
</script>
