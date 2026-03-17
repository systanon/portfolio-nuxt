import type { gsap as GSAPType } from 'gsap'

export const textSoftReveal = (gsap: typeof GSAPType) => {
  return (text: HTMLElement) => {
    gsap.fromTo(
      text,
      { opacity: 0, filter: 'blur(10px)', scale: 0.9 },
      {
        opacity: 1,
        filter: 'blur(0px)',
        scale: 1,
        duration: 3,
        ease: 'power4.out',
      },
    )
  }
}
