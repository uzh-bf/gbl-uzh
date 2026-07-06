import { useEffect, useRef, useState } from 'react'
import type { ReactDiceRef } from 'react-dice-complete'

interface DieProps {
  die: number
  roll: boolean
  defaultRoll?: number
  faceColor?: string
  dotColor?: string
  dieSize?: number
  margin?: number
  label?: string
  rollDone?: (totalValue: number, values: number[]) => void
}

const emptyRollDoneFn = () => {
  // console.log('emptyRollDoneFn')
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
  rollDone,
}: DieProps) => {
  const ref = useRef<ReactDiceRef>(null)
  const [ReactDiceComponent, setReactDiceComponent] = useState<any>(null)

  useEffect(() => {
    import('react-dice-complete').then((mod) => {
      setReactDiceComponent(() => mod.default)
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
          rollTime={2}
          disableIndividual
          rollDone={rollDone ?? emptyRollDoneFn}
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

