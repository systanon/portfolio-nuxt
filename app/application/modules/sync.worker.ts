import { SyncEvent } from '~/types/sync'

const MAX_MISSED_PINGS = 3

interface Connection extends MessagePort {
  _id: number
  _pong: number
  _missedPings: number
}

export interface RpcRequest {
  clientID: number
  requestID: string
  procedureName: string
  params: unknown[]
}

export interface RpcResponse {
  clientID: number
  requestID: string
  state: 'resolve' | 'reject'
  result: unknown
}

type SyncMessage =
  | { type: SyncEvent.PONG; data: { id: number; timestamp: number } }
  | { type: SyncEvent.RPC_REQUEST; data: RpcRequest }
  | { type: SyncEvent.RPC_RESPONSE; data: RpcResponse }

const connections = new Map<number, Connection>()
let newID = 0
let masterID: number | null = null

const PING_PONG_INTERVAL = 1000
const PING_PONG_INTERVAL_LIMIT = PING_PONG_INTERVAL + 500

const buildMessage = <T>(type: SyncEvent, data: T) => ({
  event: SyncEvent.SYNC,
  data: { type, data },
})

const sendMasterStatus = (): void => {
  connections.forEach((connection) => {
    const message = buildMessage(SyncEvent.MASTER, {
      master: connection._id === masterID,
    })
    connection.postMessage(structuredClone(message))
  })
}

const ping = (timestamp: number): void => {
  connections.forEach((connection) => {
    const message = buildMessage(SyncEvent.PING, {
      id: connection._id,
      timestamp,
    })
    connection.postMessage(structuredClone(message))
  })
}

const testPong = (timestamp: number): void => {
  const allConnections = [...connections.values()]

  allConnections.forEach((c) => {
    if (c._pong + PING_PONG_INTERVAL_LIMIT < timestamp) {
      c._missedPings = (c._missedPings ?? 0) + 1
    } else {
      c._missedPings = 0
    }
  })

  const deadConnections = allConnections.filter(
    (c) => c._missedPings >= MAX_MISSED_PINGS,
  )
  const liveConnections = allConnections.filter(
    (c) => c._missedPings < MAX_MISSED_PINGS,
  )

  deadConnections.forEach((connection) => {
    try {
      connection.postMessage(
        structuredClone(
          buildMessage(SyncEvent.DISCONNECT, { reason: 'timeout' }),
        ),
      )
    } catch {
    } finally {
      connection.close()
      connections.delete(connection._id)
    }
  })

  if (liveConnections.some((c) => c._id === masterID)) return

  masterID =
    liveConnections.length > 0 ? (liveConnections[0]?._id ?? null) : null
}

const testConnect = (): void => {
  if (connections.size === 0) return
  const timestamp = Date.now()
  testPong(timestamp)
  ping(timestamp)
  sendMasterStatus()
}

setInterval(testConnect, PING_PONG_INTERVAL)

const handlers: Record<string, (data: any) => void | Promise<void>> = {
  [SyncEvent.PONG]: ({ id, timestamp }: { id: number; timestamp: number }) => {
    const connection = connections.get(id)
    if (!connection) return
    connection._pong = timestamp
  },

  [SyncEvent.RPC_REQUEST]: async (request: RpcRequest) => {
    const { clientID, requestID } = request

    if (masterID == null || !connections.has(masterID)) {
      const errorMessage = 'there is no connection with the master client'
      console.error(errorMessage, requestID, masterID)
      const connection = connections.get(clientID)
      if (!connection) return
      const message = buildMessage(SyncEvent.RPC_RESPONSE, {
        clientID,
        requestID,
        state: 'reject',
        result: errorMessage,
      })
      connection.postMessage(structuredClone(message))
      return
    }

    const connection = connections.get(masterID)!
    const message = buildMessage(SyncEvent.RPC_REQUEST, request)
    connection.postMessage(structuredClone(message))
  },

  [SyncEvent.RPC_RESPONSE]: (response: RpcResponse) => {
    const { clientID, requestID } = response

    if (!connections.has(clientID)) {
      console.error('there is no connection with the slave client', requestID)
      return
    }

    const connection = connections.get(clientID)!
    const message = buildMessage(SyncEvent.RPC_RESPONSE, response)
    connection.postMessage(structuredClone(message))
  },
}

const sync = ({ type, data }: SyncMessage): void => {
  handlers[type]?.(data)
}

const onMessage =
  (id: number) =>
  (message: MessageEvent): void => {
    const { event, data } = message.data
    if (event === SyncEvent.SYNC) sync(data)
    else {
      connections.forEach((connection) => {
        if (connection._id !== id) {
          connection.postMessage(structuredClone(message.data))
        }
      })
    }
  }

const onConnect = (event: MessageEvent): void => {
  const port = event.source as unknown as Connection
  port._missedPings = 0
  const now = Date.now()
  port._pong = now
  port._id = newID++
  connections.set(port._id, port)

  port.addEventListener('message', onMessage(port._id), false)
  port.start()

  if (
    masterID == null ||
    connections.get(masterID)!._pong + PING_PONG_INTERVAL_LIMIT < now
  ) {
    masterID = port._id
  }

  port.postMessage(
    structuredClone(buildMessage(SyncEvent.CONNECT, { clientID: port._id })),
  )
  port.postMessage(
    structuredClone(
      buildMessage(SyncEvent.MASTER, { master: port._id === masterID }),
    ),
  )
  sendMasterStatus()
}

self.addEventListener('connect', onConnect as EventListener, false)
self.addEventListener('error', (err) => console.error('SyncWorker', err), false)
