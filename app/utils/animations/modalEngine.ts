import type { gsap as GSAPType } from 'gsap'

export class ModalEngine {
  private gsap: typeof GSAPType
  private timelineIndex: Map<number, gsap.core.Timeline> = new Map()
  private modalIndex: Map<
    number,
    {
      backdrop: HTMLElement
      dialog: HTMLElement
    }
  > = new Map()

  constructor(gsap: typeof GSAPType) {
    this.gsap = gsap
  }

  public init(id: number, backdrop: HTMLElement, dialog: HTMLElement) {
    this.modalIndex.set(id, { backdrop, dialog })
  }

  public destroy(id: number) {
    this.modalIndex.delete(id)
    this.timelineIndex.delete(id)
  }

  public open(id: number) {
    const element = this.modalIndex.get(id)

    if (!element) return

    const timeline = this.gsap.timeline()
    const { backdrop, dialog } = element

    timeline
      .to(backdrop, {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
      })
      .fromTo(
        dialog,
        {
          opacity: 0,
          y: -20,
          scale: 0.95,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.35,
          ease: 'power3.out',
        },
        '-=0.1',
      )
    this.timelineIndex.set(id, timeline)
  }

  public async close(id: number, cb: () => void) {
    const timeline = this.timelineIndex.get(id)

    if (!timeline) {
      cb()
      return
    }

    await timeline.reverse().eventCallback('onReverseComplete', cb)
  }
}
