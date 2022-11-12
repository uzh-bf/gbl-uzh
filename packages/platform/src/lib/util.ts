export function setDifference(a, b, filterNoId = false) {
  if (!b) return a
  const A = a || []
  const B = new Set(b.map((item) => item.id))
  return A.filter((item) => !B.has(item.id) || (filterNoId && !item.id))
}

export function setIntersection(a, b) {
  if (!a || !b) return []
  const B = new Set(b.map((item) => item.id))
  return a.filter((item) => B.has(item.id) && item.id)
}
