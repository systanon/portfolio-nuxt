class AnimationController {
  private activeAnimations = new Set()

  start(animation: Promise<void>) {
    this.activeAnimations.add(animation)

    animation.finally(() => {
      this.activeAnimations.delete(animation)
    })

    return animation
  }

  isBusy() {
    return this.activeAnimations.size > 0
  }

  waitAll(): Promise<unknown[]> {
    return Promise.all(this.activeAnimations)
  }
}

export const animationController = new AnimationController()
