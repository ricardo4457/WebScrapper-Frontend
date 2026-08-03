import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-App-Key': import.meta.env.VITE_APP_KEY,
  },
  timeout: 15000,
})

// Interceptor de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Não autenticado')
    }

    if (error.response?.status === 403) {
      console.error('Acesso proibido')
    }

    return Promise.reject(error)
  }
)

export default api
