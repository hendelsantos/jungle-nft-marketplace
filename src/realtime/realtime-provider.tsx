import { useEffect, useRef, type PropsWithChildren } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { Nft, Order, RealtimeEnvelope } from '@/api/contracts'
import { queryKeys } from '@/api/query-keys'
import { useAuth } from '@/features/auth/auth-context'
import { createEventGate } from '@/realtime/event-gate'

export function RealtimeProvider({ children }: PropsWithChildren) {
  const { session } = useAuth()
  const client = useQueryClient()
  const gate = useRef(createEventGate())

  useEffect(() => {
    let disposed = false
    let disconnect: (() => void) | undefined
    const eventGate = gate.current
    const accept = (event: RealtimeEnvelope<unknown>) => eventGate.accept(event)

    void import('socket.io-client').then(({ io }) => {
      if (disposed) return
      const endpoint = new URL(import.meta.env.VITE_REALTIME_URL ?? 'ws://jungle.mock/realtime/')
      const socket = io(endpoint.origin, { path: endpoint.pathname, transports: ['websocket'], reconnection: true })
      disconnect = () => socket.disconnect()
      socket.on('connect', () => {
        document.documentElement.dataset.realtime = 'connected'
        if (session) socket.emit('session.join', session.id)
        void client.invalidateQueries({ queryKey: queryKeys.nfts.all })
        if (session) {
          void client.invalidateQueries({ queryKey: ['users', session.user.id] })
          void client.invalidateQueries({ queryKey: queryKeys.cart(session.user.id) })
        }
      })
      socket.on('disconnect', () => { document.documentElement.dataset.realtime = 'disconnected' })
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
      eventGate.reset()
      delete document.documentElement.dataset.realtime
    }
  }, [client, session])

  return children
}
