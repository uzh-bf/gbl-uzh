import { useEffect, useState } from 'react'

interface CycleCountdownProps {
  expiresAt: Date
  totalDuration: number // in seconds
  onExpire?: () => void
  onUpdate?: (secondsLeft: number) => void
  formatter?: (secondsLeft: number) => string
  className?: string
}

export function CycleCountdown({
  expiresAt,
  totalDuration,
  formatter = (value) => `${value}s`,
  onExpire,
  onUpdate,
  className = '',
}: CycleCountdownProps) {
  const radius = 30
  const strokeWidth = 4
  const normalizedRadius = radius - strokeWidth / 2
  const circumference = normalizedRadius * 2 * Math.PI

  const getSecondsLeft = () =>
    Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000))

  const [secondsLeft, setSecondsLeft] = useState<number>(getSecondsLeft)

  useEffect(() => {
    const tick = () => {
      const remaining = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000))
      setSecondsLeft(remaining)
      onUpdate?.(remaining)
      return remaining <= 0
    }

    const intervalId = setInterval(() => {
      const isExpired = tick()
      if (isExpired) {
        clearInterval(intervalId)
        onExpire?.()
      }
    }, 1000)

    const isExpired = tick() // run immediately
    if (isExpired) {
      clearInterval(intervalId)
      onExpire?.()
    }

    return () => clearInterval(intervalId)
  }, [expiresAt, onUpdate, onExpire])

  const progress = secondsLeft / totalDuration
  const strokeDashoffset = circumference * (1 - progress)

  return (
    <div
      style={{ width: 100, height: 100 }}
      className={`${className}`}
      data-cy="countdown"
    >
      <svg width="100" height="100">
        <circle
          cx="50"
          cy="50"
          r={normalizedRadius}
          fill="transparent"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        <circle
          cx="50"
          cy="50"
          r={normalizedRadius}
          fill="transparent"
          stroke="#10b981"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
            transition: 'stroke-dashoffset 1s linear',
          }}
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="16"
          fill="#374151"
        >
          {formatter(secondsLeft)}
        </text>
      </svg>
    </div>
  )
}
