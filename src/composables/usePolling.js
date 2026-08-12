import { ref } from 'vue'
import { scraperService } from '@/services/scraper.service.js'

// ScrapeRun statuses that are still in progress.
const ACTIVE_STATUSES = ['pending', 'running']

/**
 * Generic polling for GET /book-scraper/status/{runId}.
 *
 * Polls a scrape run until it reaches a terminal state
 * (anything other than pending/running) or times out.
 */
export function usePolling({ intervalMs = 2000, timeoutMs = 120_000 } = {}) {
  const status = ref(null)
  const isPolling = ref(false)
  const error = ref(null)
  const timedOut = ref(false)

  let timerId = null
  let deadline = null

  function stop() {
    isPolling.value = false
    if (timerId) {
      clearTimeout(timerId)
      timerId = null
    }
  }

  async function tick(runId, onUpdate) {
    if (!isPolling.value) return

    if (Date.now() > deadline) {
      timedOut.value = true
      // Treat a timeout as a terminal update too, otherwise the caller
      // (useScrapeAwareFetch) never hears about it: scraping/loading flags
      // stay stuck forever, and the final re-fetch after the scrape
      // finishes never runs, even if the backend completed successfully.
      onUpdate?.({ status: 'timeout' })
      stop()
      return
    }

    try {
      const response = await scraperService.getStatus(runId)
      status.value = response.data
      onUpdate?.(response.data)

      if (!ACTIVE_STATUSES.includes(response.data.status)) {
        stop()
        return
      }
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Não foi possível consultar o estado do scrape.'
      stop()
      return
    }

    timerId = setTimeout(() => tick(runId, onUpdate), intervalMs)
  }

  function start(runId, onUpdate) {
    stop()
    status.value = null
    error.value = null
    timedOut.value = false
    isPolling.value = true
    deadline = Date.now() + timeoutMs
    tick(runId, onUpdate)
  }

  return { status, isPolling, error, timedOut, start, stop }
}
