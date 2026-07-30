import type EventEmitter from 'eventemitter3'

export enum SyncEvent {
  SYNC = 'sync',
  CONNECT = 'connect',
  MASTER = 'master',
  PING = 'ping',
  PONG = 'pong',
  RPC_REQUEST = 'rpc-request',
  RPC_RESPONSE = 'rpc-response',
  DISCONNECT = 'disconnect',
}

export interface ISyncModule {
  on(
    event: string | symbol,
    // matches eventemitter3's own EventListener typing, which SyncModule's
    // generic `on` implements — a stricter type here breaks `implements ISyncModule`
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fn: (...args: any[]) => void,
    context?: unknown,
  ): EventEmitter
  off(
    event: string | symbol,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fn?: (...args: any[]) => void,
    context?: unknown,
    once?: boolean,
  ): EventEmitter
  emit(event: string, ...params: unknown[]): void
}
