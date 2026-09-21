import assert from 'node:assert/strict'
import { test } from 'node:test'
import { probabilityDistribution } from '../src/lib/probability'

test('market chart uses scenario returns and existing volatility convention', () => {
  for (const [trend, gap] of [
    [0.0031, 0.005],
    [-0.03, 0.017],
    [0.11, 0],
    [0.0065, 0.025],
  ]) {
    const { data, volatility } = probabilityDistribution(trend, gap)
    assert.equal(data.length, 11)
    assert.equal(data[0].value, trend - 5 * gap)
    assert.equal(data[5].value, trend)
    assert.equal(data[10].value, trend + 5 * gap)
    assert.ok(data.every((item) => item.prob <= data[5].prob))
    const mean = data.reduce((sum, item) => sum + item.prob * item.value, 0)
    assert.equal(
      volatility,
      Math.sqrt(
        4 *
          data.reduce(
            (sum, item) => sum + item.prob * (item.value - mean) ** 2,
            0
          )
      )
    )
  }
  assert.equal(
    (probabilityDistribution(0.0031, 0.005).volatility * 100).toFixed(2),
    '2.42'
  )
  assert.equal(
    (probabilityDistribution(0.0065, 0.025).volatility * 100).toFixed(2),
    '12.08'
  )
  assert.notEqual(
    probabilityDistribution(-0.03, 0.017).volatility,
    probabilityDistribution(0.0031, 0.005).volatility
  )
})
