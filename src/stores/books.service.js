import api from './api'

export default {
  /**
   * Pesquisa de livros
   * GET /books/search
   */
  async search(params = {}) {
    const response = await api.get('/books/search', { params })
    return response.data
  },

  /**
   * Detalhe do livro
   * GET /books/{id}
   */
  async getBook(id) {
    const response = await api.get(`/books/${id}`)
    return response.data
  },

  /**
   * Histórico de preços
   * GET /books/{id}/price-history
   */
  async getPriceHistory(id) {
    const response = await api.get(`/books/${id}/price-history`)
    return response.data
  },
}
