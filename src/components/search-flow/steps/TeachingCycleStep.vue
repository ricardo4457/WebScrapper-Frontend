<template>
  <WizardStep title="Ano de Escolaridade" @back="searchStore.previousStep()">
    <v-select
      :items="years"
      label="Escolhe o ano"
      variant="outlined"
      v-model="selectedYear"
    />

    <v-select
      v-if="selectedYear && teachingTypes.length > 1"
      :items="teachingTypes"
      label="Tipo de ensino"
      variant="outlined"
      class="mt-4"
      v-model="selectedType"
    />

    <AsyncStatusBanner v-if="schoolsStore.coursesScraping" message="A confirmar cursos disponíveis..." />

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
import AsyncStatusBanner from '@/components/common/AsyncStatusBanner.vue'
import teachingCycles from '@/data/teaching-cycles.json'
import { useSchoolsStore } from '@/stores/schools.store.js'
import { useSearchStore } from '@/stores/search.store.js'

const schoolsStore = useSchoolsStore()
const searchStore = useSearchStore()

const years = teachingCycles.flatMap((cycle) => cycle.anos)

const selectedYear = ref(null)
const selectedType = ref(null)
const confirming = ref(false)

const teachingTypes = computed(() =>
  selectedYear.value ? schoolsStore.getTeachingTypesForYear(selectedYear.value) : [],
)

// Se só houver um tipo de ensino possível para o ano, não há escolha a fazer.
const resolvedType = computed(() => {
  if (teachingTypes.value.length === 1) return teachingTypes.value[0]
  return selectedType.value
})

const canContinue = computed(() => selectedYear.value && resolvedType.value)

async function onContinue() {
  searchStore.setSelection('year', selectedYear.value)
  searchStore.setSelection('teachingCycle', resolvedType.value)

  const needsCourse = schoolsStore.needsTeachingTypeStep(selectedYear.value)

  if (!needsCourse) {
    // 1º/2º ciclo: não existe conceito de "curso" — salta sempre este passo.
    searchStore.removeStep('course')
    searchStore.setSelection('course', null)
    searchStore.nextStep()
    return
  }

  // 3º ciclo / secundário: verifica se já há cursos conhecidos para esta escola.
  confirming.value = true
  await schoolsStore.fetchCourses(searchStore.selections.school.id, {
    year: selectedYear.value,
    teachingCycle: resolvedType.value,
  })
  confirming.value = false

  if (schoolsStore.courses.length) {
    searchStore.restoreStep('course')
  } else {
    // Escola nova, sem cursos conhecidos — salta o passo, curso fica null.
    searchStore.removeStep('course')
    searchStore.setSelection('course', null)
  }

  searchStore.nextStep()
}
</script>
