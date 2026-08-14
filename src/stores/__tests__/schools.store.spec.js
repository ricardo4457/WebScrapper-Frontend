import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSchoolsStore } from '@/stores/schools.store.js'
import { schoolsService } from '@/services/schools.service.js'
import districtsCities from '@/data/districts-cities.json'

vi.mock('@/services/schools.service.js', () => ({
  schoolsService: {
    list: vi.fn(),
    getCourses: vi.fn(),
    getDisciplines: vi.fn(),
  },
}))

vi.mock('@/services/scraper.service.js', () => ({
  scraperService: { getStatus: vi.fn() },
}))

describe('schools.store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('fetchDistricts() reads district names from the static JSON, not the API', () => {
    const store = useSchoolsStore()
    store.fetchDistricts()

    expect(store.districts).toEqual(districtsCities.distritos.map((d) => d.name))
    expect(store.districtsError).toBe(null)
    expect(schoolsService.list).not.toHaveBeenCalled()
  })

  it('fetchCitiesByDistrict() returns the municipalities for a known district', () => {
    const store = useSchoolsStore()
    const [firstDistrict] = districtsCities.distritos

    store.fetchCitiesByDistrict(firstDistrict.name)

    expect(store.cities).toEqual(firstDistrict.concelhos.map((c) => c.name))
  })

  it('fetchCitiesByDistrict() returns an empty list for an unknown district, without an error', () => {
    const store = useSchoolsStore()
    store.fetchCitiesByDistrict('Distrito Inexistente')

    expect(store.cities).toEqual([])
    expect(store.citiesError).toBe(null)
  })

  it('fetchSchools(): a cache hit does not trigger a discover=1 scrape', async () => {
    schoolsService.list.mockResolvedValue({
      status: 200,
      data: { schools: [{ id: 1, name: 'Escola A' }] },
    })
    const store = useSchoolsStore()

    await store.fetchSchools({ district: 'Porto', city: 'Porto', year: 7, teachingCycle: '3-ciclo' })

    expect(store.schools).toEqual([{ id: 1, name: 'Escola A' }])
    expect(schoolsService.list).toHaveBeenCalledTimes(1)
    expect(schoolsService.list).toHaveBeenCalledWith(
      expect.not.objectContaining({ discover: 1 }),
    )
  })

  it('fetchSchools(): an empty cache with full filters falls back to discover=1', async () => {
    schoolsService.list
      .mockResolvedValueOnce({ status: 200, data: { schools: [] } })
      .mockResolvedValueOnce({ status: 200, data: { schools: [{ id: 2, name: 'Escola B' }] } })

    const store = useSchoolsStore()
    await store.fetchSchools({ district: 'Porto', city: 'Porto', year: 7, teachingCycle: '3-ciclo' })

    expect(schoolsService.list).toHaveBeenCalledTimes(2)
    expect(schoolsService.list).toHaveBeenLastCalledWith(
      expect.objectContaining({ discover: 1 }),
    )
    expect(store.schools).toEqual([{ id: 2, name: 'Escola B' }])
  })

  it('fetchSchools(): an empty cache WITHOUT district+city+year+teachingCycle never triggers discover', async () => {
    schoolsService.list.mockResolvedValue({ status: 200, data: { schools: [] } })
    const store = useSchoolsStore()

    await store.fetchSchools({ search: 'Escola X' })

    expect(schoolsService.list).toHaveBeenCalledTimes(1)
    expect(store.schools).toEqual([])
  })

  it('fetchSchools(): ignores a duplicate call for the same key while one is in flight', async () => {
    let resolveList
    schoolsService.list.mockReturnValue(
      new Promise((resolve) => {
        resolveList = resolve
      }),
    )
    const store = useSchoolsStore()

    const first = store.fetchSchools({ district: 'Porto', city: 'Porto' })
    const second = store.fetchSchools({ district: 'Porto', city: 'Porto' })

    resolveList({ status: 200, data: { schools: [] } })
    await first
    await second

    expect(schoolsService.list).toHaveBeenCalledTimes(1)
  })

  it('fetchCourses(): a cache hit does not trigger discover=1', async () => {
    schoolsService.getCourses.mockResolvedValue({
      status: 200,
      data: { courses: ['Ciências e Tecnologias'] },
    })
    const store = useSchoolsStore()

    await store.fetchCourses(5, { year: 10, teachingCycle: 'secundario' })

    expect(store.courses).toEqual(['Ciências e Tecnologias'])
    expect(schoolsService.getCourses).toHaveBeenCalledTimes(1)
  })

  it('fetchCourses(): an empty cache with year+teachingCycle falls back to discover=1', async () => {
    schoolsService.getCourses
      .mockResolvedValueOnce({ status: 200, data: { courses: [] } })
      .mockResolvedValueOnce({ status: 200, data: { courses: ['Científico-Humanísticos'] } })

    const store = useSchoolsStore()
    await store.fetchCourses(5, { year: 10, teachingCycle: 'secundario' })

    expect(schoolsService.getCourses).toHaveBeenCalledTimes(2)
    expect(schoolsService.getCourses).toHaveBeenLastCalledWith(
      5,
      expect.objectContaining({ discover: 1 }),
    )
    expect(store.courses).toEqual(['Científico-Humanísticos'])
  })

  it('fetchCourses(): an empty cache without year/teachingCycle does not fall back', async () => {
    schoolsService.getCourses.mockResolvedValue({ status: 200, data: { courses: [] } })
    const store = useSchoolsStore()

    await store.fetchCourses(5, {})

    expect(schoolsService.getCourses).toHaveBeenCalledTimes(1)
  })

  it('fetchDisciplines(): builds params with optional course, and falls back to discover=1 on empty cache', async () => {
    schoolsService.getDisciplines
      .mockResolvedValueOnce({ status: 200, data: { disciplines: [] } })
      .mockResolvedValueOnce({ status: 200, data: { disciplines: ['Matemática A'] } })

    const store = useSchoolsStore()
    await store.fetchDisciplines(5, {
      year: 10,
      teachingCycle: 'secundario',
      course: 'Ciências e Tecnologias',
    })

    expect(schoolsService.getDisciplines).toHaveBeenNthCalledWith(
      1,
      5,
      expect.objectContaining({ teaching_cycle: 'secundario', course: 'Ciências e Tecnologias' }),
    )
    expect(schoolsService.getDisciplines).toHaveBeenNthCalledWith(
      2,
      5,
      expect.objectContaining({ discover: 1, year: 10 }),
    )
    expect(store.disciplines).toEqual(['Matemática A'])
  })

  it('getTeachingTypesForYear()/needsTeachingTypeStep() delegate to the static helper', () => {
    const store = useSchoolsStore()
    const withStep = store.years.find((y) => store.needsTeachingTypeStep(y))

    if (withStep !== undefined) {
      expect(store.getTeachingTypesForYear(withStep).length).toBeGreaterThan(1)
    } else {
      // No such year in the current data set: at least confirm the delegation
      // doesn't throw and returns an array for a known year.
      const [anyYear] = store.years
      expect(Array.isArray(store.getTeachingTypesForYear(anyYear))).toBe(true)
    }
  })
})
