import { useMutation, useQuery, useSubscription } from '@apollo/client'
import { ProbabilityChart, shouldRefetchGameResult } from '@gbl-uzh/ui'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  GlobalEventsDocument,
  MarketDiceDocument,
  RevealMarketRollDocument,
} from '~/graphql/generated/ops'
import {
  parseMarketFacts,
  readMarketRoll,
  readScenario,
  revealedIndices,
  type MarketRoll,
  type MarketScenario,
} from '~/lib/market'
import { queueRefetch } from '~/lib/queuedRefetch'

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/admin/AdminControls'

const Die = dynamic(() => import('@gbl-uzh/ui').then((mod) => mod.Die), {
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

function DiceMonth({
  index,
  dice,
  scenario,
  revealed,
  canReveal,
  publish,
}: {
  index: number
  dice: MarketRoll
  scenario: MarketScenario
  revealed: boolean
  canReveal: boolean
  publish: () => Promise<void>
}) {
  const [phase, setPhase] = useState<
    'idle' | 'rolling' | 'publishing' | 'error'
  >('idle')
  const rolling = phase === 'rolling'
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    []
  )
  const colors = ['var(--chart-4)', 'var(--chart-5)', 'var(--chart-2)']
  const sendReveal = async () => {
    setPhase('publishing')
    try {
      await publish()
      setPhase('idle')
    } catch {
      setPhase('error')
    }
  }
  const startRoll = () => {
    setPhase('rolling')
    timer.current = setTimeout(() => {
      void sendReveal()
    }, 2500)
  }
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{index + 1}. Month</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="flex flex-wrap items-start gap-4"
          data-cy={`admin-roll-${index}`}
        >
          <div className="flex flex-col items-center gap-4">
            <Die
              die={dice.bonds - dice.shared}
              roll={rolling}
              faceColor={colors[0]}
              label="Dice Bonds"
            />
            <Die
              die={dice.shared}
              roll={rolling}
              faceColor={colors[1]}
              label="Dice Shared"
            />
            <Die
              die={dice.stocks - dice.shared}
              roll={rolling}
              faceColor={colors[2]}
              label="Dice Stocks"
            />
            <Button
              onClick={startRoll}
              disabled={!canReveal || rolling || phase === 'publishing'}
            >
              Roll
            </Button>
            {!canReveal && <p>Start this segment before revealing its dice.</p>}
            {phase === 'publishing' && (
              <p role="status">Publishing to players…</p>
            )}
            {revealed && phase === 'idle' && (
              <p role="status">Revealed to players</p>
            )}
            {phase === 'error' && (
              <div role="alert">
                <p>Could not publish the roll to players.</p>
                <Button onClick={sendReveal} disabled={!canReveal}>
                  Retry publishing
                </Button>
              </div>
            )}
          </div>
          {revealed && !rolling && (
            <div className="flex min-w-0 flex-1 flex-wrap gap-4">
              <StaticChartWithDice
                title="Bonds"
                dieA={dice.bonds - dice.shared}
                dieB={dice.shared}
                colorA={colors[0]}
                colorB={colors[1]}
                trend={scenario.trendBonds}
                gap={scenario.gapBonds}
                totalEyes={String(dice.bonds)}
              />
              <StaticChartWithDice
                title="Stocks"
                dieA={dice.shared}
                dieB={dice.stocks - dice.shared}
                colorA={colors[1]}
                colorB={colors[2]}
                trend={scenario.trendStocks}
                gap={scenario.gapStocks}
                totalEyes={String(dice.stocks)}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

const Forecast = () => {
  const router = useRouter()
  const segmentId = Number(router.query.id)
  const { data, loading, error, refetch } = useQuery(MarketDiceDocument, {
    variables: { segmentId },
    skip: !Number.isInteger(segmentId) || segmentId <= 0,
    fetchPolicy: 'cache-and-network',
  })
  const [reveal] = useMutation(RevealMarketRollDocument)
  const queuedRefetch = useMemo(() => queueRefetch(refetch), [refetch])
  const segment = data?.marketDice
  useSubscription(GlobalEventsDocument, {
    skip: !segment,
    onData: ({ data: eventData }) => {
      const event = eventData.data?.eventsGlobal
      if (
        shouldRefetchGameResult(event, segment?.gameId) ||
        (event?.type === 'MARKET_ROLL_REVEALED' &&
          event.facts?.gameId === segment?.gameId)
      )
        void queuedRefetch().catch(() => {})
    },
  })
  if (loading && !segment) return <p>Loading…</p>
  if (error)
    return <p role="alert">Could not load dice. Please reload the page.</p>
  if (!segment) return <p>Segment not found.</p>
  const scenario = readScenario(segment.periodFacts)
  const facts = parseMarketFacts(segment.facts)
  if (!scenario || !Array.isArray(facts.diceRolls))
    return <p>Market data is unavailable.</p>
  const indices = revealedIndices(segment.facts)
  return (
    <div className="mobile:app-panel mobile:app-body flex flex-col gap-4 px-8 py-8">
      <h1>
        {2026 + segment.periodIx} · Quarter {segment.index + 1}
      </h1>
      {facts.diceRolls.map((_, index) => {
        const roll = readMarketRoll(segment.facts, index)
        return roll ? (
          <DiceMonth
            key={`${segment.id}:${index}`}
            index={index}
            dice={roll.dice}
            scenario={scenario}
            revealed={indices.includes(index)}
            canReveal={segment.canReveal}
            publish={async () => {
              await reveal({ variables: { segmentId, rollIndex: index } })
              await queuedRefetch()
            }}
          />
        ) : (
          <p key={index}>Month {index + 1}: dice unavailable.</p>
        )
      })}
    </div>
  )
}

export default Forecast
