import { useEffect, useRef, useState } from 'react'

export default function CompactCountdown({
  expiresAt,
  onUpdate,
}: {
  expiresAt: Date
  onUpdate: (seconds: number) => void
}) {
  const [seconds, setSeconds] = useState(0)
  const update = useRef(onUpdate)
  useEffect(() => {
    update.current = onUpdate
  })
  const expiry = expiresAt.getTime()
  useEffect(() => {
    const tick = () => {
      const remaining = Math.max(0, Math.floor((expiry - Date.now()) / 1000))
      setSeconds(remaining)
      update.current(remaining)
    }
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [expiry])
  return (
    <span data-cy="countdown" aria-label="Time remaining" role="timer">
      {String(Math.floor(seconds / 60)).padStart(2, '0')}:
      {String(seconds % 60).padStart(2, '0')}
    </span>
  )
}
