import Decimal from 'decimal.js'

Decimal.set({ precision: 40, rounding: Decimal.ROUND_HALF_UP })

export function addEth(...values: string[]) {
  return values.reduce((sum, value) => sum.plus(value), new Decimal(0)).toFixed(8).replace(/\.?0+$/, '') || '0'
}

export function multiplyEth(value: string, quantity: number) {
  return new Decimal(value).times(quantity).toFixed(8).replace(/\.?0+$/, '') || '0'
}

export function subtractEth(value: string, deduction: string) {
  return Decimal.max(new Decimal(value).minus(deduction), 0).toFixed(8).replace(/\.?0+$/, '') || '0'
}

export function percentOfEth(value: string, percent: string) {
  return new Decimal(value).times(percent).div(100).toFixed(8).replace(/\.?0+$/, '') || '0'
}

export function formatEth(value: string) {
  return `${new Decimal(value).toFixed(4).replace(/\.?0+$/, '') || '0'} ETH`
}
