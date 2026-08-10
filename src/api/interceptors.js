import api from './axios.js'
import { useAppStore } from '@/stores/app.store.js'

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status

    if (status === 401) {
      console.warn('Não autorizado  verifica se VITE_APP_KEY está definida e correta.')
      useAppStore().showSnackbar(
        'Não foi possível autenticar o pedido. Tenta recarregar a página.',
        'error',
      )
    }

    if (status === 403) {
      console.warn('Acesso negado  origem (Origin/Referer) não está na allow-list do Laravel.')
      useAppStore().showSnackbar('Acesso negado a este pedido.', 'error')
    }

    return Promise.reject(error)
  },
)

export default api
