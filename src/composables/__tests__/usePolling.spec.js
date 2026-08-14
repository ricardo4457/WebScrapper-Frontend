import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { usePolling } from '@/composables/usePolling.js'
import { scraperService } from '@/services/scraper.service.js'

vi.mock('@/services/scraper.service.js', () => ({
  scraperService: {
    getStatus: vi.fn(),
  },
}))

describe('usePolling', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts in a non-polling state', () => {
    const { isPolling, status, error, timedOut } = usePolling()

    expect(isPolling.value).toBe(false)
    expect(status.value).toBe(null)
    expect(error.value).toBe(null)
    expect(timedOut.value).toBe(false)
  })

  it('polls immediately on start and reports the terminal status', async () => {
    scraperService.getStatus.mockResolvedValue({ data: { status: 'completed' } })
    const { start, isPolling, status } = usePolling()
    const onUpdate = vi.fn()

    start('run-1', onUpdate)
    await vi.runOnlyPendingTimersAsync()

    expect(scraperService.getStatus).toHaveBeenCalledWith('run-1')
    expect(onUpdate).toHaveBeenCalledWith({ status: 'completed' })
    expect(status.value).toEqual({ status: 'completed' })
    expect(isPolling.value).toBe(false)
  })

  it('keeps polling while status is pending/running', async () => {
    scraperService.getStatus
      .mockResolvedValueOnce({ data: { status: 'pending' } })
      .mockResolvedValueOnce({ data: { status: 'running' } })
      .mockResolvedValueOnce({ data: { status: 'completed' } })

    const { start, isPolling } = usePolling({ intervalMs: 2000 })
    const onUpdate = vi.fn()

    start('run-1', onUpdate)
    await vi.advanceTimersByTimeAsync(0)
    expect(isPolling.value).toBe(true)
    expect(scraperService.getStatus).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(2000)
    expect(scraperService.getStatus).toHaveBeenCalledTimes(2)
    expect(isPolling.value).toBe(true)

    await vi.advanceTimersByTimeAsync(2000)
    expect(scraperService.getStatus).toHaveBeenCalledTimes(3)
    expect(isPolling.value).toBe(false)
    expect(onUpdate).toHaveBeenLastCalledWith({ status: 'completed' })
  })

  it('times out after timeoutMs and reports a terminal "timeout" update', async () => {
    scraperService.getStatus.mockResolvedValue({ data: { status: 'running' } })

    const { start, isPolling, timedOut } = usePolling({ intervalMs: 1000, timeoutMs: 3000 })
    const onUpdate = vi.fn()

    start('run-1', onUpdate)
    // t=0 tick, t=1000 tick, t=2000 tick, t=3000 tick (still == deadline, not yet
    // timed out), t=4000 tick (now Date.now() > deadline → times out).
    await vi.advanceTimersByTimeAsync(4001)

    expect(timedOut.value).toBe(true)
    expect(isPolling.value).toBe(false)
    expect(onUpdate).toHaveBeenLastCalledWith({ status: 'timeout' })
  })

  it('stops and records an error message when the request fails', async () => {
    scraperService.getStatus.mockRejectedValue({
      response: { data: { message: 'Falha no servidor.' } },
    })

    const { start, isPolling, error } = usePolling()
    const onUpdate = vi.fn()

    start('run-1', onUpdate)
    await vi.runOnlyPendingTimersAsync()

    expect(error.value).toBe('Falha no servidor.')
    expect(isPolling.value).toBe(false)
    expect(onUpdate).not.toHaveBeenCalled()
  })

  it('falls back to a default error message when the API gives none', async () => {
    scraperService.getStatus.mockRejectedValue(new Error('network down'))

    const { start, error } = usePolling()

    start('run-1', vi.fn())
    await vi.runOnlyPendingTimersAsync()

    expect(error.value).toBe('Não foi possível consultar o estado do scrape.')
  })

  it('stop() cancels a scheduled tick and flips isPolling to false', async () => {
    scraperService.getStatus.mockResolvedValue({ data: { status: 'pending' } })

    const { start, stop, isPolling } = usePolling({ intervalMs: 2000 })

    start('run-1', vi.fn())
    await vi.advanceTimersByTimeAsync(0)
    expect(isPolling.value).toBe(true)

    stop()
    expect(isPolling.value).toBe(false)

    // Advancing time further must not trigger another request.
    await vi.advanceTimersByTimeAsync(5000)
    expect(scraperService.getStatus).toHaveBeenCalledTimes(1)
  })

  it('start() resets state left over from a previous run', async () => {
    scraperService.getStatus.mockRejectedValueOnce({
      response: { data: { message: 'erro anterior' } },
    })
    const { start, error, status, timedOut } = usePolling()

    start('run-1', vi.fn())
    await vi.runOnlyPendingTimersAsync()
    expect(error.value).toBe('erro anterior')

    scraperService.getStatus.mockResolvedValue({ data: { status: 'running' } })
    start('run-2', vi.fn())

    expect(error.value).toBe(null)
    expect(status.value).toBe(null)
    expect(timedOut.value).toBe(false)
  })
})
