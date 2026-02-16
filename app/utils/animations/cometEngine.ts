import type { gsap as GSAPType } from 'gsap'

const MAX_COMETS = 3
const DELAYED_CALL = 2

export type Comet = {
  id: number
  startX: number
  startY: number
  angle: number
  duration: number
}

type Listener = (comets: Comet[]) => void

export class CometsEngine {
  private gsap: typeof GSAPType
  private cometIndex: Map<
    number,
    {
      root: HTMLElement
      tail: HTMLElement
    }
  > = new Map()
  private spawnTween: gsap.core.Tween | null = null
  private timelines: Map<number, gsap.core.Timeline> = new Map()
  private comets: Comet[] = []
  private cometId: number = 0
  private listeners: Set<Listener> = new Set()
  private isRunning: boolean = false

  constructor(gsap: typeof GSAPType) {
    this.gsap = gsap
  }

  public subscribe(fn: Listener) {
    this.listeners.add(fn)
    return () => {
      this.listeners.delete(fn)
    }
  }

  private notify() {
    this.listeners.forEach((fn) => fn([...this.comets]))
  }

  public registerCometElement(
    id: number,
    root: HTMLElement,
    tail: HTMLElement,
  ) {
    this.cometIndex.set(id, { root, tail })
  }

  public start() {
    this.isRunning = true
    this.scheduleSpawn()
  }

  public stop() {
    this.isRunning = false
    this.spawnTween?.kill()

    this.timelines.forEach((tl) => tl.kill())
    this.timelines.clear()

    this.comets = []
    this.cometIndex.clear()

    this.notify()
  }

  private scheduleSpawn() {
    if (!this.isRunning) return
    this.spawnTween = this.gsap.delayedCall(DELAYED_CALL, () => {
      if (this.comets.length < MAX_COMETS) {
        this.spawnComet()
      }
      this.scheduleSpawn()
    })
  }

  private spawnComet() {
    const comet: Comet = {
      id: this.cometId++,
      startX: Math.random() * window.innerWidth * 0.8,
      startY: -50,
      angle: 30 + Math.random() * 30,
      duration: 2 + Math.random() * 2,
    }

    this.comets.push(comet)
    this.notify()

    requestAnimationFrame(() => {
      if (!this.isRunning) return
      this.animateComet(comet)
    })
  }

  private animateComet(comet: Comet) {
    const element = this.cometIndex.get(comet.id)
    if (!element) return

    const { root, tail } = element
    const { x, y } = this.calculateTarget(comet.startX, comet.startY, comet.angle)

    this.gsap.set(root, {
      x: comet.startX,
      y: comet.startY,
      rotation: comet.angle,
    })

    this.gsap.set(tail, {
      width: 0,
      opacity: 0.8,
      scaleX: 1,
      transformOrigin: 'right center',
      xPercent: -100,
    })

    const tl = this.gsap.timeline({
      onComplete: () => {
        this.comets = this.comets.filter((c) => c.id !== comet.id)
        this.cometIndex.delete(comet.id)
        this.timelines.delete(comet.id)
        this.notify()
      },
    })

    this.timelines.set(comet.id, tl)

    tl.to(root, { x, y, duration: comet.duration, ease: 'power1.in' }, 0)
    tl.to(
      tail,
      {
        width: 150 + Math.random() * 100,
        opacity: 0,
        duration: comet.duration,
        ease: 'power1.in',
      },
      0,
    )
  }

  private calculateTarget(
  startX: number,
  startY: number,
  angle: number,
  minDistance = 800,
  maxDistance = 1000,
) {
  const distance = minDistance + Math.random() * (maxDistance - minDistance)
  const rad = (angle * Math.PI) / 180
  const x = startX + Math.cos(rad) * distance
  const y = startY + Math.sin(rad) * distance

  return { x, y }
}

  public unregisterCometElement(id: number) {
    this.cometIndex.delete(id)
  }
}
