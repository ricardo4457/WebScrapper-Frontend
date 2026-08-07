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

  // All 3 search modes (school, city, q) use the same /books/search
  // endpoint, so they share a single fetch state and request key.
  const searchFetch = useScrapeAwareFetch()
  let searchRequestKey = null

  async function runSearch(params) {
    const key = JSON.stringify(params)

    // Same request already loading or scraping: avoid duplicate calls.
    if (
      searchRequestKey === key &&
      (searchFetch.loading.value || searchFetch.scraping.value)
    ) {
      return
    }

    searchRequestKey = key
    items.value = []

    await searchFetch.run(() => booksService.search(params), {
      onResult: (data) => {
        items.value = data.books?.data ?? data.books ?? []
      },

      // After scraping completes, repeat the original search.
      onPollDone: async () => {
        const response = await booksService.search(params)
        items.value = response.data.books?.data ?? response.data.books ?? []
      },
    })
  }

  // Title search is database-only and never triggers scraping.
  function searchByTitle(query) {
    return runSearch({ q: query })
  }

  // Search by district + city without selecting a school.
  function searchByCity({ district, city, year, teachingCycle, discipline }) {
    const params = {
      district,
      city,
      year,
      teaching_cycle: teachingCycle,
      ...(discipline ? { discipline } : {}),
    }

    return runSearch(params)
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
  }) {
    const params = {
      school,
      district,
      city,
      year,
      teaching_cycle: teachingCycle,
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

  function reset() {
    items.value = []
    searchFetch.error.value = null
    searchRequestKey = null
  }

  return {
    items,

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

    searchByTitle,
    searchByCity,
    searchBySchool,
    fetchBookById,
    reset,
  }
})
