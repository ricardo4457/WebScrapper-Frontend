import api from '@/api/axios.js'

export const scraperService = {

  startScrape(payload) {
    return api.post('/book-scraper/run', payload)
  },


  startDistrictScrape(payload) {
    return api.post('/book-scraper/run/district', payload)
  },


  startCityScrape(payload) {
    return api.post('/book-scraper/run/city', payload)
  },


  getStatus(runId) {
    return api.get(`/book-scraper/status/${runId}`)
  },
}
