import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { Button } from '~/components/admin/AdminControls'
import { DiceWorkspace } from '~/components/admin/DiceWorkspace'
import { readScenario } from '~/lib/market'
import { queueRefetch } from '~/lib/queuedRefetch'
import { trpc } from '~/lib/trpc'

export default function Forecast() {
  const router = useRouter()
  const segmentId = Number(router.query.id)
  const validSegment = Number.isInteger(segmentId) && segmentId > 0
  const { data, isLoading, error, refetch } = trpc.market.dice.useQuery(
    { segmentId },
    {
      enabled: validSegment,
      // The global event stream is player-only, so the admin view polls to
      // pick up segment starts and reveals from other operator tabs.
      refetchInterval: 15000,
    }
  )
  const reveal = trpc.market.revealRoll.useMutation()
  const queuedRefetch = useMemo(() => queueRefetch(refetch), [refetch])
  const segment = data
  if (!router.isReady || (validSegment && isLoading && !segment))
    return <p>Loading…</p>
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
          await reveal.mutateAsync({ segmentId, rollIndex })
          await queuedRefetch()
        }}
      />
    </>
  )
}
