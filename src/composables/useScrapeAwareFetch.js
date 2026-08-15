import { ref } from 'vue'
import { usePolling } from '@/composables/usePolling.js'

// ScrapeRun statuses that are still in progress.
const ACTIVE_STATUSES = ['pending', 'running']

/**
 * Generic wrapper for requests that may return:
 * - 200 with data
 * - 202 { status: 'scraping', run_id, jobs_total } when a scrape is started
 *
 * Starts polling automatically for 202 responses and stops when the
 * scrape reaches a terminal state.
 */

export function useScrapeAwareFetch({ pollIntervalMs, pollTimeoutMs } = {}) {
  const loading = ref(false)
  const scraping = ref(false)
  const error = ref(null)
  const runId = ref(null)
  const jobsTotal = ref(null)
  const retryAfter = ref(null)

  const polling = usePolling({
    ...(pollIntervalMs ? { intervalMs: pollIntervalMs } : {}),
    ...(pollTimeoutMs ? { timeoutMs: pollTimeoutMs } : {}),
  })

  async function run(requestFn, { onResult, onPollUpdate, onPollDone } = {}) {
    loading.value = true
    scraping.value = false
    error.value = null
    retryAfter.value = null

    try {
      const response = await requestFn()

      if (response.status === 202) {
        scraping.value = true
        runId.value = response.data.run_id
        jobsTotal.value = response.data.jobs_total

        // Wait for the scrape to reach a terminal state before resolving.
        // This ensures callers receive the final data after polling completes.
        const finalStatus = await new Promise((resolve) => {
          polling.start(response.data.run_id, (statusData) => {
            onPollUpdate?.(statusData)
            if (!ACTIVE_STATUSES.includes(statusData.status)) {
              scraping.value = false
              resolve(statusData)
            }
          })
        })

        await onPollDone?.(finalStatus)
        return response.data
      }

      onResult?.(response.data)
      return response.data
    } catch (err) {
      if (err.response?.status === 429) {
        // Laravel's throttle middleware returns the header Retry-After.
        const seconds = Number(err.response.headers?.['retry-after'])
        retryAfter.value = Number.isFinite(seconds) && seconds > 0 ? seconds : null

        error.value = retryAfter.value
          ? `Demasiados pedidos. Tenta novamente daqui a ${retryAfter.value} segundos.`
          : 'Demasiados pedidos. Tenta novamente dentro de momentos.'
      } else {
        error.value = err.response?.data?.message ?? 'Ocorreu um erro.'
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    scraping,
    error,
    runId,
    jobsTotal,
    retryAfter,
    pollingStatus: polling.status,
    pollingError: polling.error,
    pollingTimedOut: polling.timedOut,
    run,
    stopPolling: polling.stop,
  }
}
