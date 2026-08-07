import api from '@/api/axios.js'

export const schoolsService = {
  list(params) {
    return api.get('/schools', { params })
  },

  getCourses(schoolId, params) {
    return api.get(`/schools/${schoolId}/courses`, { params })
  },

  getDisciplines(schoolId, params) {
    return api.get(`/schools/${schoolId}/disciplines`, { params })
  },
}
