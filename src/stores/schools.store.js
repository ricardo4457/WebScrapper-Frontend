import { defineStore } from 'pinia'
import { ref } from 'vue'
import teachingCycles from '@/data/teaching-cycles.json'
import { getTeachingTypesByYear, shouldShowTeachingTypeStep } from '@/data/helpers/teachingCycles.js'

export const useSchoolsStore = defineStore('schools', () => {
  const schools = ref([])
  const districts = ref([])
  const cities = ref([])
  const loading = ref(false)
  const error = ref(null)

  const cycles = ref(teachingCycles)

  function getTeachingTypesForYear(ano) {
    return getTeachingTypesByYear(ano)
  }

  function needsTeachingTypeStep(ano) {
    return shouldShowTeachingTypeStep(ano)
  }

  return {
    schools,
    districts,
    cities,
    cycles,
    loading,
    error,
    getTeachingTypesForYear,
    needsTeachingTypeStep,
  }
})
