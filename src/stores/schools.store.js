import { defineStore } from 'pinia'
import { ref } from 'vue'
import teachingCycles from '@/data/teaching-cycles.json'
import districtsCities from '@/data/districts-cities.json'
import {
  getTeachingTypesByYear,
  shouldShowTeachingTypeStep,
} from '@/data/helpers/teachingCycles.js'
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

  // Districts and cities come from a static local JSON (districts-cities.json,
  // gerado via src/scripts/generate-districts-cities-json.js), não da API —
  // decisão revertida: /locations do backend só devolve zonas já scraped, o
  // que impediria o wizard de oferecer distritos/concelhos ainda sem dados.
  function fetchDistricts() {
    districtsLoading.value = true
    districtsError.value = null

    try {
      districts.value = districtsCities.distritos.map((d) => d.name)
    } catch (err) {
      districtsError.value = 'Não foi possível obter os distritos.'
      districts.value = []
    } finally {
      districtsLoading.value = false
    }
  }

  function fetchCitiesByDistrict(district) {
    citiesLoading.value = true
    citiesError.value = null
    cities.value = []

    try {
      const entry = districtsCities.distritos.find((d) => d.name === district)
      cities.value = entry?.concelhos.map((c) => c.name) ?? []
    } catch (err) {
      citiesError.value = 'Não foi possível obter os concelhos.'
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

  // Schools for the SchoolStep. Same discover=1 pattern: try cache first,
  // fall back to a full_city scrape only if nothing is found and we have
  // enough info (district + city) to dispatch it.
  const schoolsFetch = useScrapeAwareFetch()

  async function fetchSchools({ district, city, search } = {}) {
    schools.value = []

    const baseParams = {
      ...(district ? { district } : {}),
      ...(city ? { city } : {}),
      ...(search ? { search } : {}),
    }

    const data = await schoolsFetch.run(() => schoolsService.list(baseParams), {
      onResult: (data) => {
        schools.value = Array.isArray(data) ? data : []
      },
    })

    if (Array.isArray(data) && data.length) return
    if (!district || !city) return

    await schoolsFetch.run(() => schoolsService.list({ ...baseParams, discover: 1 }), {
      onResult: (data) => {
        schools.value = Array.isArray(data) ? data : []
      },
      onPollDone: async () => {
        const response = await schoolsService.list(baseParams)
        schools.value = Array.isArray(response.data) ? response.data : []
      },
    })
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
    schoolsLoading: schoolsFetch.loading,
    schoolsScraping: schoolsFetch.scraping,
    schoolsError: schoolsFetch.error,
    schoolsPollingStatus: schoolsFetch.pollingStatus,
    fetchSchools,

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
