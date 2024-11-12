import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useState, useRef } from 'react'
import { Button } from '@uzh-bf/design-system'

// const Die = dynamic<any>(() => import('@gbl-uzh/ui').then((mod) => mod.Die), { 
//   ssr: false, // Ensure SSR is disabled for this component
// })
const Dice = dynamic<any>(() => import('@gbl-uzh/ui').then((mod) => mod.Dice), { 
  ssr: false, // Ensure SSR is disabled for this component
})

function Forecast() {
  const router = useRouter()
  const [ showDice, setShowDice ] = useState(false)
  // const [dice1, dice2] = ((router.query?.roll?.[0] as string) ?? '').split('-')

  // if (!dice1 || !dice2) return <div>Loading...</div>

  // const diceRef = useRef<any[]>([])
  const diceRef1 = useRef<any>(null)
  // const diceRef2 = useRef<ReactDiceRef>(null)
  // const diceRef3 = useRef<ReactDiceRef>(null)
  
  // const myDice = [
  //           { die: 2, faceColor: '#dc6027', label: 'Die Bonds', 
  //             // rollDone: (totalValue: number, values: number[]) => {
  //             //   setShowDice(true)
  //             // }
  //           },
  //           { die: 3, faceColor: '#32c8dc', label: 'Die Shared'},
  //           { die: 4, faceColor: '#65a9f7', label: 'Die Stocks' },
          // ]

  const rollAll = () => {
    // diceRef.current.forEach((ref, ix) => {
    //   if (ref && typeof ref.rollAll === 'function') {
    //     ref.rollAll([myDice[ix].die])
    //   } else {
    //     console.warn('rollAll method is not available')
    //   }
    // })
      if (diceRef1 && typeof diceRef1.current.rollAll === 'function') {
        diceRef1.current.rollAll()
      } else {
        console.warn('rollAll method is not available')
      }
    
  }

  // TODO(JJ):
  // - Add provide doneRoll and add state in this component
  // - defaultRollFn => do nothing
  return (
    <div className="pt-8">
      <div className="flex flex-col gap-y-4 items-center justify-center">
      <div className="flex flex-row gap-4">
        {/* {myDice.map((item, ix) => {
          // console.log('item', diceRef.current[ix])
          return(
            <Die
              key={ix}
              ref={(el) => diceRef.current[ix] = el}
              // die={item.die}
              faceColor={item.faceColor}
              label={item.label}
              // rollDone={item.rollDone}
            />
        )})} */}
        <Dice
          dice={[
            { die: 2, faceColor: '#dc6027', dotColor: 'white', label: 'Die Bonds' },
            { die: 3, faceColor: '#32c8dc', dotColor: 'white', label: 'Die Shared'},
            { die: 4, faceColor: '#65a9f7', dotColor: 'white', label: 'Die Stocks' },
          ]}
        />

      </div>
      {/* <Button onClick={rollAll}>Roll</Button> */}
    </div>
      {/* {showDice && <div className="flex h-full flex-col items-center justify-center">
        <Die
          die={2}
          defaultRoll={2}
        />
      </div>} */}

      {/* <div>
        <ProbabilityChart
          trendE={currentGame.activePeriod.facts.trendE}
          trendGap={currentGame.activePeriod.facts.trendGap}
          totalEyes={totalEyes}
        />
      </div> */}
    </div>
  )
}

export default Forecast
