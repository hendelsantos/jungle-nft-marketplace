import { toSocketIo } from '@mswjs/socket.io-binding'
import { ws } from 'msw'
import { addRealtimeClient } from './hub'

const realtime = ws.link(import.meta.env.VITE_REALTIME_URL ?? 'ws://jungle.mock/realtime/')

export const realtimeHandler = realtime.addEventListener('connection', (connection) => {
  const socket = toSocketIo(connection)
  const subscription = addRealtimeClient(socket)
  connection.client.addEventListener('close', subscription.remove)
  socket.client.on('session.join', (_event, sessionId: string) => {
    subscription.joinSession(sessionId)
    socket.client.emit('session.ready', { sessionId })
  })
})
