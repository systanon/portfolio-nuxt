import EventEmitter from 'eventemitter3'
import type { Reactive } from 'vue'
import { SyncEvent, type ISyncModule } from '~/types/sync'
import type { RpcRequest, RpcResponse } from './sync.worker'

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
  private testConnectTimestamp = 0
  private lostConnection = false
  private ee: EventEmitter = new EventEmitter()
  private callCount = 0
  private syncWorker: SharedWorker
  private config: SyncModuleConfig
  private handlers: Record<string, Function> = {}
  private procedures: Map<string, Function> = new Map()
  private callStack: Map<string, { resolve: Function; reject: Function }> =
    new Map()
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
        console.warn('Disconnected from SyncWorker:', reason)
      },
    }

    const port = this.syncWorker.port
    port.addEventListener('message', this.handlePortMessage)
    port.start()
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

  public register(procedureName: string, fn: Function) {
    this.procedures.set(procedureName, fn)
    return () => this.unregister(procedureName, fn)
  }

  public unregister(procedureName: string, fn: Function) {
    const procedure = this.procedures.get(procedureName)
    procedure === fn && this.procedures.delete(procedureName)
  }

  call(procedureName: string, ...params: any[]): Promise<any> {
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

    setTimeout(
      () => result.reject(`request with id: ${requestID} was too long`),
      2000,
    )

    return promise
  }

  private handleSync({ clientID }: { clientID: number }) {
    this.state.clientID = clientID
    console.log('connect to syncWorker', clientID)
  }

  private handlePing(data: { id: number; timestamp: number }) {
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
    console.log('Master status updated:', master)
  }

  private async handleRPCRequest(request: RpcRequest) {
    const { clientID, requestID, procedureName, params } = request
    const res = this.procedures.get(procedureName)?.(params)
    let state = 'resolve'
    let result = null
    if (isPromise(res)) {
      await res
        .then((data) => (result = data))
        .catch((error) => ((result = error), (state = 'reject')))
      console.log('RPC request received:', result)
    } else {
      result = res
      console.log('RPC request received:', request)
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
      console.log('the response is intended for another client', response)
      return
    }
    const { requestID, state, result } = response
    const promise = this.callStack.get(requestID)
    if (!promise) {
      console.error('there is no such request in call stack', response)
      return
    }

    this.callStack.delete(requestID)
    promise[state](result)
  }

  private readonly handlePortMessage = (ev: MessageEvent) => {
    const root = ev.data as {
      event: string
      data?: {
        type?: SyncEvent
        data?: unknown
        event?: string
        params?: unknown[]
      }
      params?: unknown[]
    }
    if (root.event === SyncEvent.SYNC && root.data) {
      if (root.data.type !== undefined) {
        this.sync(root.data as { type: SyncEvent; data: any })
      } else if (root.data.event != null && root.data.params != null) {
        this.ee.emit(root.data.event, ...root.data.params)
      }
    } else if (root.event !== SyncEvent.SYNC) {
      this.ee.emit(root.event, ...(root.params ?? []))
    }
  }

  private sync({ type, data }: { type: SyncEvent; data: any }) {
    this.handlers[type]?.(data)
  }
}
