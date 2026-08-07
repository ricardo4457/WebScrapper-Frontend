import { defineStore } from 'pinia'
import { ref } from 'vue'
import { booksService } from '@/services/books.service.js'
import { useScrapeAwareFetch } from '@/composables/useScrapeAwareFetch.js'

export const useBooksStore = defineStore('books', () => {
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)

  const currentBook = ref(null)
  const currentBookSchools = ref([])
  const detailLoading = ref(false)
  const detailError = ref(null)

  async function searchByTitle(query) {
    loading.value = true
    error.value = null
    try {
      const response = await booksService.search({ q: query })
      items.value = response.data.books.data ?? response.data.books
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Não foi possível pesquisar livros.'
      items.value = []
    } finally {
      loading.value = false
    }
  }

  // School search (final Search Wizard step). discipline only filters cached
  // books and is never used by the scraping fallback.
  // Repeat the original search after the scrape finishes.

  const searchFetch = useScrapeAwareFetch()

  async function searchBySchool({
    school,
    district,
    city,
    year,
    teachingCycle,
    course,
    discipline,
  }) {
    items.value = []

    const params = {
      school,
      district,
      city,
      year,
      teaching_cycle: teachingCycle,
      ...(course ? { course } : {}),
      ...(discipline ? { discipline } : {}),
    }

    await searchFetch.run(() => booksService.search(params), {
      onResult: (data) => {
        items.value = data.books?.data ?? data.books ?? []
      },
      onPollDone: async () => {
        // Depois do scrape terminar, repete a pesquisa original.
        const response = await booksService.search(params)
        items.value = response.data.books?.data ?? response.data.books ?? []
      },
    })
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
    error.value = null
  }

  return {
    items,
    loading,
    error,

    searchLoading: searchFetch.loading,
    searchScraping: searchFetch.scraping,
    searchError: searchFetch.error,
    searchPollingStatus: searchFetch.pollingStatus,
    searchRunId: searchFetch.runId,

    currentBook,
    currentBookSchools,
    detailLoading,
    detailError,

    searchByTitle,
    searchBySchool,
    fetchBookById,
    reset,
  }
})
