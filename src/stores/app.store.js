import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const initialized = ref(false)

  function markInitialized() {
    initialized.value = true
  }

  // Global snackbar, for cross-cutting feedback that isn't tied to a single feature store.
  const snackbar = ref({
    show: false,
    message: '',
    color: 'error',
  })

  function showSnackbar(message, color = 'error') {
    snackbar.value = { show: true, message, color }
  }

  function hideSnackbar() {
    snackbar.value.show = false
  }

  return {
    initialized,
    markInitialized,
    snackbar,
    showSnackbar,
    hideSnackbar,
  }
})
