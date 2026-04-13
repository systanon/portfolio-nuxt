import EventEmitter from 'eventemitter3'
import type { ISyncModule } from '~/types/sync'

export class SyncModuleMock<
  EventTypes extends EventEmitter.ValidEventTypes = string | symbol,
  EventContext extends any = any,
> implements ISyncModule {
  public on() {
    return new EventEmitter()
  }
  public off() {
    return new EventEmitter()
  }
  public emit() {}
}
