import { ProbabilityChart } from '@gbl-uzh/ui'
import { Button } from '@uzh-bf/design-system'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useState } from 'react'

const Die = dynamic(() => import('~/components/Die'), {
  ssr: false,
})

function Forecast() {
  const router = useRouter()

  const [roll, setRoll] = useState<boolean[]>([false, false, false])
  const [showDice, setShowDice] = useState<boolean[]>([false, false, false])

  const nums = ((router.query?.roll?.[0] as string) ?? '').split('-')
  const diceBonds = nums.slice(0, 3).map((num) => parseInt(num))
  const diceShared = nums.slice(3, 6).map((num) => parseInt(num))
  const diceStocks = nums.slice(6, 9).map((num) => parseInt(num))
  const trendBonds = parseFloat(nums[9])
  const gapBonds = parseFloat(nums[10])
  const trendStocks = parseFloat(nums[11])
  const gapStocks = parseFloat(nums[12])

  if (!diceBonds || !diceShared || !diceStocks) return <div>Loading...</div>
  const colors = [
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
    'hsl(var(--chart-2))',
  ]

  // TODO(JJ):
  // - Add provide doneRoll and add state in this component
  return (
    <div className="pt-8">
      <div className="flex flex-col items-center justify-center gap-y-4">
        {diceBonds.map((num, i) => {
          const dieBond = diceBonds[i] - diceShared[i]
          const dieStock = diceStocks[i] - diceShared[i]
          return (
            <div key={i} className="border-b border-gray-300 pb-16">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="flex flex-row gap-4">
                  <Die
                    die={dieBond}
                    roll={roll[i]}
                    faceColor={colors[0]}
                    label="Dice Bonds"
                  />
                  <Die
                    die={diceShared[i]}
                    roll={roll[i]}
                    faceColor={colors[1]}
                    label="Dice Shared"
                  />
                  <Die
                    die={dieStock}
                    roll={roll[i]}
                    faceColor={colors[2]}
                    label="Dice Stocks"
                  />
                </div>
                <Button
                  onClick={() => {
                    setRoll((prev) =>
                      prev.map((item, idx) => (idx === i ? true : item))
                    )
                    setShowDice((prev) =>
                      prev.map((item, idx) => (idx === i ? false : item))
                    )
                    setTimeout(() => {
                      setRoll((prev) =>
                        prev.map((item, idx) => (idx === i ? false : item))
                      )
                      setShowDice((prev) =>
                        prev.map((item, idx) => (idx === i ? true : item))
                      )
                    }, 2500)
                  }}
                >
                  Roll
                </Button>
              </div>

              {showDice[i] && (
                <div className="flex items-center justify-center gap-4">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="flex h-full items-center justify-center">
                      <Die
                        die={dieBond}
                        defaultRoll={dieBond}
                        roll={false}
                        faceColor={colors[0]}
                        dieSize={20}
                      />
                      <Die
                        die={diceShared[i]}
                        defaultRoll={diceShared[i]}
                        roll={false}
                        faceColor={colors[1]}
                        dieSize={20}
                      />
                    </div>

                    <ProbabilityChart
                      trendE={trendBonds}
                      trendGap={gapBonds}
                      totalEyes={diceBonds[i].toString()}
                    />
                  </div>
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="flex h-full items-center justify-center">
                      <Die
                        die={diceShared[i]}
                        defaultRoll={diceShared[i]}
                        roll={false}
                        faceColor={colors[1]}
                        dieSize={20}
                      />
                      <Die
                        die={dieStock}
                        defaultRoll={dieStock}
                        roll={false}
                        faceColor={colors[2]}
                        dieSize={20}
                      />
                    </div>
                    <ProbabilityChart
                      trendE={trendStocks}
                      trendGap={gapStocks}
                      totalEyes={diceStocks[i].toString()}
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Forecast
