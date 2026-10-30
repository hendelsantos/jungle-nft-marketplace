import { describe, expect, it } from 'vitest'
import { parseHomeSearch } from '@/routes/home-search'

describe('parseHomeSearch', () => {
  it('returns an empty search for a bare URL', () => {
    expect(parseHomeSearch({})).toEqual({})
  })

  it('keeps valid params and omits defaults', () => {
    expect(parseHomeSearch({ q: 'Tiger', sort: 'price-desc', page: '2' })).toEqual({ q: 'Tiger', sort: 'price-desc', page: 2 })
  })

  it('normalizes decimal price filters from strings and numbers', () => {
    expect(parseHomeSearch({ minPrice: '1', maxPrice: '1.5' })).toEqual({ minPrice: 1, maxPrice: 1.5 })
    expect(parseHomeSearch({ minPrice: 2, maxPrice: 3.25 })).toEqual({ minPrice: 2, maxPrice: 3.25 })
  })

  it('rejects malformed decimals, sorts, pages and availability', () => {
    expect(parseHomeSearch({ minPrice: '-1' })).toEqual({})
    expect(parseHomeSearch({ minPrice: '1,5' })).toEqual({})
    expect(parseHomeSearch({ minPrice: '01' })).toEqual({})
    expect(parseHomeSearch({ minPrice: 'abc' })).toEqual({})
    expect(parseHomeSearch({ sort: 'invalid' })).toEqual({})
    expect(parseHomeSearch({ page: '0' })).toEqual({})
    expect(parseHomeSearch({ page: '2.5' })).toEqual({})
    expect(parseHomeSearch({ availability: 'maybe' })).toEqual({})
  })

  it('keeps only the valid subset when mixed with garbage', () => {
    expect(parseHomeSearch({ q: 'Tiger', q_bad: 'x', minPrice: '1', page: 'x', availability: 'available' })).toEqual({
      q: 'Tiger',
      minPrice: 1,
      availability: 'available',
    })
  })
})
