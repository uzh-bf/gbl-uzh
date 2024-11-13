import { useEffect, useRef } from 'react'
import ReactDice, { ReactDiceRef } from 'react-dice-complete'

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

const emptyRollDoneFn = (_: number, __: number[]) => {
  // console.log('emptyRollDoneFn', totalValue, values)
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

  useEffect(() => {
    if (roll && ref.current && typeof ref.current.rollAll === 'function') {
      ref.current.rollAll([die])
    } else {
      console.warn('rollAll method is not available on ref.current')
    }
  }, [roll])

  return (
    <div className="flex flex-col items-center justify-center">
      <ReactDice
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
      {label && <span className="text-sm">{label}</span>}
    </div>
  )
}

Die.displayName = 'Die'

export default Die
