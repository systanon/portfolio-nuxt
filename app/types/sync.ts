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
  on(event: any, fn: any, context?: any): any
  off(event: any, fn: any, context?: any, once?: boolean): any
  emit(event: string, ...params: any[]): void
}
