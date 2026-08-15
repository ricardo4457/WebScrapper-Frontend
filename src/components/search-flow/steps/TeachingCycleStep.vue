<template>
  <WizardStep title="Ciclo de ensino" @back="searchStore.previousStep()">
    <v-select
      :items="teachingTypes"
      label="Ciclo de ensino"
      variant="outlined"
      v-model="selectedType"
    />

    <template #actions>
      <button type="button" class="cta-btn" :disabled="!canContinue" @click="onContinue">
        Continuar
      </button>
    </template>
  </WizardStep>
</template>

<script setup>
import { ref, computed } from 'vue'
import WizardStep from '../WizardStep.vue'
import { useSchoolsStore } from '@/stores/schools.store.js'
import { useSearchStore } from '@/stores/search.store.js'

const canContinue = computed(() => !!selectedYear.value && !!selectedType.value)

const schoolsStore = useSchoolsStore()
const searchStore = useSearchStore()

const selectedYear = ref(searchStore.selections.year)
const selectedType = ref(searchStore.selections.teachingCycle)

const teachingTypes = computed(() =>
  schoolsStore.getTeachingTypesForYear(searchStore.selections.year),
)

function onContinue() {
  if (!selectedYear.value) return
  if (!selectedType.value) return

  searchStore.setSelection('year', selectedYear.value)
  searchStore.setSelection('teachingCycle', selectedType.value)

  // 1st/2nd cycle: no "course" concept — not applicable.
  const needsCourse = schoolsStore.needsTeachingTypeStep(selectedYear.value)
  if (!needsCourse) {
    searchStore.removeStep('course')
    searchStore.setSelection('course', null)
  } else {
    searchStore.restoreStep('course')
  }

  // Year and teaching_cycle are always set first.
  // Only then do we check if prefilled data justifies skipping steps.
  const { school } = searchStore.selections

  // Follows default path
  searchStore.nextStep()
}
</script>
