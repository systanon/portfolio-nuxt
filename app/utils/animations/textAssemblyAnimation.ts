import type { gsap as GSAPType } from 'gsap'
import type { ComponentPublicInstance } from 'vue'

export const textAssemblyAnimation = (gsap: typeof GSAPType) => {
  return (charList: ComponentPublicInstance[]) => {
    gsap.fromTo(
      charList,
      {
        opacity: 0,
        x: () => gsap.utils.random(-300, 300),
        y: () => gsap.utils.random(-200, 200),
        rotation: () => gsap.utils.random(-180, 180),
        scale: () => gsap.utils.random(0.3, 1.8),
        filter: 'blur(12px)',
      },
      {
        opacity: 1,
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        filter: 'blur(0px)',
        duration: 1.6,
        ease: 'power4.out',
        stagger: {
          each: 0.03,
          from: 'random',
        },
      },
    )
  }
}
