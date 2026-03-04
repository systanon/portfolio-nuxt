type Star = {
  x: number
  y: number
  size: number
  speed: number
  alpha: number
  alphaSpeed: number
}

export class Universe {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private animationFrameId: number | null = null

  private t: number = 0
  private stars: Star[] = []

  private readonly ellipses = [
    { baseAngle: 0, speed: 0.42, opacity: 0.35 },
    { baseAngle: Math.PI * 0.666, speed: 0.58, opacity: 0.55 },
    { baseAngle: Math.PI * 1.333, speed: 0.5, opacity: 0.8 },
  ]

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.resize()
    window.addEventListener('resize', this.resize)
  }

  private resize = () => {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
    this.stars = this.createStars()
  }

  private createStars(): Star[] {
    return Array.from({ length: 280 }).map(() => ({
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      size: Math.random() * 1.6 + 0.3,
      speed: Math.random() * 0.06 + 0.015,
      alpha: Math.random() * 0.7 + 0.3,
      alphaSpeed:
        (Math.random() * 0.018 + 0.004) * (Math.random() > 0.5 ? 1 : -1),
    }))
  }

  private draw() {
    const { width, height } = this.canvas
    const cx = width / 2
    const cy = height / 2

    this.ctx.clearRect(0, 0, width, height)

    this.ctx.fillStyle = '#ffffff'
    for (const s of this.stars) {
      s.alpha += s.alphaSpeed
      if (s.alpha <= 0.2 || s.alpha >= 1) s.alphaSpeed *= -1

      s.y += s.speed
      if (s.y > height) s.y -= height + 50

      this.ctx.globalAlpha = s.alpha
      this.ctx.fillRect(s.x, s.y, s.size, s.size)
    }
    this.ctx.globalAlpha = 1

    const rx = 68
    const ry = 34

    for (const e of this.ellipses) {
      this.ctx.save()
      this.ctx.translate(cx, cy)
      this.ctx.rotate(e.baseAngle + this.t * e.speed)

      this.ctx.strokeStyle = '#3ECBFC'
      this.ctx.lineWidth = 2.4
      this.ctx.beginPath()
      this.ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2)
      this.ctx.stroke()

      this.ctx.restore()
    }

    const radius = 6 + Math.sin(this.t * 2.6) * 3

    this.ctx.fillStyle = '#FFC300'
    this.ctx.beginPath()
    this.ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    this.ctx.fill()

    this.t += 0.016
  }

  start() {
    const loop = () => {
      this.draw()
      this.animationFrameId = requestAnimationFrame(loop)
    }
    loop()
  }

  stop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }

  destroy() {
    this.stop()
    window.removeEventListener('resize', this.resize)
  }
}
