import { ref, onMounted, onUnmounted, watch } from 'vue'
import type { IProgressBar } from '~/components/animation/ProgressBar.vue'

interface StoredRateLimit {
  blockedUntil: number
  total: number
}

const STORAGE_PREFIX = 'rate-limit:'
const TICK_MS = 250

export function useRateLimit(key: string) {
  const isBlocked = ref<boolean>(false)
  const showProgressBar = ref<boolean>(false)
  const time = ref('0:00')
  const progressBarRef = ref<IProgressBar | null>(null)

  const storageKey = `${STORAGE_PREFIX}${key}`
  let intervalId: ReturnType<typeof setInterval> | null = null
  let blockedUntil = 0
  let total = 0

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const stopTicking = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  const finish = () => {
    stopTicking()
    blockedUntil = 0
    total = 0
    isBlocked.value = false
    showProgressBar.value = false
    time.value = '0:00'
    progressBarRef.value?.reset()
    if (import.meta.client) localStorage.removeItem(storageKey)
  }

  const progressFor = (remainingSec: number) => 1 - remainingSec / total

  const bindProgressBar = () => {
    const bar = progressBarRef.value
    if (!bar) return
    const remainingSec = Math.max((blockedUntil - Date.now()) / 1000, 0)
    bar.play(total)
    bar.pause()
    bar.seek(progressFor(remainingSec))
  }

  watch(progressBarRef, (bar) => {
    if (bar && isBlocked.value) bindProgressBar()
  })

  const tick = () => {
    const remainingSec = (blockedUntil - Date.now()) / 1000
    if (remainingSec <= 0) {
      finish()
      return
    }
    time.value = formatTime(remainingSec)
    progressBarRef.value?.seek(progressFor(remainingSec))
  }

  const watchUntil = (until: number, totalSec: number) => {
    if (totalSec <= 0 || until <= Date.now()) {
      finish()
      return
    }

    blockedUntil = until
    total = totalSec
    isBlocked.value = true
    showProgressBar.value = true

    bindProgressBar()
    stopTicking()
    tick()
    intervalId = setInterval(tick, TICK_MS)
  }

  const startRateLimit = async (retryAfter: number) => {
    const until = Date.now() + retryAfter * 1000
    if (import.meta.client) {
      const payload: StoredRateLimit = {
        blockedUntil: until,
        total: retryAfter,
      }
      localStorage.setItem(storageKey, JSON.stringify(payload))
    }
    watchUntil(until, retryAfter)
  }

  onMounted(() => {
    if (!import.meta.client) return
    const raw = localStorage.getItem(storageKey)
    if (!raw) return

    try {
      const { blockedUntil: until, total: totalSec } = JSON.parse(
        raw,
      ) as StoredRateLimit
      if (until > Date.now()) {
        watchUntil(until, totalSec)
      } else {
        localStorage.removeItem(storageKey)
      }
    } catch {
      localStorage.removeItem(storageKey)
    }
  })

  onUnmounted(stopTicking)

  return {
    isBlocked,
    showProgressBar,
    time,
    progressBarRef,
    startRateLimit,
  }
}
