import { describe, expect, it } from 'vitest'
import { createEventGate } from '@/realtime/event-gate'
import type { RealtimeEnvelope } from '@/api/contracts'

const envelope = (eventId: string, resourceId: string, version: number): RealtimeEnvelope<unknown> => ({
  eventId,
  resourceId,
  version,
  occurredAt: new Date().toISOString(),
  data: {},
})

describe('realtime event gate', () => {
  it('accepts new events and rejects duplicates by eventId', () => {
    const gate = createEventGate()
    expect(gate.accept(envelope('e1', 'nft_1', 1))).toBe(true)
    expect(gate.accept(envelope('e1', 'nft_1', 2))).toBe(false)
    expect(gate.accept(envelope('e2', 'nft_1', 2))).toBe(true)
  })

  it('discards versions older than or equal to the known version', () => {
    const gate = createEventGate()
    expect(gate.accept(envelope('e1', 'nft_1', 5))).toBe(true)
    expect(gate.accept(envelope('e2', 'nft_1', 4))).toBe(false)
    expect(gate.accept(envelope('e3', 'nft_1', 5))).toBe(false)
    expect(gate.accept(envelope('e4', 'nft_1', 6))).toBe(true)
  })

  it('tracks versions per resource independently', () => {
    const gate = createEventGate()
    expect(gate.accept(envelope('e1', 'nft_1', 5))).toBe(true)
    expect(gate.accept(envelope('e2', 'nft_2', 3))).toBe(true)
    expect(gate.accept(envelope('e3', 'nft_2', 2))).toBe(false)
    expect(gate.accept(envelope('e4', 'nft_1', 4))).toBe(false)
  })

  it('evicts the oldest seen eventId beyond the limit', () => {
    const gate = createEventGate(2)
    expect(gate.accept(envelope('e1', 'nft_1', 1))).toBe(true)
    expect(gate.accept(envelope('e2', 'nft_1', 2))).toBe(true)
    expect(gate.accept(envelope('e3', 'nft_1', 3))).toBe(true)
    expect(gate.accept(envelope('e1', 'nft_1', 4))).toBe(true)
    expect(gate.accept(envelope('e2', 'nft_1', 5))).toBe(true)
  })

  it('reset clears dedupe memory and versions', () => {
    const gate = createEventGate()
    gate.accept(envelope('e1', 'nft_1', 5))
    gate.reset()
    expect(gate.accept(envelope('e1', 'nft_1', 5))).toBe(true)
  })
})
