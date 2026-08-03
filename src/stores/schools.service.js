import api from './api'

export default {
  /**
   * Lista de escolas
   * GET /schools
   */
  async list(params = {}) {
    const response = await api.get('/schools', { params })
    return response.data
  },

  /**
   * Distritos e concelhos
   * GET /locations
   */
  async getLocations() {
    const response = await api.get('/locations')
    return response.data
  },

  /**
   * Disciplinas disponíveis
   * GET /disciplines
   */
  async getDisciplines() {
    const response = await api.get('/disciplines')
    return response.data
  },
}
