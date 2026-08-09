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
        @select="onMapSelect"
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

// Escolher o distrito, pela lista ou clicando no mapa, segue sempre para o
// CityStep, cujo mapa já aparece com zoom nesse distrito.
function onSelectDistrict(district) {
  if (!district) return
  searchStore.setSelection('district', district)
  searchStore.setSelection('city', null)
  searchStore.setSelection('school', null)
  searchStore.restoreStep('city')
  searchStore.nextStep()
}

function onMapSelect({ district }) {
  onSelectDistrict(district)
}

onMounted(load)
</script>
