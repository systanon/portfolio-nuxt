import type { gsap as GSAPType } from 'gsap'

export const progressAnimation = (gsap: typeof GSAPType) => {
  return (progressBar: HTMLDivElement, progress: boolean) => {
    let tween: gsap.core.Tween | null = null

    const play = (
      durationInSeconds: number,
      onComplete?: () => void,
      update?: (tween: gsap.core.Tween) => void,
    ) => {
      const width = progress ? '100%' : '0'
      tween?.kill()
      tween = gsap.to(progressBar, {
        width,
        duration: durationInSeconds,
        ease: 'linear',
        onUpdate() {
          if (tween) update?.(tween)
        },
        onComplete,
      })
    }

    const pause = () => {
      tween?.pause()
    }

    const resume = () => {
      tween?.resume()
    }

    const seek = (progress: number) => {
      tween?.progress(progress)
    }
    const reset = () => {
      tween?.kill()
      tween = null
      gsap.set(progressBar, { width: '0%' })
    }

    const getTween = () => tween

    return {
      play,
      pause,
      resume,
      seek,
      reset,
      getTween,
    }
  }
}
