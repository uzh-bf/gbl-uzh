import { Button } from '@uzh-bf/design-system'
import dynamic from 'next/dynamic'
import { useRef } from 'react'
import { ReactDiceRef } from 'react-dice-complete'

const ReactDice = dynamic(
  () => import('react-dice-complete').then((mod) => mod.default),
  {
    ssr: false,
  }
)

interface DiceProps {
  dice: {
    die: number
    faceColor?: string
    dotColor?: string
    dieSize?: number
    margin?: number
    label?: string
  }[]
}

function Dice({ dice }: DiceProps) {
  const diceRef = dice.map(() => useRef<ReactDiceRef>(null))

  const rollAll = () => {
    diceRef.forEach((ref, ix) => {
      if (ref.current && typeof ref.current.rollAll === 'function') {
        ref.current.rollAll([dice[ix].die])
      } else {
        console.warn('rollAll method is not available')
      }
    })
  }

  return (
    <div className="flex flex-col items-center justify-center gap-y-4">
      <div className="flex flex-row gap-4">
        {dice.map((item, ix) => (
          <div className="flex flex-col items-center justify-center" key={ix}>
            <ReactDice
              numDice={1}
              ref={diceRef[ix]}
              faceColor={item.faceColor}
              dotColor={item.dotColor}
              dieSize={item.dieSize}
              margin={item.margin}
              rollTime={2}
              disableIndividual
              rollDone={() => null}
              // rollDone={(totalValue: number, values: number[]) => {
              // console.log('individual die values array:', values)
              // console.log('total dice value:', totalValue)
              // }}
            />
            {item.label && <span className="text-sm">{item.label}</span>}
          </div>
        ))}
      </div>
      <Button onClick={rollAll}>Roll</Button>
    </div>
  )
}

export { Dice }
