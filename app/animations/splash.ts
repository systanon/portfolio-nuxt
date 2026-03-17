import type { gsap as GSAPType } from 'gsap'
export function splash(gsap: typeof GSAPType) {
  return () => {
    let hideTl: gsap.core.Timeline | null = null

    const hideSplash = (
      container: HTMLElement | null,
      cb?: any,
    ): Promise<void> => {
      if (!container) return Promise.resolve()
      return new Promise((resolve) => {
        if (hideTl) hideTl.kill()

        hideTl = gsap.timeline({
          onComplete: () => {
            cb?.()
            resolve()
          },
        })

        hideTl.to(container, {
          opacity: 0,
          scale: 1.015,
          duration: 1.0,
          ease: 'power3.inOut',
        })
      })
    }

    const kill = (): void => {
      hideTl?.kill()
    }

    return {
      hideSplash,
      kill,
    }
  }
}
