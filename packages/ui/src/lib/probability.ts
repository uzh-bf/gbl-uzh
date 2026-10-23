// Keep the reference game's probability weights and volatility convention.
export function probabilityDistribution(trend: number, gap: number) {
  const weights = [
    0.0278, 0.0556, 0.0833, 0.1111, 0.1389, 0.1667, 0.1389, 0.1111, 0.0833,
    0.0556, 0.0278,
  ]
  const data = weights.map((prob, index) => ({
    eyes: String(index + 2),
    prob,
    value: trend + (index - 5) * gap,
  }))
  const expectation = data.reduce(
    (sum, item) => sum + item.prob * item.value,
    0
  )
  const volatility = Math.sqrt(
    data.reduce(
      (sum, item) => sum + item.prob * (item.value - expectation) ** 2,
      0
    ) * 4
  )
  return { data, volatility }
}

export function signedPercent(value: number, digits = 1) {
  const rounded = (value * 100).toFixed(digits)
  return `${Number(rounded) > 0 ? '+' : ''}${Number(rounded) === 0 ? (0).toFixed(digits) : rounded}%`
}
