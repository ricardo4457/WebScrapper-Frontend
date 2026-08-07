<template>
  <WizardStep title="Ano">
    <v-select :items="schoolsStore.years" label="Ano" variant="outlined" v-model="selectedYear" />

    <v-btn color="primary" class="mt-4" :disabled="!selectedYear" @click="onContinue">
      Continuar
    </v-btn>
  </WizardStep>
</template>
<script setup>
import { ref } from 'vue'
import WizardStep from '../WizardStep.vue'
import { useSchoolsStore } from '@/stores/schools.store.js'
import { useSearchStore } from '@/stores/search.store.js'

const schoolsStore = useSchoolsStore()
const searchStore = useSearchStore()

const selectedYear = ref(searchStore.selections.year)

function onContinue() {
  searchStore.setSelection('year', selectedYear.value)
  searchStore.nextStep()
}
</script>
