import { useEffect, useRef } from 'react'
import ReactDice, { ReactDiceRef } from 'react-dice-complete'

function Dice({ dice1, dice2 }: { dice1: number; dice2: number }) {
  const dice = useRef<ReactDiceRef>(null)

  useEffect(() => {
    if (dice?.current) {
      dice.current.rollAll([dice1, dice2])
    }
  }, [dice, dice1, dice2])

  const rollDone = (totalValue: number, values: number[]) => {
    console.log('individual die values array:', values)
    console.log('total dice value:', totalValue)
  }

  // const rollAll = () => {
  //   dice.current?.rollAll()
  // }

  return (
    // @ts-ignore
    <ReactDice
      numDice={2}
      ref={dice}
      faceColor="#dc6027"
      dotColor="white"
      dieSize={250}
      margin={100}
      disableIndividual
      // rollDone={() => null}
      rollDone={rollDone}
    />
  )
}

export { Dice }
