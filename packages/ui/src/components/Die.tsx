import { useEffect, useRef, useState } from 'react'
import type { ReactDiceRef } from 'react-dice-complete'
import type * as ReactDiceModule from 'react-dice-complete'

interface DieProps {
  die: number
  roll: boolean
  defaultRoll?: number
  faceColor?: string
  dotColor?: string
  dieSize?: number
  margin?: number
  label?: string
  rollTime?: number
  rollDone?: (totalValue: number, values: number[]) => void
}

const Die = ({
  die,
  roll,
  defaultRoll,
  faceColor,
  dotColor,
  dieSize,
  margin,
  label,
  rollTime = 2,
  rollDone,
}: DieProps) => {
  const ref = useRef<ReactDiceRef>(null)
  const [ReactDiceComponent, setReactDiceComponent] = useState<
    typeof ReactDiceModule.default | null
  >(null)

  useEffect(() => {
    import('react-dice-complete').then((mod) => {
      const moduleDefault = mod.default as
        | typeof ReactDiceModule.default
        | { default: typeof ReactDiceModule.default }

      setReactDiceComponent(() =>
        'default' in moduleDefault ? moduleDefault.default : moduleDefault
      )
    })
  }, [])

  useEffect(() => {
    if (ReactDiceComponent && roll && ref.current && typeof ref.current.rollAll === 'function') {
      ref.current.rollAll([die])
    }
  }, [roll, die, ReactDiceComponent])

  return (
    <div className="flex flex-col items-center justify-center min-h-[40px]">
      {ReactDiceComponent ? (
        <ReactDiceComponent
          numDice={1}
          ref={ref}
          defaultRoll={defaultRoll}
          faceColor={faceColor}
          dotColor={dotColor ?? 'white'}
          dieSize={dieSize}
          margin={margin}
          rollTime={rollTime}
          disableIndividual
          rollDone={rollDone ?? (() => {})}
        />
      ) : (
        <div 
          style={{ 
            width: dieSize, 
            height: dieSize, 
            backgroundColor: faceColor, 
            borderRadius: '4px',
            margin: margin 
          }} 
          className="animate-pulse"
        />
      )}
      {label && <span className="text-sm">{label}</span>}
    </div>
  )
}

Die.displayName = 'Die'

export default Die
