import React, { useEffect, useState } from 'react'

interface CycleCountdownProps {
  expiresAt: Date
  totalDuration: number // in seconds
  onExpire?: () => void
  onUpdate?: (secondsLeft: number) => void
  formatter?: (secondsLeft: number) => string
  className?: string
}

export const CycleCountdown: React.FC<CycleCountdownProps> = ({
  expiresAt,
  totalDuration,
  formatter = (value) => `${value}s`,
  onExpire,
  onUpdate,
  className = '',
}) => {
  const radius = 30
  const strokeWidth = 4
  const normalizedRadius = radius - strokeWidth / 2
  const circumference = normalizedRadius * 2 * Math.PI

  const calculateSecondsLeft = () =>
    Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000))

  const [secondsLeft, setSecondsLeft] = useState<number>(calculateSecondsLeft)

  useEffect(() => {
    let intervalId: NodeJS.Timeout

    const tick = () => {
      const remaining = calculateSecondsLeft()
      setSecondsLeft(remaining)
      onUpdate?.(remaining)
      if (remaining <= 0) {
        clearInterval(intervalId)
        onExpire?.()
      }
    }

    intervalId = setInterval(tick, 1000)
    tick() // run immediately

    return () => clearInterval(intervalId)
  }, [expiresAt])

  const progress = secondsLeft / totalDuration
  const strokeDashoffset = circumference * (1 - progress)

  return (
    <div style={{ width: 100, height: 100 }} className={`${className}`}>
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
