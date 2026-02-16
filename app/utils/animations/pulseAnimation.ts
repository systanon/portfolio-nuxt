import type { gsap as GSAPType } from 'gsap'
import type { ComponentPublicInstance } from 'vue'

export const pulseAnimation = (gsap: typeof GSAPType) => {
  return (items: ComponentPublicInstance[]) => {
    const pulseTimes = 3
    const delay = 2
    const tl = gsap.timeline({
      repeat: -1,
    })
    items.forEach((card: ComponentPublicInstance) => {
      const el = card.$el
      const pulseTimeline = gsap.timeline()
      pulseTimeline
        .to(el, {
          scale: 1.1,
        })
        .to(el, {
          boxShadow: '0px 0px 41px 11px rgba(62, 203, 252, 0.5)',
          duration: 0.3,
          ease: 'power1.inOut',
          repeat: pulseTimes * 2 - 1,
          yoyo: true,
        })
        .to(el, {
          scale: 1,
          ease: 'power1.inOut',
        })
      tl.add(pulseTimeline, `+=${delay}`)
    })
  }
}
