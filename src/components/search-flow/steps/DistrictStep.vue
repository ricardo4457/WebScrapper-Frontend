<template>
  <WizardStep title="Distrito" :show-back="false">
    <ErrorState v-if="schoolsStore.districtsError" :message="schoolsStore.districtsError" @retry="load" />
    <v-select
      v-else
      :items="schoolsStore.districts"
      :loading="schoolsStore.districtsLoading"
      label="Escolhe o distrito"
      variant="outlined"
      @update:model-value="onSelect"
    />
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

function load() {
  schoolsStore.fetchDistricts()
}

function onSelect(district) {
  if (!district) return
  searchStore.setSelection('district', district)
  // Reset de seleções dependentes, caso o utilizador volte atrás e mude o distrito
  searchStore.setSelection('city', null)
  searchStore.setSelection('school', null)
  searchStore.nextStep()
}

onMounted(load)
</script>
