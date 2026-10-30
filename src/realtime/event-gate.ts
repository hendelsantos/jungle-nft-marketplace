import type { RealtimeEnvelope } from '@/api/contracts'

const MAX_SEEN = 300

/**
 * Porta de eventos realtime: descarta duplicados por `eventId`, descarta
 * versões antigas por recurso e mantém um registro limitado de eventos vistos.
 */
export function createEventGate(maxSeen = MAX_SEEN) {
  const seen = new Set<string>()
  const versions = new Map<string, number>()

  const accept = (event: RealtimeEnvelope<unknown>): boolean => {
    if (seen.has(event.eventId)) return false
    const known = versions.get(event.resourceId) ?? 0
    if (event.version <= known) return false
    seen.add(event.eventId)
    versions.set(event.resourceId, event.version)
    if (seen.size > maxSeen) seen.delete(seen.values().next().value ?? '')
    return true
  }

  return { accept, reset: () => { seen.clear(); versions.clear() } }
}
