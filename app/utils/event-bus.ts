import EventEmitter from 'eventemitter3'
import type { Profile } from '~/types/user.types'
export interface AppEvents {
  'auth:login': [profile: Profile]
  'auth:logout': []
  'app:error': [message: string]
  'app:success': [message: string]
  'data:loading': [isLoading: boolean]
}

export class EventBus<
  EventTypes extends EventEmitter.ValidEventTypes = string | symbol,
  EventContext = unknown,
> {
  private ee: EventEmitter = new EventEmitter()

  public on<T extends EventEmitter.EventNames<EventTypes>>(
    event: T,
    fn: EventEmitter.EventListener<EventTypes, T>,
    context?: EventContext,
  ): EventEmitter {
    return this.ee.on(event, fn, context)
  }

  public off<T extends EventEmitter.EventNames<EventTypes>>(
    event: T,
    fn?: EventEmitter.EventListener<EventTypes, T>,
    context?: EventContext,
    once?: boolean,
  ): EventEmitter {
    return this.ee.off(event, fn, context, once)
  }

  public emit<T extends EventEmitter.EventNames<EventTypes>>(
    event: T,
    ...args: EventEmitter.EventArgs<EventTypes, T>
  ): boolean {
    return this.ee.emit(event, ...args)
  }
}

export const eventBus = new EventBus<AppEvents>()
