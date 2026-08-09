import { defineStore } from 'pinia'
import { ref } from 'vue'
import { booksService } from '@/services/books.service.js'
import { useScrapeAwareFetch } from '@/composables/useScrapeAwareFetch.js'

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

// Extracts Laravel paginator metadata (current_page, last_page,
// total, per_page), which sit alongside `data` in the object returned by
// ->paginate().
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

  // All 3 search modes (school, city, q) use the same /books/search
  // endpoint, so they share a single fetch state and request key.
  const searchFetch = useScrapeAwareFetch()
  let searchRequestKey = null

  async function runSearch(params) {
    const key = JSON.stringify(params)

    // Same request already loading or scraping: avoid duplicate calls.
    if (searchRequestKey === key && (searchFetch.loading.value || searchFetch.scraping.value)) {
      return
    }

    searchRequestKey = key
    items.value = []

    const { page, ...baseParams } = params
    lastBaseParams = baseParams

    await searchFetch.run(() => booksService.search(params), {
      onResult: (data) => {
        items.value = data.books?.data ?? data.books ?? []
        pagination.value = extractPagination(data.books)
      },

      // After scraping completes, repeat the original search.
      onPollDone: async () => {
        const response = await booksService.search(params)
        items.value = response.data.books?.data ?? response.data.books ?? []
        pagination.value = extractPagination(response.data.books)
      },
    })
  }

  // Changes page while reusing the same filters from the last search.
  function goToPage(page) {
    if (!lastBaseParams) return
    return runSearch({ ...lastBaseParams, page })
  }

  // Title search is database-only and never triggers scraping.
  function searchByTitle(query, page = 1) {
    return runSearch({ q: query, page })
  }

  // Search by school (final wizard step). discipline only filters cached
  // books and is never sent to the scraping fallback.
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
