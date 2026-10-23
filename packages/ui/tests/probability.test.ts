import { expect, test } from 'vitest'
import { probabilityDistribution, signedPercent } from '../src/lib/probability'

test('market chart uses scenario returns and existing volatility convention', () => {
  for (const [trend, gap] of [
    [0.0031, 0.005],
    [-0.03, 0.017],
    [0.11, 0],
    [0.0065, 0.025],
  ]) {
    const { data, volatility } = probabilityDistribution(trend, gap)
    expect(data.length).toBe(11)
    expect(data[0].value).toBe(trend - 5 * gap)
    expect(data[5].value).toBe(trend)
    expect(data[10].value).toBe(trend + 5 * gap)
    expect(data.every((item) => item.prob <= data[5].prob)).toBeTruthy()
    const mean = data.reduce((sum, item) => sum + item.prob * item.value, 0)
    expect(volatility).toBe(
      Math.sqrt(
        4 *
          data.reduce(
            (sum, item) => sum + item.prob * (item.value - mean) ** 2,
            0
          )
      )
    )
  }
  expect(
    (probabilityDistribution(0.0031, 0.005).volatility * 100).toFixed(2)
  ).toBe('2.42')
  expect(
    (probabilityDistribution(0.0065, 0.025).volatility * 100).toFixed(2)
  ).toBe('12.08')
  expect(probabilityDistribution(-0.03, 0.017).volatility).not.toBe(
    probabilityDistribution(0.0031, 0.005).volatility
  )
})

test('signed percentages preserve precision and suppress rounded negative zero', () => {
  expect(signedPercent(0.0123)).toBe('+1.2%')
  expect(signedPercent(-0.0123)).toBe('-1.2%')
  expect(signedPercent(0.0123, 2)).toBe('+1.23%')
  expect(signedPercent(-0.0001)).toBe('0.0%')
  expect(signedPercent(0)).toBe('0.0%')
  expect(signedPercent(-0, 2)).toBe('0.00%')
})
