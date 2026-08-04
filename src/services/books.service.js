import api from '@/api/axios.js'

export const booksService = {

  search(params) {
    return api.get('/books/search', { params })
  },

  getById(bookId) {
    return api.get(`/books/${bookId}`)
  },

  getPriceHistory(bookId) {
    return api.get(`/books/${bookId}/price-history`)
  },
}
