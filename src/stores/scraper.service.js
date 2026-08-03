import api from './api'

export default {
  /**
   * Estado de um scraping
   * GET /book-scraper/status/{runId}
   */
  async getStatus(runId) {
    const response = await api.get(`/book-scraper/status/${runId}`)
    return response.data
  },
}
