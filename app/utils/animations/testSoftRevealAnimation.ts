import type { gsap as GSAPType } from 'gsap'
import type { ComponentPublicInstance } from 'vue'

export const textSoftRevealAnimation = (gsap: typeof GSAPType) => {
  return (text: ComponentPublicInstance) => {
    gsap.from(text, {
      scale: 0.9,
      opacity: 0,
      filter: 'blur(10px)',
      duration: 3,
      ease: 'power4.out',
    })
  }
}
