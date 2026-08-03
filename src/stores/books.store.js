import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useBooksStore = defineStore('books', () => {
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)

  function setItems(newItems) {
    items.value = newItems
  }

  function reset() {
    items.value = []
    error.value = null
  }

  return {
    items,
    loading,
    error,
    setItems,
    reset,
  }
})
