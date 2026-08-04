import { defineStore } from 'pinia'
import { ref } from 'vue'
import { booksService } from '@/services/books.service.js'

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
    currentBook,
    currentBookSchools,
    detailLoading,
    detailError,
    searchByTitle,
    fetchBookById,
    reset,
  }
})
