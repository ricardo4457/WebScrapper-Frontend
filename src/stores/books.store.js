import { defineStore } from 'pinia'
import { ref } from 'vue'
import { booksService } from '@/services/books.service.js'

export const useBooksStore = defineStore('books', () => {
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)

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

  function reset() {
    items.value = []
    error.value = null
  }

  return {
    items,
    loading,
    error,
    searchByTitle,
    reset,
  }
})
