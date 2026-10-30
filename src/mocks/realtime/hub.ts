import type { RealtimeEnvelope } from '@/api/contracts'

type SocketEmitter = { client: { emit: (event: string, payload: unknown) => void } }
interface ConnectedClient { socket: SocketEmitter; sessionId?: string }
const clients = new Set<ConnectedClient>()

export function addRealtimeClient(client: SocketEmitter) {
  const connected: ConnectedClient = { socket: client }
  clients.add(connected)
  return {
    joinSession: (sessionId: string) => { connected.sessionId = sessionId },
    remove: () => clients.delete(connected),
  }
}

export function emitRealtime<T>(event: 'nft.updated' | 'order.updated', payload: RealtimeEnvelope<T>) {
  for (const client of clients) {
    if (event === 'order.updated' && (!payload.sessionId || client.sessionId !== payload.sessionId)) continue
    client.socket.client.emit(event, payload)
  }
}
