<template>
  <div class="search-wizard">
    <DistrictStep v-if="searchStore.currentStepName === 'district'" />
    <CityStep v-else-if="searchStore.currentStepName === 'city'" />
    <YearStep v-else-if="step === 'year'" />
    <SchoolStep v-else-if="searchStore.currentStepName === 'school'" />
    <TeachingCycleStep v-else-if="searchStore.currentStepName === 'teachingCycle'" />
    <CourseStep v-else-if="searchStore.currentStepName === 'course'" />
    <DisciplineStep v-else-if="searchStore.currentStepName === 'discipline'" />
    <ConfirmationStep
      v-else-if="searchStore.currentStepName === 'confirmation'"
      @searched="$emit('searched')"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useSearchStore } from '@/stores/search.store.js'
import YearStep from './steps/YearStep.vue'
import TeachingCycleStep from './steps/TeachingCycleStep.vue'
import DistrictStep from './steps/DistrictStep.vue'
import CityStep from './steps/CityStep.vue'
import SchoolStep from './steps/SchoolStep.vue'
import CourseStep from './steps/CourseStep.vue'
import DisciplineStep from './steps/DisciplineStep.vue'
import ConfirmationStep from './steps/ConfirmationStep.vue'

defineEmits(['searched'])

const searchStore = useSearchStore()

const step = computed(() => searchStore.currentStepName)
</script>
