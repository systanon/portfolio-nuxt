import type { gsap as GSAPType } from 'gsap'

export interface PlanetConfig {
  orbitEl: HTMLElement | null
  duration: number
  ease?: string
  rotationStart?: number
  repeat?: number
  direction?: 1 | -1
}

export const solarSystem = (gsap: typeof GSAPType) => {
  return (planets: PlanetConfig[]) => {
    const animations = planets
      .map((p) => {
        if (!p.orbitEl) return null

        return gsap.to(p.orbitEl, {
          rotation: (p.direction ?? 1) * 360,
          duration: p.duration,
          repeat: p.repeat ?? -1,
          ease: p.ease ?? 'none',
          startAt: { rotation: p.rotationStart ?? 0 },
        })
      })
      .filter(Boolean) as ReturnType<typeof gsap.to>[]

    return animations
  }
}
