<template>
  <WizardStep title="Escola" @back="searchStore.previousStep()">
    <AsyncStatusBanner
      v-if="schoolsStore.schoolsScraping"
      message="A procurar escolas nesta zona..."
    />
    <ErrorState
      v-else-if="schoolsStore.schoolsError"
      :message="schoolsStore.schoolsError"
      @retry="load"
    />
    <EmptyState
      v-else-if="!schoolsStore.schoolsLoading && !schoolsStore.schools.length"
      title="Sem escolas encontradas"
      subtitle="Não há escolas registadas para este concelho."
    />
    <v-list v-else lines="one">
      <v-list-item
        v-for="school in schoolsStore.schools"
        :key="school.id"
        :title="school.name"
        @click="onSelect(school)"
      />
    </v-list>
  </WizardStep>
</template>

<script setup>
import { onMounted } from 'vue'
import WizardStep from '../WizardStep.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import AsyncStatusBanner from '@/components/common/AsyncStatusBanner.vue'
import { useSchoolsStore } from '@/stores/schools.store.js'
import { useSearchStore } from '@/stores/search.store.js'

const schoolsStore = useSchoolsStore()
const searchStore = useSearchStore()

function load() {
  schoolsStore.fetchSchools({
    district: searchStore.selections.district,
    city: searchStore.selections.city,
    year: searchStore.selections.year,
    teachingCycle: searchStore.selections.teachingCycle,
  })
}

function onSelect(school) {
  searchStore.setSelection('school', { id: school.id, name: school.name })
  searchStore.nextStep()
}

onMounted(load)
</script>
