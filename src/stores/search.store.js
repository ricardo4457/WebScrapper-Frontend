import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSearchStore = defineStore('search', () => {
  const currentStep = ref(0)

  const selections = ref({
    district: null,
    city: null,
    school: null,
    teachingCycle: null,
    discipline: null,
  })

  const loading = ref(false)
  const error = ref(null)

  const isComplete = computed(() =>
    Object.values(selections.value).every((value) => value !== null)
  )

  function setSelection(key, value) {
    selections.value[key] = value
  }

  function nextStep() {
    currentStep.value += 1
  }

  function previousStep() {
    if (currentStep.value > 0) currentStep.value -= 1
  }

  function reset() {
    currentStep.value = 0
    selections.value = {
      district: null,
      city: null,
      school: null,
      teachingCycle: null,
      discipline: null,
    }
    error.value = null
  }

  return {
    currentStep,
    selections,
    loading,
    error,
    isComplete,
    setSelection,
    nextStep,
    previousStep,
    reset,
  }
})
