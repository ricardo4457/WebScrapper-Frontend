<template>
  <WizardStep title="Concelho" @back="searchStore.previousStep()">
    <ErrorState v-if="schoolsStore.citiesError" :message="schoolsStore.citiesError" @retry="load" />
    <template v-else>
      <v-select
        :items="schoolsStore.cities"
        :loading="schoolsStore.citiesLoading"
        :model-value="searchStore.selections.city"
        label="Escolhe o concelho"
        variant="outlined"
        @update:model-value="onSelect"
      />

      <PortugalMap
        class="mt-4"
        mode="concelhos"
        :selected-district="searchStore.selections.district"
        :selected-city="searchStore.selections.city"
        @select="onSelectFromMap"
      />
    </template>
  </WizardStep>
</template>

<script setup>
import { onMounted } from 'vue'
import WizardStep from '../WizardStep.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import PortugalMap from '@/components/common/PortugalMap.vue'
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

// Escolher o concelho no mapa faz o mesmo que escolher na lista.
function onSelectFromMap({ city }) {
  onSelect(city)
}

onMounted(load)
</script>
