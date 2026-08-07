import { defineStore } from 'pinia'
import { ref } from 'vue'
import teachingCycles from '@/data/teaching-cycles.json'
import {
  getTeachingTypesByYear,
  shouldShowTeachingTypeStep,
} from '@/data/helpers/teachingCycles.js'
import { locationsService } from '@/services/locations.service.js'
import { schoolsService } from '@/services/schools.service.js'
import { useScrapeAwareFetch } from '@/composables/useScrapeAwareFetch.js'

export const useSchoolsStore = defineStore('schools', () => {
  const schools = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Teaching cycles are static (JSON), not fetched from the backend.
  const cycles = ref(teachingCycles)

  const districts = ref([])
  const districtsLoading = ref(false)
  const districtsError = ref(null)

  const cities = ref([])
  const citiesLoading = ref(false)
  const citiesError = ref(null)

  // Districts and cities come from /locations (already scraped data),
  // not from GeoAPI.pt or a static JSON file.
  async function fetchDistricts() {
    districtsLoading.value = true
    districtsError.value = null

    try {
      const response = await locationsService.getLocations()
      districts.value = response.data.districts ?? []
    } catch (err) {
      districtsError.value = err.response?.data?.message ?? 'Não foi possível obter os distritos.'
      districts.value = []
    } finally {
      districtsLoading.value = false
    }
  }

  async function fetchCitiesByDistrict(district) {
    citiesLoading.value = true
    citiesError.value = null
    cities.value = []

    try {
      const response = await locationsService.getLocations({ district })
      cities.value = response.data.cities ?? []
    } catch (err) {
      citiesError.value = err.response?.data?.message ?? 'Não foi possível obter os concelhos.'
      cities.value = []
    } finally {
      citiesLoading.value = false
    }
  }

  function getTeachingTypesForYear(ano) {
    return getTeachingTypesByYear(ano)
  }

  function needsTeachingTypeStep(ano) {
    return shouldShowTeachingTypeStep(ano)
  }

  // Courses are read-only by default. If none are cached, retry with
  // discover=1 to trigger a full_teaching_cycle scrape.
  const courses = ref([])
  const coursesFetch = useScrapeAwareFetch()

  async function fetchCourses(schoolId, { year, teachingCycle } = {}) {
    courses.value = []

    const baseParams = teachingCycle ? { teaching_cycle: teachingCycle } : {}

    const data = await coursesFetch.run(() => schoolsService.getCourses(schoolId, baseParams), {
      onResult: (data) => {
        courses.value = data.courses ?? []
      },
    })

    if (data?.courses?.length) return

    if (!year || !teachingCycle) return

    await coursesFetch.run(
      () =>
        schoolsService.getCourses(schoolId, {
          teaching_cycle: teachingCycle,
          year,
          discover: 1,
        }),
      {
        onResult: (data) => {
          courses.value = data.courses ?? []
        },
        onPollDone: async () => {
          // Re-fetch cached courses after the scrape completes.
          const response = await schoolsService.getCourses(schoolId, baseParams)
          courses.value = response.data.courses ?? []
        },
      },
    )
  }

  // Same discover=1 flow as courses; course is optional.
  const disciplines = ref([])
  const disciplinesFetch = useScrapeAwareFetch()

  async function fetchDisciplines(schoolId, { year, teachingCycle, course } = {}) {
    disciplines.value = []

    const baseParams = {
      ...(teachingCycle ? { teaching_cycle: teachingCycle } : {}),
      ...(course ? { course } : {}),
    }

    const data = await disciplinesFetch.run(
      () => schoolsService.getDisciplines(schoolId, baseParams),
      {
        onResult: (data) => {
          disciplines.value = data.disciplines ?? []
        },
      },
    )

    if (data?.disciplines?.length) return

    if (!year || !teachingCycle) return

    await disciplinesFetch.run(
      () =>
        schoolsService.getDisciplines(schoolId, {
          ...baseParams,
          year,
          discover: 1,
        }),
      {
        onResult: (data) => {
          disciplines.value = data.disciplines ?? []
        },
        onPollDone: async () => {
          // Re-fetch cached disciplines after the scrape completes.
          const response = await schoolsService.getDisciplines(schoolId, baseParams)
          disciplines.value = response.data.disciplines ?? []
        },
      },
    )
  }

  return {
    schools,
    loading,
    error,

    cycles,

    districts,
    districtsLoading,
    districtsError,

    cities,
    citiesLoading,
    citiesError,

    fetchDistricts,
    fetchCitiesByDistrict,

    getTeachingTypesForYear,
    needsTeachingTypeStep,

    courses,
    coursesLoading: coursesFetch.loading,
    coursesScraping: coursesFetch.scraping,
    coursesError: coursesFetch.error,
    coursesPollingStatus: coursesFetch.pollingStatus,
    fetchCourses,

    disciplines,
    disciplinesLoading: disciplinesFetch.loading,
    disciplinesScraping: disciplinesFetch.scraping,
    disciplinesError: disciplinesFetch.error,
    disciplinesPollingStatus: disciplinesFetch.pollingStatus,
    fetchDisciplines,
  }
})
