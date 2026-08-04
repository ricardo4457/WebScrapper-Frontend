import api from '@/api/axios.js'

export const locationsService = {

  getLocations(params = {}) {
    return api.get('/locations', { params })
  },
}
