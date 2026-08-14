import { describe, it, expect, vi, beforeEach } from 'vitest'
import api from '@/api/axios.js'
import { booksService } from '@/services/books.service.js'
import { schoolsService } from '@/services/schools.service.js'
import { locationsService } from '@/services/locations.service.js'
import { scraperService } from '@/services/scraper.service.js'

vi.mock('@/api/axios.js', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('booksService', () => {
  it('search() calls GET /books/search with the given params', () => {
    booksService.search({ q: 'matemática', page: 2 })

    expect(api.get).toHaveBeenCalledWith('/books/search', { params: { q: 'matemática', page: 2 } })
  })

  it('getById() calls GET /books/:id', () => {
    booksService.getById(42)

    expect(api.get).toHaveBeenCalledWith('/books/42')
  })

  it('getPriceHistory() calls GET /books/:id/price-history', () => {
    booksService.getPriceHistory(42)

    expect(api.get).toHaveBeenCalledWith('/books/42/price-history')
  })
})

describe('schoolsService', () => {
  it('list() calls GET /schools with the given params', () => {
    schoolsService.list({ district: 'Porto' })

    expect(api.get).toHaveBeenCalledWith('/schools', { params: { district: 'Porto' } })
  })

  it('getCourses() calls GET /schools/:id/courses with the given params', () => {
    schoolsService.getCourses(7, { teaching_cycle: '3-ciclo' })

    expect(api.get).toHaveBeenCalledWith('/schools/7/courses', {
      params: { teaching_cycle: '3-ciclo' },
    })
  })

  it('getDisciplines() calls GET /schools/:id/disciplines with the given params', () => {
    schoolsService.getDisciplines(7, { course: 'Ciências' })

    expect(api.get).toHaveBeenCalledWith('/schools/7/disciplines', {
      params: { course: 'Ciências' },
    })
  })
})

describe('locationsService', () => {
  it('getLocations() calls GET /locations with an empty object by default', () => {
    locationsService.getLocations()

    expect(api.get).toHaveBeenCalledWith('/locations', { params: {} })
  })

  it('getLocations() forwards explicit params', () => {
    locationsService.getLocations({ district: 'Porto' })

    expect(api.get).toHaveBeenCalledWith('/locations', { params: { district: 'Porto' } })
  })
})

describe('scraperService', () => {
  it('startScrape() posts the payload to /book-scraper/run', () => {
    const payload = { school_id: 1, year: 7 }

    scraperService.startScrape(payload)

    expect(api.post).toHaveBeenCalledWith('/book-scraper/run', payload)
  })

  it('startDistrictScrape() posts the payload to /book-scraper/run/district', () => {
    const payload = { district: 'Porto', year: 7 }

    scraperService.startDistrictScrape(payload)

    expect(api.post).toHaveBeenCalledWith('/book-scraper/run/district', payload)
  })

  it('startCityScrape() posts the payload to /book-scraper/run/city', () => {
    const payload = { city: 'Porto', year: 7 }

    scraperService.startCityScrape(payload)

    expect(api.post).toHaveBeenCalledWith('/book-scraper/run/city', payload)
  })

  it('getStatus() calls GET /book-scraper/status/:runId', () => {
    scraperService.getStatus('run-9')

    expect(api.get).toHaveBeenCalledWith('/book-scraper/status/run-9')
  })
})
