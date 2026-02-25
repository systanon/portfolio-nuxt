import { ref, nextTick } from 'vue'
import type { IProgressBar } from '@/components/animation/ProgressBar.vue'

export function useRateLimit() {
  const isBlocked = ref<boolean>(false)
  const showProgressBar = ref<boolean>(false)
  const time = ref('0:00')
  const progressBarRef = ref<IProgressBar | null>(null)

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }
  const startRateLimit = async (retryAfter: number) => {
    isBlocked.value = true
    showProgressBar.value = true

    await nextTick()

    progressBarRef.value?.play(
      retryAfter,
      () => {
        isBlocked.value = false
        showProgressBar.value = false
        time.value = '0:00'
      },
      (tween) => {
        const remaining = tween.duration() - tween.time()
        time.value = formatTime(remaining)
      },
    )
  }

  return {
    isBlocked,
    showProgressBar,
    time,
    progressBarRef,
    startRateLimit,
  }
}
