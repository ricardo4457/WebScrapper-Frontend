import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const initialized = ref(false)

  function markInitialized() {
    initialized.value = true
  }

  return {
    initialized,
    markInitialized,
  }
})
