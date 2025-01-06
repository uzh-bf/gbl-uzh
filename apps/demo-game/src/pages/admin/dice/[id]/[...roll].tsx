import { ProbabilityChart } from '@gbl-uzh/ui'
import { Button } from '@uzh-bf/design-system'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useState } from 'react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@uzh-bf/design-system/dist/future'

const Die = dynamic(() => import('~/components/Die'), {
  ssr: false,
})

const StaticChartWithDice = ({
  title,
  dieA,
  dieB,
  colorA,
  colorB,
  trend,
  gap,
  totalEyes,
}) => {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription className="flex justify-between">
            <div>Dice outcome for {title.toLowerCase()}.</div>
            <div className="flex items-center justify-center">
              <Die
                die={dieA}
                defaultRoll={dieA}
                roll={false}
                faceColor={colorA}
                dieSize={20}
              />
              <Die
                die={dieB}
                defaultRoll={dieB}
                roll={false}
                faceColor={colorB}
                dieSize={20}
              />
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProbabilityChart
            trendE={trend}
            trendGap={gap}
            totalEyes={totalEyes}
          />
        </CardContent>
      </Card>
    </div>
  )
}

const Forecast = () => {
  const router = useRouter()

  const [roll, setRoll] = useState<boolean[]>([false, false, false])
  const [showDice, setShowDice] = useState<boolean[]>([false, false, false])

  if (!router.query?.roll?.[0]) return <div>Loading...</div>

  const decodedData = JSON.parse(atob(router.query?.roll?.[0]))

  const {
    diceBonds,
    diceShared,
    diceStocks,
    trendBonds,
    gapBonds,
    trendStocks,
    gapStocks,
  } = decodedData

  if (!diceBonds || !diceShared || !diceStocks) return <div>Loading...</div>
  const colors = [
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
    'hsl(var(--chart-2))',
  ]

  return (
    <div className="py-8">
      <div className="flex flex-col items-center justify-center gap-y-4">
        {diceBonds.map((num, i) => {
          const dieBond = diceBonds[i] - diceShared[i]
          const dieStock = diceStocks[i] - diceShared[i]
          return (
            <div key={i} className="flex w-full border-gray-300 px-8">
              <div className="flex w-full flex-col gap-4">
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle>{i + 1}. Month</CardTitle>
                    <CardDescription className="flex justify-between"></CardDescription>
                  </CardHeader>
                  <CardContent className="flex gap-4">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="flex flex-col justify-center gap-4">
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
                      <div>
                        <Button
                          onClick={() => {
                            setRoll((prev) =>
                              prev.map((item, idx) => (idx === i ? true : item))
                            )
                            setShowDice((prev) =>
                              prev.map((item, idx) =>
                                idx === i ? false : item
                              )
                            )
                            setTimeout(() => {
                              setRoll((prev) =>
                                prev.map((item, idx) =>
                                  idx === i ? false : item
                                )
                              )
                              setShowDice((prev) =>
                                prev.map((item, idx) =>
                                  idx === i ? true : item
                                )
                              )
                            }, 2500)
                          }}
                        >
                          Roll
                        </Button>
                      </div>
                    </div>

                    {showDice[i] && (
                      <div className="flex w-full items-center justify-center gap-4">
                        <StaticChartWithDice
                          title="Bonds"
                          dieA={dieBond}
                          dieB={diceShared[i]}
                          colorA={colors[0]}
                          colorB={colors[1]}
                          trend={trendBonds}
                          gap={gapBonds}
                          totalEyes={diceBonds[i].toString()}
                        />

                        <StaticChartWithDice
                          title="Stocks"
                          dieA={diceShared[i]}
                          dieB={dieStock}
                          colorA={colors[1]}
                          colorB={colors[2]}
                          trend={trendStocks}
                          gap={gapStocks}
                          totalEyes={diceStocks[i].toString()}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Forecast
