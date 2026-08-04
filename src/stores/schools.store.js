import { defineStore } from 'pinia'
import { ref } from 'vue'
import teachingCycles from '@/data/teaching-cycles.json'
import districtsCitiesData from '@/data/districts-cities.json'
import {
  getTeachingTypesByYear,
  shouldShowTeachingTypeStep,
} from '@/data/helpers/teachingCycles.js'

export const useSchoolsStore = defineStore('schools', () => {
  const schools = ref([])
  const loading = ref(false)
  const error = ref(null)

  const cycles = ref(teachingCycles)

  const districts = ref(districtsCitiesData.distritos.map((d) => d.name))
  const cities = ref([])

  function fetchDistricts() {
    if (!districts.value.length) {
      districts.value = districtsCitiesData.distritos.map((d) => d.name)
    }
  }

  function fetchCitiesByDistrict(distrito) {
    const entry = districtsCitiesData.distritos.find((d) => d.name === distrito)
    cities.value = entry?.concelhos.map((c) => c.name) ?? []
  }

  function getTeachingTypesForYear(ano) {
    return getTeachingTypesByYear(ano)
  }

  function needsTeachingTypeStep(ano) {
    return shouldShowTeachingTypeStep(ano)
  }

  return {
    schools,
    loading,
    error,
    cycles,
    districts,
    cities,
    fetchDistricts,
    fetchCitiesByDistrict,
    getTeachingTypesForYear,
    needsTeachingTypeStep,
  }
})
