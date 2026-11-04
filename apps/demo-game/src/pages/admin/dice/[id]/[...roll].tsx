import { useMutation, useQuery, useSubscription } from '@apollo/client'
import { useTranslations } from 'next-intl'
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
  const t = useTranslations()
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
  if (loading && !segment) return <p>{t('manage.dice.loading')}</p>
  if (error && !segment) return <p role="alert">{t('manage.dice.loadError')}</p>
  if (!segment) return <p>{t('manage.dice.segmentNotFound')}</p>
  const scenario = readScenario(segment.periodFacts)
  if (!scenario) return <p>{t('manage.dice.marketUnavailable')}</p>
  return (
    <>
      {error && (
        <div
          role="alert"
          className="mobile:p-app-4 flex flex-wrap items-center gap-[12px] p-[28px]"
        >
          <p className="m-0">{t('manage.dice.refreshError')}</p>
          <Button onClick={() => void queuedRefetch().catch(() => {})}>
            {t('manage.dice.retryLoading')}
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
