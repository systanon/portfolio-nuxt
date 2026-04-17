import EventEmitter from 'eventemitter3'
import type { Reactive } from 'vue'
import { SyncEvent, type ISyncModule } from '~/types/sync'
import type {
  RpcRequest,
  RpcResponse,
} from '~/application/modules/client/sync.worker'
import { Logger } from '~/lib/logger'

const isPromise = (value: unknown): value is Promise<unknown> =>
  value instanceof Promise

interface SyncModuleConfig {
  pingPongInterval: number
  offlineInterval: number
}

type SyncState = Reactive<{
  clientID: number | null
  master: boolean
}>

export class SyncModule<
  EventTypes extends EventEmitter.ValidEventTypes = string | symbol,
  EventContext extends any = any,
> implements ISyncModule {
  private state: SyncState = reactive({
    clientID: null,
    master: true,
  })
  private testConnectTimestamp = Date.now()
  private lostConnection = false
  private pingInterval: ReturnType<typeof setInterval> | null = null
  private ee: EventEmitter = new EventEmitter()
  private callCount = 0
  private syncWorker: SharedWorker
  private config: SyncModuleConfig
  private handlers: Record<string, (data: any) => void | Promise<void>> = {}
  private procedures: Map<string, (...args: any[]) => any> = new Map()
  private callStack: Map<string, { resolve: Function; reject: Function }> =
    new Map()
  private logger = new Logger('SyncModule')
  constructor(
    syncWorker: SharedWorker,
    config: SyncModuleConfig = {
      pingPongInterval: 5000,
      offlineInterval: 10000,
    },
  ) {
    this.syncWorker = syncWorker
    this.config = config

    this.handlers = {
      [SyncEvent.CONNECT]: this.handleSync.bind(this),
      [SyncEvent.PING]: this.handlePing.bind(this),
      [SyncEvent.MASTER]: this.handleMaster.bind(this),
      [SyncEvent.RPC_REQUEST]: this.handleRPCRequest.bind(this),
      [SyncEvent.RPC_RESPONSE]: this.handleRPCResponse.bind(this),
      [SyncEvent.DISCONNECT]: ({ reason }: { reason: string }) => {
        this.logger.warn('Disconnected from SyncWorker', reason)
      },
    }

    const port = this.syncWorker.port
    port.addEventListener('message', this.handlePortMessage)
    port.start()
    this.startPingWatcher()
    window.addEventListener('beforeunload', this.destroy.bind(this))
  }

  get id() {
    return this.state.clientID
  }

  get master() {
    return this.state.master
  }

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

  public emit(event: string, ...params: any[]) {
    if (event === SyncEvent.SYNC) return
    const message = { event, params }
    this.syncWorker.port.postMessage(structuredClone(message))
  }

  public register<T extends (...args: any[]) => any>(
    procedureName: string,
    fn: T,
  ) {
    this.procedures.set(procedureName, fn)
    return () => this.unregister(procedureName, fn)
  }

  public unregister(procedureName: string, fn: (...args: any[]) => any) {
    const procedure = this.procedures.get(procedureName)
    procedure === fn && this.procedures.delete(procedureName)
  }

  public call(procedureName: string, ...params: any[]): Promise<any> {
    if (this.state.master) return Promise.reject('this is master tab')

    const requestID = `${this.state.clientID}-${this.callCount++}`
    const result: { resolve: Function; reject: Function } = {
      resolve: () => {},
      reject: () => {},
    }
    const promise = new Promise((resolve, reject) => {
      result.resolve = resolve
      result.reject = reject
    })
    this.callStack.set(requestID, result)

    const data = {
      clientID: this.state.clientID,
      requestID,
      procedureName,
      params,
    }
    const message = {
      event: SyncEvent.SYNC,
      data: { type: SyncEvent.RPC_REQUEST, data },
    }
    this.syncWorker.port.postMessage(structuredClone(message))

    setTimeout(() => {
      this.logger.warn(`RPC timeout: ${requestID} (${procedureName})`)
      result.reject(`request with id: ${requestID} was too long`)
    }, 2000)

    return promise
  }

  private startPingWatcher() {
    this.pingInterval = setInterval(() => {
      const now = Date.now()

      if (this.testConnectTimestamp + this.config.offlineInterval > now) {
        if (this.lostConnection) {
          this.lostConnection = false
          this.logger.log('Connection restored')
        }
        return
      }

      if (this.lostConnection) return

      this.lostConnection = true
      this.state.master = true
      this.logger.warn('Lost connection to syncWorker, becoming master')
    }, this.config.pingPongInterval)
  }

  private destroy() {
    this.logger.log('Destroying')
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
    this.syncWorker.port.removeEventListener('message', this.handlePortMessage)
    this.syncWorker.port.close()
  }

  private handleSync({ clientID }: { clientID: number }) {
    this.state.clientID = clientID
    this.logger.log('Connect to syncWorker', clientID)
  }

  private handlePing(data: { id: number; timestamp: number }) {
    this.testConnectTimestamp = Date.now()
    const message = {
      event: SyncEvent.SYNC,
      data: {
        type: SyncEvent.PONG,
        data: { id: data.id, timestamp: data.timestamp },
      },
    }
    this.syncWorker.port.postMessage(structuredClone(message))
  }

  private handleMaster({ master }: { master: boolean }) {
    if (this.state.master === master) return
    this.state.master = master
    this.logger.log('Master status updated:', master)
  }

  private async handleRPCRequest(request: RpcRequest) {
    const { clientID, requestID, procedureName, params } = request
    const res = this.procedures.get(procedureName)?.(params)
    let state = 'resolve'
    let result = null
    if (isPromise(res)) {
      await res
        .then((data) => (result = data))
        .catch((error) => {
          this.logger.error(`RPC procedure "${procedureName}" failed`, error)
          result = error
          state = 'reject'
        })
    } else {
      result = res
    }

    const data = { clientID, requestID, state, result }
    const message = {
      event: SyncEvent.SYNC,
      data: { type: SyncEvent.RPC_RESPONSE, data },
    }
    this.syncWorker.port.postMessage(structuredClone(message))
  }

  private handleRPCResponse(response: RpcResponse) {
    if (response.clientID !== this.state.clientID) {
      this.logger.log('The response is intended for another client', response)
      return
    }
    const { requestID, state, result } = response
    const promise = this.callStack.get(requestID)
    if (!promise) {
      this.logger.error('There is no such request in call stack', response)
      return
    }
    this.logger.log('RPC response received:', response)
    this.callStack.delete(requestID)
    if (state === 'resolve') promise.resolve(result)
    else promise.reject(result)
  }

  private readonly handlePortMessage = (ev: MessageEvent) => {
    const { event, data, params } = ev.data
    if (event === SyncEvent.SYNC) {
      this.sync(data)
    } else {
      this.ee.emit(event, ...(params ?? []))
    }
  }

  private sync({ type, data }: { type: SyncEvent; data: any }) {
    this.handlers[type]?.(data)
  }
}
