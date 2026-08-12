import { defineStore } from 'pinia'
import { ref } from 'vue'
import teachingCycles from '@/data/teaching-cycles.json'
import districtsCities from '@/data/districts-cities.json'
import {
  getYears,
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
  const years = ref(getYears())

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
  // full_city scrapes discover every school in a concelho and can take much
  // longer than the default 120s polling timeout, so this flow gets a
  // longer window (10 min) to avoid the frontend giving up before the
  // backend actually finishes.
  const schoolsFetch = useScrapeAwareFetch({ pollTimeoutMs: 10 * 60 * 1000 })
  let schoolsRequestKey = null

  async function fetchSchools({ district, city, search, year, teachingCycle } = {}) {
    const key = JSON.stringify({ district, city, search })

    // Já há um pedido/scrape em curso para a mesma escola/zona não repetir.
    if (schoolsRequestKey === key && (schoolsFetch.loading.value || schoolsFetch.scraping.value)) {
      return
    }
    schoolsRequestKey = key

    schools.value = []

    const baseParams = {
      ...(district ? { district } : {}),
      ...(city ? { city } : {}),
      ...(search ? { search } : {}),
      ...(year ? { year } : {}),
      ...(teachingCycle ? { teaching_cycle: teachingCycle } : {}),
    }

    const data = await schoolsFetch.run(() => schoolsService.list(baseParams), {
      onResult: (data) => {
        schools.value = data.schools ?? []
      },
    })

    if (data?.schools?.length) return
    if (!district || !city || !year || !teachingCycle) return

    await schoolsFetch.run(() => schoolsService.list({ ...baseParams, discover: 1 }), {
      onResult: (data) => {
        schools.value = data.schools ?? []
      },
      onPollDone: async (statusData) => {
        // If polling gave up on a timeout instead of a real terminal status,
        // still try the re-fetch: the scrape may well have finished on the
        // backend by now, it's just that the frontend stopped waiting.
        try {
          const response = await schoolsService.list(baseParams)
          schools.value = response.data.schools ?? []
        } catch (err) {
          schoolsFetch.error.value =
            err.response?.data?.message ?? 'Não foi possível carregar as escolas depois do scrape.'
        }
      },
    })
  }

  // Courses are read-only by default. If none are cached, retry with
  // discover=1 to trigger a full_teaching_cycle scrape.
  const courses = ref([])
  const coursesFetch = useScrapeAwareFetch()
  let coursesRequestKey = null

  async function fetchCourses(schoolId, { year, teachingCycle } = {}) {
    const key = JSON.stringify({ schoolId, year, teachingCycle })

    if (coursesRequestKey === key && (coursesFetch.loading.value || coursesFetch.scraping.value)) {
      return
    }
    coursesRequestKey = key

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
  let disciplinesRequestKey = null

  async function fetchDisciplines(schoolId, { year, teachingCycle, course } = {}) {
    const key = JSON.stringify({ schoolId, year, teachingCycle, course })

    if (
      disciplinesRequestKey === key &&
      (disciplinesFetch.loading.value || disciplinesFetch.scraping.value)
    ) {
      return
    }
    disciplinesRequestKey = key

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
    schoolsRetryAfter: schoolsFetch.retryAfter,
    schoolsPollingStatus: schoolsFetch.pollingStatus,
    fetchSchools,

    cycles,
    years,

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
    coursesRetryAfter: coursesFetch.retryAfter,
    coursesPollingStatus: coursesFetch.pollingStatus,
    fetchCourses,

    disciplines,
    disciplinesLoading: disciplinesFetch.loading,
    disciplinesScraping: disciplinesFetch.scraping,
    disciplinesError: disciplinesFetch.error,
    disciplinesRetryAfter: disciplinesFetch.retryAfter,
    disciplinesPollingStatus: disciplinesFetch.pollingStatus,
    fetchDisciplines,
  }
})
