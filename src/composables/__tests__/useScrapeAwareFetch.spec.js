import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useScrapeAwareFetch } from '@/composables/useScrapeAwareFetch.js'
import { scraperService } from '@/services/scraper.service.js'

vi.mock('@/services/scraper.service.js', () => ({
  scraperService: {
    getStatus: vi.fn(),
  },
}))

describe('useScrapeAwareFetch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts in a clean, non-loading state', () => {
    const { loading, scraping, error, runId, retryAfter } = useScrapeAwareFetch()

    expect(loading.value).toBe(false)
    expect(scraping.value).toBe(false)
    expect(error.value).toBe(null)
    expect(runId.value).toBe(null)
    expect(retryAfter.value).toBe(null)
  })

  it('on a plain 200 response, calls onResult and never starts polling', async () => {
    const { run, loading, scraping } = useScrapeAwareFetch()
    const requestFn = vi.fn().mockResolvedValue({ status: 200, data: { books: [] } })
    const onResult = vi.fn()
    const onPollDone = vi.fn()

    const resultPromise = run(requestFn, { onResult, onPollDone })
    expect(loading.value).toBe(true)

    const data = await resultPromise

    expect(onResult).toHaveBeenCalledWith({ books: [] })
    expect(onPollDone).not.toHaveBeenCalled()
    expect(data).toEqual({ books: [] })
    expect(loading.value).toBe(false)
    expect(scraping.value).toBe(false)
    expect(scraperService.getStatus).not.toHaveBeenCalled()
  })

  it('on a 202 response, flags scraping and starts polling until a terminal status', async () => {
    scraperService.getStatus
      .mockResolvedValueOnce({ data: { status: 'running' } })
      .mockResolvedValueOnce({ data: { status: 'completed' } })

    const { run, loading, scraping, runId, jobsTotal } = useScrapeAwareFetch({
      pollIntervalMs: 1000,
    })
    const requestFn = vi
      .fn()
      .mockResolvedValue({ status: 202, data: { run_id: 'run-42', jobs_total: 5 } })
    const onPollDone = vi.fn()
    const onPollUpdate = vi.fn()

    // Keep the promise pending while advancing the fake timers.
    const resultPromise = run(requestFn, { onPollUpdate, onPollDone })

    await vi.advanceTimersByTimeAsync(0)

    expect(runId.value).toBe('run-42')
    expect(jobsTotal.value).toBe(5)
    expect(scraping.value).toBe(true)
    expect(loading.value).toBe(true)
    expect(onPollUpdate).toHaveBeenCalledWith({ status: 'running' })
    expect(onPollDone).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(1000)
    const data = await resultPromise

    expect(data).toEqual({ run_id: 'run-42', jobs_total: 5 })
    expect(onPollUpdate).toHaveBeenLastCalledWith({ status: 'completed' })
    expect(scraping.value).toBe(false)
    expect(onPollDone).toHaveBeenCalledWith({ status: 'completed' })
    expect(loading.value).toBe(false)
  })

  it('maps a 429 response with Retry-After into a friendly, specific error', async () => {
    const { run, error, retryAfter } = useScrapeAwareFetch()
    const requestFn = vi.fn().mockRejectedValue({
      response: { status: 429, headers: { 'retry-after': '30' } },
    })

    await expect(run(requestFn)).rejects.toBeTruthy()

    expect(retryAfter.value).toBe(30)
    expect(error.value).toBe('Demasiados pedidos. Tenta novamente daqui a 30 segundos.')
  })

  it('handles a 429 response without a usable Retry-After header', async () => {
    const { run, error, retryAfter } = useScrapeAwareFetch()
    const requestFn = vi.fn().mockRejectedValue({
      response: { status: 429, headers: {} },
    })

    await expect(run(requestFn)).rejects.toBeTruthy()

    expect(retryAfter.value).toBe(null)
    expect(error.value).toBe('Demasiados pedidos. Tenta novamente dentro de momentos.')
  })

  it('surfaces the backend error message for other failures, or a generic fallback', async () => {
    const { run, error } = useScrapeAwareFetch()
    const requestFn = vi.fn().mockRejectedValue({
      response: { status: 500, data: { message: 'Erro interno do servidor.' } },
    })

    await expect(run(requestFn)).rejects.toBeTruthy()
    expect(error.value).toBe('Erro interno do servidor.')

    const requestFn2 = vi.fn().mockRejectedValue(new Error('network down'))
    await expect(run(requestFn2)).rejects.toBeTruthy()
    expect(error.value).toBe('Ocorreu um erro.')
  })

  it('resets loading/scraping/error/retryAfter at the start of every run()', async () => {
    const { run, error, retryAfter } = useScrapeAwareFetch()

    await expect(
      run(
        vi.fn().mockRejectedValue({ response: { status: 429, headers: { 'retry-after': '5' } } }),
      ),
    ).rejects.toBeTruthy()
    expect(error.value).toBe('Demasiados pedidos. Tenta novamente daqui a 5 segundos.')
    expect(retryAfter.value).toBe(5)

    await run(vi.fn().mockResolvedValue({ status: 200, data: {} }))

    expect(error.value).toBe(null)
    expect(retryAfter.value).toBe(null)
  })
})
