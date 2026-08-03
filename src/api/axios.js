import axios from 'axios'


const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-App-Key': import.meta.env.VITE_APP_KEY,
  },
})

export default api
