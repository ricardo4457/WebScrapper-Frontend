import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useScraperStore = defineStore('scraper', () => {
  const currentRun = ref(null) // { runId, status, state }
  const loading = ref(false)
  const error = ref(null)

  function setRun(run) {
    currentRun.value = run
  }

  function clearRun() {
    currentRun.value = null
  }

  return {
    currentRun,
    loading,
    error,
    setRun,
    clearRun,
  }
})
