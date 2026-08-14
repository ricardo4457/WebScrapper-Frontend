import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useBooksStore } from '@/stores/books.store.js'
import { booksService } from '@/services/books.service.js'
import { scraperService } from '@/services/scraper.service.js'

vi.mock('@/services/books.service.js', () => ({
  booksService: {
    search: vi.fn(),
    getById: vi.fn(),
    getPriceHistory: vi.fn(),
  },
}))

// searchFetch's inner polling (for stale-data refresh) goes through this.
vi.mock('@/services/scraper.service.js', () => ({
  scraperService: {
    getStatus: vi.fn(),
  },
}))

function freshBooksPayload(overrides = {}) {
  return {
    books: {
      data: [{ id: 1, title: 'Manual de Matemática' }],
      current_page: 1,
      last_page: 1,
      total: 1,
      per_page: 15,
    },
    stale: false,
    refresh_run_id: null,
    ...overrides,
  }
}

describe('books.store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('searchByTitle() populates items and pagination from a 200 response', async () => {
    booksService.search.mockResolvedValue({
      status: 200,
      data: freshBooksPayload(),
    })

    const store = useBooksStore()
    await store.searchByTitle('matemática')

    expect(booksService.search).toHaveBeenCalledWith({ q: 'matemática', page: 1 })
    expect(store.items).toEqual([{ id: 1, title: 'Manual de Matemática' }])
    expect(store.pagination).toEqual({ currentPage: 1, lastPage: 1, total: 1, perPage: 15 })
    expect(store.stale).toBe(false)
  })

  it('searchBySchool() prefers school_id over school name when both are given', async () => {
    booksService.search.mockResolvedValue({ status: 200, data: freshBooksPayload() })
    const store = useBooksStore()

    await store.searchBySchool({
      school: 'Escola Secundária X',
      schoolId: 42,
      year: 7,
      teachingCycle: '3-ciclo',
    })

    expect(booksService.search).toHaveBeenCalledWith(
      expect.objectContaining({ school: 'Escola Secundária X', school_id: 42, year: 7 }),
    )
  })

  it('does not send course/discipline params when they are not provided', async () => {
    booksService.search.mockResolvedValue({ status: 200, data: freshBooksPayload() })
    const store = useBooksStore()

    await store.searchBySchool({ school: 'Escola Y', schoolId: 1, year: 5, teachingCycle: '2-ciclo' })

    const sentParams = booksService.search.mock.calls[0][0]
    expect(sentParams).not.toHaveProperty('course')
    expect(sentParams).not.toHaveProperty('discipline')
  })

  it('ignores a duplicate call for the same params while one is already in flight', async () => {
    let resolveSearch
    booksService.search.mockReturnValue(
      new Promise((resolve) => {
        resolveSearch = resolve
      }),
    )

    const store = useBooksStore()
    const firstCall = store.searchByTitle('livro')
    const secondCall = store.searchByTitle('livro') // same params, should be a no-op

    resolveSearch({ status: 200, data: freshBooksPayload() })
    await firstCall
    await secondCall

    expect(booksService.search).toHaveBeenCalledTimes(1)
  })

  it('goToPage() reuses the last search filters and only changes the page', async () => {
    booksService.search.mockResolvedValue({ status: 200, data: freshBooksPayload() })
    const store = useBooksStore()

    await store.searchBySchool({ school: 'Escola Z', schoolId: 7, year: 9, teachingCycle: '3-ciclo' })
    await store.goToPage(3)

    const lastCallParams = booksService.search.mock.calls.at(-1)[0]
    expect(lastCallParams).toEqual(
      expect.objectContaining({ school: 'Escola Z', school_id: 7, year: 9, page: 3 }),
    )
  })

  it('goToPage() is a no-op before any search has run', async () => {
    const store = useBooksStore()
    await store.goToPage(2)

    expect(booksService.search).not.toHaveBeenCalled()
  })

  it('flags stale results and re-fetches automatically once the background refresh completes', async () => {
    booksService.search
      .mockResolvedValueOnce({
        status: 200,
        data: freshBooksPayload({ stale: true, refresh_run_id: 'run-9' }),
      })
      .mockResolvedValueOnce({ status: 200, data: freshBooksPayload() })

    // First poll tick still finds the refresh running, second tick reports it
    // done. This avoids racing the immediate-resolution mock against the
    // 'stale' flag being set in the same microtask turn.
    scraperService.getStatus
      .mockResolvedValueOnce({ data: { status: 'running' } })
      .mockResolvedValueOnce({ data: { status: 'completed' } })

    const store = useBooksStore()
    await store.searchByTitle('livro')

    expect(store.stale).toBe(true)
    expect(store.refreshRunId).toBe('run-9')

    // Flush the first poll tick (immediate, "running" -> still stale).
    await vi.advanceTimersByTimeAsync(0)
    expect(store.stale).toBe(true)
    expect(booksService.search).toHaveBeenCalledTimes(1)

    // Advance to the next poll tick (default 2000ms interval) -> "completed".
    await vi.advanceTimersByTimeAsync(2000)

    expect(store.stale).toBe(false)
    expect(booksService.search).toHaveBeenCalledTimes(2)
  })

  it('fetchBookById() maps a 404 to a friendly not-found message', async () => {
    booksService.getById.mockRejectedValue({ response: { status: 404 } })
    const store = useBooksStore()

    await store.fetchBookById(999)

    expect(store.detailError).toBe('Livro não encontrado.')
    expect(store.currentBook).toBe(null)
    expect(store.detailLoading).toBe(false)
  })

  it('fetchBookById() surfaces a backend error message for non-404 failures', async () => {
    booksService.getById.mockRejectedValue({
      response: { status: 500, data: { message: 'Erro no servidor.' } },
    })
    const store = useBooksStore()

    await store.fetchBookById(1)

    expect(store.detailError).toBe('Erro no servidor.')
  })

  it('fetchPriceHistory() populates priceHistory on success and resets it on a new call', async () => {
    booksService.getPriceHistory.mockResolvedValue({
      data: { history: [{ price: 10, date: '2025-01-01' }] },
    })
    const store = useBooksStore()

    await store.fetchPriceHistory(1)

    expect(store.priceHistory).toEqual([{ price: 10, date: '2025-01-01' }])
    expect(store.priceHistoryLoading).toBe(false)
    expect(store.priceHistoryError).toBe(null)
  })

  it('reset() clears items, pagination and stale state', async () => {
    booksService.search.mockResolvedValue({
      status: 200,
      data: freshBooksPayload({ stale: true, refresh_run_id: 'run-1' }),
    })
    scraperService.getStatus.mockResolvedValue({ data: { status: 'running' } })

    const store = useBooksStore()
    await store.searchByTitle('livro')
    expect(store.items.length).toBe(1)

    store.reset()

    expect(store.items).toEqual([])
    expect(store.pagination).toEqual({ currentPage: 1, lastPage: 1, total: 0, perPage: 15 })
    expect(store.stale).toBe(false)
    expect(store.refreshRunId).toBe(null)
  })
})
