<template>
  <WizardStep title="Distrito" @back="searchStore.previousStep()">
    <ErrorState
      v-if="schoolsStore.districtsError"
      :message="schoolsStore.districtsError"
      @retry="load"
    />
    <template v-else>
      <v-select
        :items="schoolsStore.districts"
        :loading="schoolsStore.districtsLoading"
        :model-value="searchStore.selections.district"
        label="Escolhe o distrito"
        variant="outlined"
        @update:model-value="onSelectDistrict"
      />

      <PortugalMap
        class="mt-4"
        :selected-district="searchStore.selections.district"
        :selected-city="searchStore.selections.city"
        :sync-on-mount="false"
        @select="onSelectFromMap"
        @district-enter="onEnterDistrictFromMap"
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
  schoolsStore.fetchDistricts()
}

// District selected from list or map.
function onSelectDistrict(district) {
  if (!district) return
  searchStore.setSelection('district', district)
  searchStore.setSelection('city', null)
  searchStore.setSelection('school', null)
  searchStore.restoreStep('city')
  searchStore.nextStep()
}

// city selected directly from the map.
function onSelectFromMap({ district, city }) {
  searchStore.setSelection('district', district)
  searchStore.setSelection('city', city)
  searchStore.setSelection('school', null)
  searchStore.restoreStep('city')
  searchStore.nextStep()
}

// District or island opened on the map without selecting a city.
function onEnterDistrictFromMap(district) {
  if (!district) return
  searchStore.setSelection('district', district)
  searchStore.setSelection('city', null)
  searchStore.setSelection('school', null)
  searchStore.restoreStep('city')
}

onMounted(load)
</script>
