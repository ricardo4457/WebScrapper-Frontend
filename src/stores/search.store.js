import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Wizard steps in order. 'course' is the only conditional step.
const BASE_STEPS = [
  'district',
  'city',
  'school',
  'teachingCycle',
  'course',
  'discipline',
  'confirmation',
]

export const useSearchStore = defineStore('search', () => {
  const currentStep = ref(0)

  const selections = ref({
    district: null,
    city: null,
    school: null, // { id, name }
    year: null,
    teachingCycle: null,
    course: null, // null is valid when the step is skipped
    discipline: null,
  })

  const loading = ref(false)
  const error = ref(null)

  // Active steps for the current wizard session.
  const activeSteps = ref([...BASE_STEPS])

  const currentStepName = computed(() => activeSteps.value[currentStep.value])

  const isLastStep = computed(() => currentStep.value === activeSteps.value.length - 1)

  const isComplete = computed(() =>
    activeSteps.value
      .filter((step) => step !== 'course')
      .every((step) => {
        if (step === 'confirmation') return true
        if (step === 'school') return selections.value.school !== null
        return selections.value[step] !== null
      }),
  )

  function setSelection(key, value) {
    selections.value[key] = value
  }

  // Removes a step from the active wizard flow.
  function removeStep(stepName) {
    activeSteps.value = activeSteps.value.filter((step) => step !== stepName)
  }

  // Restores a previously removed step in its original order.
  function restoreStep(stepName) {
    if (activeSteps.value.includes(stepName)) return

    const originalIndex = BASE_STEPS.indexOf(stepName)

    const insertAt = BASE_STEPS.slice(0, originalIndex).filter((s) =>
      activeSteps.value.includes(s),
    ).length

    activeSteps.value.splice(insertAt, 0, stepName)
  }

  function nextStep() {
    if (currentStep.value < activeSteps.value.length - 1) {
      currentStep.value += 1
    }
  }

  function previousStep() {
    if (currentStep.value > 0) currentStep.value -= 1
  }

  function goToStep(stepName) {
    const index = activeSteps.value.indexOf(stepName)
    if (index !== -1) currentStep.value = index
  }

  function reset() {
    currentStep.value = 0
    activeSteps.value = [...BASE_STEPS]

    selections.value = {
      district: null,
      city: null,
      school: null,
      year: null,
      teachingCycle: null,
      course: null,
      discipline: null,
    }

    error.value = null
  }

  return {
    currentStep,
    activeSteps,
    currentStepName,
    isLastStep,
    selections,
    loading,
    error,
    isComplete,
    setSelection,
    removeStep,
    restoreStep,
    nextStep,
    previousStep,
    goToStep,
    reset,
  }
})
