import type { gsap as GSAPType } from 'gsap'

export const navBar = (gsap: typeof GSAPType) => {
  return (navBar: HTMLElement, menuItems: HTMLCollection) => {
    const tl: gsap.core.Timeline = gsap.timeline({ paused: true })
    const init = () => {
      tl.fromTo(
        navBar,
        { x: '-100%' },
        { x: '0%', duration: 0.35, ease: 'power3.out' },
        0,
      ).from(
        menuItems,
        {
          y: 20,
          opacity: 0,
          stagger: 0.06,
          duration: 0.25,
          ease: 'power2.out',
        },
        0.15,
      )
    }
    return {
      init,
      play: () => tl.play(),
      reverse: () => tl.reverse(),
      kill: () => tl.kill(),
      playReverse: () =>
        new Promise<void>((resolve) => {
          tl.eventCallback('onReverseComplete', () => resolve())
          tl.reverse()
        }),
    }
  }
}
