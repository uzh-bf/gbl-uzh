import dynamic from 'next/dynamic'
import { useRef, forwardRef, useImperativeHandle } from 'react'
import { ReactDiceRef } from 'react-dice-complete'

const ReactDice = dynamic(
  () => import('react-dice-complete').then((mod) => mod.default),
  {
    ssr: false,
  }
)

interface DieProps {
  die: number
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

const Die = forwardRef(
  (
    {
      die,
      defaultRoll,
      faceColor,
      dotColor,
      dieSize,
      margin,
      label,
      rollDone,
    }: DieProps,
    ref
  ) => {
    const innerRef = useRef<ReactDiceRef>(null)

    useImperativeHandle(ref, () => ({
      rollAll: () => {
        innerRef.current?.rollAll([die])
      },
    }))

    return (
      <div className="flex flex-col items-center justify-center">
        <ReactDice
          numDice={1}
          ref={innerRef}
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
)

Die.displayName = 'Die'

export { Die }
