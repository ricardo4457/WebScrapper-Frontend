import api from './axios.js'

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status

    if (status === 401) {
      console.warn('Não autorizado — verifica se VITE_APP_KEY está definida e correta.')
    }

    if (status === 403) {
      console.warn('Acesso negado — origem (Origin/Referer) não está na allow-list do Laravel.')
    }

    return Promise.reject(error)
  },
)

export default api
