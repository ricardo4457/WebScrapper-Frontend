<template>
  <WizardStep title="Concelho" @back="searchStore.previousStep()">
    <ErrorState v-if="schoolsStore.citiesError" :message="schoolsStore.citiesError" @retry="load" />
    <v-select
      v-else
      :items="schoolsStore.cities"
      :loading="schoolsStore.citiesLoading"
      label="Escolhe o concelho"
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
  schoolsStore.fetchCitiesByDistrict(searchStore.selections.district)
}

function onSelect(city) {
  if (!city) return
  searchStore.setSelection('city', city)
  searchStore.setSelection('school', null)
  searchStore.nextStep()
}

onMounted(load)
</script>
