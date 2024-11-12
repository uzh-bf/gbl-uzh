import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useState } from 'react'

const Dice = dynamic<any>(() => import('@gbl-uzh/ui').then((mod) => mod.Dice), {
  ssr: false, // Ensure SSR is disabled for this component
})

function Forecast() {
  const router = useRouter()
  const [showDice, setShowDice] = useState(false)
  const nums = ((router.query?.roll?.[0] as string) ?? '').split('-')
  const diceBonds = nums.slice(0, 3).map((num) => parseInt(num))
  const diceShared = nums.slice(3, 6).map((num) => parseInt(num))
  const diceStocks = nums.slice(6).map((num) => parseInt(num))

  if (!diceBonds || !diceShared || !diceStocks) return <div>Loading...</div>

  // TODO(JJ):
  // - Add provide doneRoll and add state in this component
  return (
    <div className="pt-8">
      <div className="flex flex-col items-center justify-center gap-y-4">
        {diceBonds.map((num, i) => (
          <div key={i} className="border-b border-gray-300 pb-4">
            <div className="flex flex-row gap-4">
              <Dice
                dice={[
                  {
                    die: diceBonds[i] - diceShared[i],
                    faceColor: '#dc6027',
                    label: 'Die Bonds',
                    rollDone: () => setShowDice(true),
                  },
                  {
                    die: diceShared[i],
                    faceColor: '#32c8dc',
                    label: 'Die Shared',
                  },
                  {
                    die: diceStocks[i] - diceShared[i],
                    faceColor: '#65a9f7',
                    label: 'Die Stocks',
                  },
                ]}
                withRollButton
              />
            </div>
            {showDice && (
              <div className="flex items-center justify-center gap-4">
                <div className="flex h-full flex-col items-center justify-center">
                  <Dice
                    dice={[
                      {
                        die: diceBonds[i] - diceShared[i],
                        defaultRoll: diceBonds[i] - diceShared[i],
                        faceColor: '#dc6027',
                      },
                      {
                        die: diceShared[i],
                        defaultRoll: diceShared[i],
                        faceColor: '#32c8dc',
                      },
                    ]}
                  />
                </div>
                <div className="flex h-full flex-col items-center justify-center">
                  <Dice
                    dice={[
                      {
                        die: diceShared[i],
                        defaultRoll: diceShared[i],
                        faceColor: '#32c8dc',
                      },
                      {
                        die: diceStocks[i] - diceShared[i],
                        defaultRoll: diceStocks[i] - diceShared[i],
                        faceColor: '#dc6027',
                      },
                    ]}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

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
