import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAppStore } from '@/stores/app.store.js'

describe('app.store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts uninitialized with the snackbar hidden', () => {
    const store = useAppStore()

    expect(store.initialized).toBe(false)
    expect(store.snackbar).toEqual({ show: false, message: '', color: 'error' })
  })

  it('markInitialized() flips initialized to true', () => {
    const store = useAppStore()

    store.markInitialized()

    expect(store.initialized).toBe(true)
  })

  describe('showSnackbar()', () => {
    it('defaults to the "error" color when none is given', () => {
      const store = useAppStore()

      store.showSnackbar('Ocorreu um erro.')

      expect(store.snackbar).toEqual({
        show: true,
        message: 'Ocorreu um erro.',
        color: 'error',
      })
    })

    it('accepts a custom color', () => {
      const store = useAppStore()

      store.showSnackbar('Pesquisa concluída.', 'success')

      expect(store.snackbar).toEqual({
        show: true,
        message: 'Pesquisa concluída.',
        color: 'success',
      })
    })

    it('replaces a previous message rather than merging it', () => {
      const store = useAppStore()
      store.showSnackbar('Primeira mensagem.', 'success')

      store.showSnackbar('Segunda mensagem.')

      expect(store.snackbar).toEqual({
        show: true,
        message: 'Segunda mensagem.',
        color: 'error',
      })
    })
  })

  it('hideSnackbar() hides the snackbar without clearing message or color', () => {
    const store = useAppStore()
    store.showSnackbar('Pesquisa concluída.', 'success')

    store.hideSnackbar()

    expect(store.snackbar.show).toBe(false)
    expect(store.snackbar.message).toBe('Pesquisa concluída.')
    expect(store.snackbar.color).toBe('success')
  })
})
