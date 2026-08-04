import api from '@/api/axios.js'

export const schoolsService = {

  list(params) {
    return api.get('/schools', { params })
  },


  getDisciplines() {
    return api.get('/disciplines')
  },
}
