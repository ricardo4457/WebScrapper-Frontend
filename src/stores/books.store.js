import { defineStore } from 'pinia'
import { ref } from 'vue'
import { booksService } from '@/services/books.service.js'
import { useScrapeAwareFetch } from '@/composables/useScrapeAwareFetch.js'
import { usePolling } from '@/composables/usePolling.js'

export const useBooksStore = defineStore('books', () => {
  const items = ref([])

  const currentBook = ref(null)
  const currentBookSchools = ref([])
  const detailLoading = ref(false)
  const detailError = ref(null)

  const priceHistory = ref([])
  const priceHistoryLoading = ref(false)
  const priceHistoryError = ref(null)

  const pagination = ref({ currentPage: 1, lastPage: 1, total: 0, perPage: 15 })
  let lastBaseParams = null

  // Extract Laravel pagination metadata.
  function extractPagination(booksPayload) {
    if (!booksPayload || Array.isArray(booksPayload)) {
      return { currentPage: 1, lastPage: 1, total: 0, perPage: 15 }
    }
    return {
      currentPage: booksPayload.current_page ?? 1,
      lastPage: booksPayload.last_page ?? 1,
      total: booksPayload.total ?? booksPayload.data?.length ?? 0,
      perPage: booksPayload.per_page ?? 15,
    }
  }

  // Shared fetch state for all search modes.
  const searchFetch = useScrapeAwareFetch()
  let searchRequestKey = null

  // Separate polling for stale-data refreshes.
  const stale = ref(false)
  const refreshRunId = ref(null)
  const refreshPolling = usePolling()

  async function runSearch(params) {
    const key = JSON.stringify(params)

    // Avoid duplicate requests while loading.
    if (searchRequestKey === key && (searchFetch.loading.value || searchFetch.scraping.value)) {
      return
    }

    searchRequestKey = key
    items.value = []
    stale.value = false
    refreshRunId.value = null
    refreshPolling.stop()

    const { page, ...baseParams } = params
    lastBaseParams = baseParams

    await searchFetch.run(() => booksService.search(params), {
      onResult: (data) => {
        items.value = data.books?.data ?? data.books ?? []
        pagination.value = extractPagination(data.books)
        applyStaleState(data, params)
      },

      // Reload results after scraping finishes
      onPollDone: async () => {
        const response = await booksService.search(params)
        items.value = response.data.books?.data ?? response.data.books ?? []
        pagination.value = extractPagination(response.data.books)
        applyStaleState(response.data, params)
      },
    })
  }

  // Active ScrapeRun statuses.
  const REFRESH_ACTIVE_STATUSES = ['pending', 'running']

  // Handle stale-data refresh polling.
  function applyStaleState(data, params) {
    stale.value = Boolean(data.stale)
    refreshRunId.value = data.refresh_run_id ?? null

    if (stale.value && refreshRunId.value) {
      refreshPolling.start(refreshRunId.value, (statusData) => {
        if (REFRESH_ACTIVE_STATUSES.includes(statusData.status)) return

        // Refresh completed: reload results.
        stale.value = false
        booksService.search(params).then((response) => {
          items.value = response.data.books?.data ?? response.data.books ?? []
          pagination.value = extractPagination(response.data.books)
        })
      })
    }
  }

  // Change page using the last filters.
  function goToPage(page) {
    if (!lastBaseParams) return
    return runSearch({ ...lastBaseParams, page })
  }

  // Database-only title search.
  function searchByTitle(query, page = 1) {
    return runSearch({ q: query, page })
  }

  // Search by school.
  function searchBySchool({
    school,
    district,
    city,
    year,
    teachingCycle,
    course,
    discipline,
    page = 1,
  }) {
    const params = {
      school,
      district,
      city,
      year,
      teaching_cycle: teachingCycle,
      page,
      ...(course ? { course } : {}),
      ...(discipline ? { discipline } : {}),
    }

    return runSearch(params)
  }

  async function fetchBookById(id) {
    detailLoading.value = true
    detailError.value = null
    currentBook.value = null

    try {
      const response = await booksService.getById(id)
      currentBook.value = response.data.book
      currentBookSchools.value = response.data.schools ?? []
    } catch (err) {
      detailError.value =
        err.response?.status === 404
          ? 'Livro não encontrado.'
          : (err.response?.data?.message ?? 'Não foi possível carregar o livro.')
    } finally {
      detailLoading.value = false
    }
  }

  async function fetchPriceHistory(bookId) {
    priceHistoryLoading.value = true
    priceHistoryError.value = null
    priceHistory.value = []

    try {
      const response = await booksService.getPriceHistory(bookId)
      priceHistory.value = response.data.history ?? []
    } catch (err) {
      priceHistoryError.value =
        err.response?.status === 404
          ? 'Livro não encontrado.'
          : (err.response?.data?.message ?? 'Não foi possível carregar o histórico de preços.')
    } finally {
      priceHistoryLoading.value = false
    }
  }

  function reset() {
    items.value = []
    searchFetch.error.value = null
    searchRequestKey = null
    lastBaseParams = null
    pagination.value = { currentPage: 1, lastPage: 1, total: 0, perPage: 15 }
    stale.value = false
    refreshRunId.value = null
    refreshPolling.stop()
  }

  return {
    items,
    pagination,

    searchLoading: searchFetch.loading,
    searchScraping: searchFetch.scraping,
    searchError: searchFetch.error,
    searchRetryAfter: searchFetch.retryAfter,
    searchPollingStatus: searchFetch.pollingStatus,
    searchRunId: searchFetch.runId,

    stale,
    refreshRunId,

    currentBook,
    currentBookSchools,
    detailLoading,
    detailError,

    priceHistory,
    priceHistoryLoading,
    priceHistoryError,

    searchByTitle,
    searchBySchool,
    goToPage,
    fetchBookById,
    fetchPriceHistory,
    reset,
  }
})
