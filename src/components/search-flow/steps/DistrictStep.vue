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
  schoolsStore.fetchDistricts()
}

// Escolha só do distrito, seja pela lista ou clicando num distrito do
// mapa antes de escolher o concelho. O CityStep continua no fluxo.
function onSelectDistrict(district) {
  if (!district) return
  searchStore.setSelection('district', district)
  searchStore.setSelection('city', null)
  searchStore.setSelection('school', null)
  searchStore.restoreStep('city')
  searchStore.nextStep()
}

// Escolher um concelho diretamente no mapa responde a este passo e ao
// seguinte de uma vez só, por isso o CityStep e saltado.
function onSelectFromMap({ district, city }) {
  searchStore.setSelection('district', district)
  searchStore.setSelection('city', city)
  searchStore.setSelection('school', null)
  searchStore.removeStep('city')
  searchStore.nextStep()
}

onMounted(load)
</script>
