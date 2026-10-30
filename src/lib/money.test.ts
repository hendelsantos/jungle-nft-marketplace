import { describe, expect, it } from 'vitest'
import { addEth, formatEth, multiplyEth, percentOfEth, subtractEth } from './money'

describe('ETH money domain', () => {
  it('preserves decimal precision without binary floats', () => {
    expect(addEth('0.1', '0.2')).toBe('0.3')
    expect(multiplyEth('0.12345678', 3)).toBe('0.37037034')
  })

  it('calculates discount, fee and presentation deterministically', () => {
    const subtotal = addEth('0.84', '1.25')
    const discount = percentOfEth(subtotal, '10')
    const afterDiscount = subtractEth(subtotal, discount)
    const fee = percentOfEth(afterDiscount, '1.5')
    expect({ subtotal, discount, afterDiscount, fee }).toEqual({ subtotal: '2.09', discount: '0.209', afterDiscount: '1.881', fee: '0.028215' })
    expect(formatEth(addEth(afterDiscount, fee))).toBe('1.9092 ETH')
  })
})
