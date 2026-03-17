import type { gsap as GSAPType } from 'gsap'

export const burger = (gsap: typeof GSAPType) => {
  return (lines: HTMLElement[]) => {
    const tl: gsap.core.Timeline = gsap.timeline({ paused: true })
    const init = () => {
      const [lineTop, lineMiddle, lineBottom] = lines
      tl.to(lineTop!, { top: '50%', y: '-50%', rotate: 45, duration: 0.2 }, 0)
        .to(lineMiddle!, { opacity: 0, duration: 0.2 }, 0)
        .to(
          lineBottom!,
          { bottom: '50%', y: '50%', rotate: -45, duration: 0.2 },
          0,
        )
    }
    return {
      init,
      play: () => tl.play(),
      reverse: () => tl.reverse(),
      kill: () => tl.kill(),
    }
  }
}
