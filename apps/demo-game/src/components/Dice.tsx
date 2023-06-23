import { useEffect, useRef } from 'react'
import ReactDice from 'react-dice-complete'

import 'react-dice-complete/dist/react-dice-complete.css'

function Dice({ dice1, dice2 }) {
  const dice = useRef<any>()

  useEffect(() => {
    if (dice?.current) {
      dice.current.rollAll([dice1, dice2])
    }
  }, [dice, dice1, dice2])

  return (
    <div className="p-16">
      <ReactDice
        numDice={2}
        ref={dice}
        faceColor="#dc6027"
        dotColor="white"
        dieSize={250}
        margin={100}
        disableIndividual
        rollDone={() => null}
      />
    </div>
  )
}

export default Dice
