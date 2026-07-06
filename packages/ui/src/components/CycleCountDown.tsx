import { useEffect, useRef, useState } from 'react'

interface CycleCountdownProps {
  expiresAt: Date
  totalDuration: number // in seconds
  onExpire?: () => void
  onUpdate?: (secondsLeft: number) => void
  formatter?: (secondsLeft: number) => string
  size?: number
  trackColor?: string
  progressColor?: string
  textColor?: string
  className?: string
}

export function CycleCountdown({
  expiresAt,
  totalDuration,
  formatter = (value) => `${value}s`,
  onExpire,
  onUpdate,
  size = 100,
  trackColor = '#e5e7eb',
  progressColor = '#10b981',
  textColor = '#374151',
  className = '',
}: CycleCountdownProps) {
  const radius = size * 0.3
  const strokeWidth = size * 0.04
  const normalizedRadius = radius - strokeWidth / 2
  const circumference = normalizedRadius * 2 * Math.PI

  const getSecondsLeft = () =>
    Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000))

  const [secondsLeft, setSecondsLeft] = useState<number>(getSecondsLeft)

  // Store callbacks in refs so the interval is not torn down and recreated
  // when the parent re-renders with new inline closure identities.
  const onUpdateRef = useRef(onUpdate)
  const onExpireRef = useRef(onExpire)
  useEffect(() => {
    onUpdateRef.current = onUpdate
    onExpireRef.current = onExpire
  })

  useEffect(() => {
    const tick = () => {
      const remaining = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000))
      setSecondsLeft(remaining)
      onUpdateRef.current?.(remaining)
      return remaining <= 0
    }

    const intervalId = setInterval(() => {
      const isExpired = tick()
      if (isExpired) {
        clearInterval(intervalId)
        onExpireRef.current?.()
      }
    }, 1000)

    const isExpired = tick() // run immediately
    if (isExpired) {
      clearInterval(intervalId)
      onExpireRef.current?.()
    }

    return () => clearInterval(intervalId)
  }, [expiresAt])

  const progress = secondsLeft / totalDuration
  const strokeDashoffset = circumference * (1 - progress)

  return (
    <div
      style={{ width: size, height: size }}
      className={`${className}`}
      data-cy="countdown"
    >
      <svg width={size} height={size}>
        <circle
          cx="50%"
          cy="50%"
          r={normalizedRadius}
          fill="transparent"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx="50%"
          cy="50%"
          r={normalizedRadius}
          fill="transparent"
          stroke={progressColor}
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
          fontSize={size * 0.16}
          fill={textColor}
        >
          {formatter(secondsLeft)}
        </text>
      </svg>
    </div>
  )
}
