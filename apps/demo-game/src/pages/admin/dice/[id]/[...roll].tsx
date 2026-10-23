import { useMutation, useQuery, useSubscription } from '@apollo/client'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { Button } from '~/components/admin/AdminControls'
import { DiceWorkspace } from '~/components/admin/DiceWorkspace'
import {
  GlobalEventsDocument,
  MarketDiceDocument,
  RevealMarketRollDocument,
} from '~/graphql/generated/ops'
import { shouldRefetchDemoGame } from '~/lib/gameEvents'
import { readScenario } from '~/lib/market'
import { queueRefetch } from '~/lib/queuedRefetch'

export default function Forecast() {
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
      if (shouldRefetchDemoGame(event, segment?.gameId))
        void queuedRefetch().catch(() => {})
    },
  })
  if (loading && !segment) return <p>Loading…</p>
  if (error && !segment)
    return <p role="alert">Could not load dice. Please reload the page.</p>
  if (!segment) return <p>Segment not found.</p>
  const scenario = readScenario(segment.periodFacts)
  if (!scenario) return <p>Market data is unavailable.</p>
  return (
    <>
      {error && (
        <div
          role="alert"
          className="mobile:p-app-4 flex flex-wrap items-center gap-[12px] p-[28px]"
        >
          <p className="m-0">
            Could not refresh dice. Showing the last loaded data.
          </p>
          <Button onClick={() => void queuedRefetch().catch(() => {})}>
            Retry loading
          </Button>
        </div>
      )}
      <DiceWorkspace
        key={segment.id}
        segment={segment}
        scenario={scenario}
        publish={async (rollIndex) => {
          await reveal({ variables: { segmentId, rollIndex } })
          await queuedRefetch()
        }}
      />
    </>
  )
}
