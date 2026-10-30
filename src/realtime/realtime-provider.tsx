import { useEffect, useRef, type PropsWithChildren } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { Nft, Order, RealtimeEnvelope } from '@/api/contracts'
import { queryKeys } from '@/api/query-keys'
import { useAuth } from '@/features/auth/auth-provider'

const MAX_SEEN = 300

export function RealtimeProvider({ children }: PropsWithChildren) {
  const { session } = useAuth()
  const client = useQueryClient()
  const seen = useRef(new Set<string>())
  const versions = useRef(new Map<string, number>())

  useEffect(() => {
    let disposed = false
    let disconnect: (() => void) | undefined
    const accept = (event: RealtimeEnvelope<unknown>) => {
      if (seen.current.has(event.eventId)) return false
      const known = versions.current.get(event.resourceId) ?? 0
      if (event.version <= known) return false
      seen.current.add(event.eventId)
      versions.current.set(event.resourceId, event.version)
      if (seen.current.size > MAX_SEEN) seen.current.delete(seen.current.values().next().value ?? '')
      return true
    }

    void import('socket.io-client').then(({ io }) => {
      if (disposed) return
      const endpoint = new URL(import.meta.env.VITE_REALTIME_URL ?? 'ws://jungle.mock/realtime/')
      const socket = io(endpoint.origin, { path: endpoint.pathname, transports: ['websocket'], reconnection: true })
      disconnect = () => socket.disconnect()
      socket.on('connect', () => {
        if (session) socket.emit('session.join', session.id)
        void client.invalidateQueries({ queryKey: queryKeys.nfts.all })
        if (session) {
          void client.invalidateQueries({ queryKey: ['users', session.user.id] })
          void client.invalidateQueries({ queryKey: queryKeys.cart(session.user.id) })
        }
      })
      socket.on('nft.updated', (event: RealtimeEnvelope<Nft>) => {
        if (!accept(event)) return
        void client.invalidateQueries({ queryKey: queryKeys.nfts.all })
        void client.invalidateQueries({ queryKey: ['identity'] })
        if (session) void client.invalidateQueries({ queryKey: queryKeys.quote(session.user.id) })
      })
      socket.on('order.updated', (event: RealtimeEnvelope<Order>) => {
        if (!session || event.userId !== session.user.id || !accept(event)) return
        const key = queryKeys.order(session.user.id, event.resourceId)
        client.setQueryData<Order>(key, (current) => !current || event.version > current.statusVersion ? event.data : current)
        if (event.data.status === 'confirmed') void client.invalidateQueries({ queryKey: queryKeys.cart(session.user.id) })
      })
    })
    return () => {
      disposed = true
      disconnect?.()
      seen.current.clear()
      versions.current.clear()
    }
  }, [client, session])

  return children
}
