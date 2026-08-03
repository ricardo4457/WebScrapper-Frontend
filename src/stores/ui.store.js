import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const globalLoading = ref(false)
  const snackbar = ref({
    show: false,
    message: '',
    color: 'info', // 'success' | 'error' | 'warning' | 'info'
  })

  function showSnackbar(message, color = 'info') {
    snackbar.value = { show: true, message, color }
  }

  function hideSnackbar() {
    snackbar.value.show = false
  }

  return {
    globalLoading,
    snackbar,
    showSnackbar,
    hideSnackbar,
  }
})
