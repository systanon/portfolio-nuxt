import EventEmitter from 'eventemitter3'
import { Logger } from '~/lib/logger'

export class Application<
  EventTypes extends EventEmitter.ValidEventTypes = string | symbol,
  EventContext extends any = any,
> {
  private logger = new Logger('Application')
  public resolveProfileLoading: (() => void) | null = null
  public profileLoading: Promise<void> = Promise.resolve()

  public appLoading: Promise<void>
  private resolveApp!: () => void

  constructor() {
    this.appLoading = new Promise((resolve) => {
      this.resolveApp = resolve
    })
  }

  public startProfileLoading() {
    this.profileLoading = new Promise((resolve) => {
      this.resolveProfileLoading = resolve
    })
  }

  public finishProfileLoading() {
    this.resolveProfileLoading?.()
  }

  async init() {
    this.logger.log('Initializing')
    this.resolveApp()
    this.logger.log('Ready')
  }
}
