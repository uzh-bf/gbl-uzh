import { useMutation, useQuery } from '@apollo/client'
import { useEffect, useRef, type ReactNode } from 'react'
import {
  PerformActionDocument,
  ResultDocument,
  UpdateReadyStateDocument,
} from 'src/graphql/generated/ops'
import GameLayout from '~/components/GameLayout'
import AllocationForm from '~/components/cockpit/AllocationForm'
import AllocationSummary from '~/components/cockpit/AllocationSummary'
import PlayerActionButton from '~/components/cockpit/PlayerActionButton'
import ResultPanel from '~/components/cockpit/ResultPanels'
import { useAllocationForm } from '~/components/cockpit/useAllocationForm'
import { useToast } from '~/components/ui/use-toast'
import { readScenario } from '~/lib/market'
import { buildResultView } from '~/lib/results'

function Cockpit() {
  const { loading, error, data, refetch } = useQuery(ResultDocument, {
    fetchPolicy: 'cache-and-network',
  })

  const [performAction] = useMutation(PerformActionDocument, {
    refetchQueries: [ResultDocument],
    awaitRefetchQueries: true,
  })

  const currentRound = `${data?.result?.currentGame?.id ?? ''}:${data?.result?.currentGame?.activePeriod?.id ?? ''}:${data?.result?.currentGame?.activePeriod?.activeSegment?.id ?? ''}`
  const roundRef = useRef(currentRound)
  useEffect(() => {
    roundRef.current = currentRound
  }, [currentRound])
  const { toast } = useToast()
  const [updateReadyState, { loading: updatingReady }] = useMutation(
    UpdateReadyStateDocument,
    {
      refetchQueries: [ResultDocument],
      awaitRefetchQueries: true,
    }
  )
  const allocationController = useAllocationForm(
    data?.result?.playerResult?.facts?.decisions,
    currentRound,
    (values) =>
      performAction({
        variables: { type: '', payload: JSON.stringify(values) },
      }),
    data?.result?.playerResult?.facts?.allocationSubmitted === true,
    data?.self?.isReady === true
  )

  const readyControl = {
    disabled:
      updatingReady ||
      allocationController.form.isSubmitting ||
      (data?.result?.currentGame?.status === 'RUNNING' &&
        allocationController.view === 'editing'),
    onChange: async (isReady: boolean) => {
      const changingRound = currentRound
      try {
        await updateReadyState({ variables: { isReady } })
      } catch {
        if (roundRef.current === changingRound)
          toast({
            title: 'Could not update Ready',
            description: 'Please try again.',
          })
      }
    },
  }

  if (loading && !data) return null
  if (error && !data) return `Error! ${error}`

  const playerDataResult = data.result
  if (!playerDataResult) return null
  const currentGame = playerDataResult.currentGame

  const resultView = buildResultView(data)
  let body: ReactNode
  let action: ReactNode

  switch (currentGame?.status) {
    case 'PREPARATION':
    case 'COMPLETED':
      body = (
        <div className="w-full">
          <div className="font-semibold">
            {currentGame.status === 'PREPARATION'
              ? 'Preparing the next year'
              : 'Game completed'}
          </div>
        </div>
      )
      break
    case 'SCHEDULED':
      body = <div>Game is scheduled.</div>
      break
    case 'PAUSED':
    case 'CONSOLIDATION':
    case 'RESULTS':
      body = <ResultPanel view={resultView} />
      break
    case 'RUNNING': {
      const resultFacts = playerDataResult.playerResult?.facts
      const { view, form } = allocationController
      action =
        view === 'editing' ? (
          <PlayerActionButton
            key="submit-allocation"
            type="submit"
            form="allocation-form"
            disabled={
              !allocationController.valid || form.isSubmitting || updatingReady
            }
          >
            {form.isSubmitting ? 'Submitting…' : 'Submit allocation'}
          </PlayerActionButton>
        ) : (
          <PlayerActionButton
            key="change-allocation"
            type="button"
            variant="secondary"
            disabled={view === 'ready' || form.isSubmitting || updatingReady}
            onClick={allocationController.beginEditing}
          >
            Change allocation
          </PlayerActionButton>
        )
      body =
        view === 'editing' ? (
          <AllocationForm
            controller={allocationController}
            disabled={updatingReady}
            assets={resultFacts?.assets?.totalAssets ?? 0}
            scenario={readScenario(currentGame.activePeriod?.facts)}
          />
        ) : (
          <AllocationSummary
            allocation={allocationController.saved}
            assets={resultFacts?.assets?.totalAssets ?? 0}
            quarterNumber={
              (currentGame.activePeriod?.activeSegment?.index ?? 0) + 1
            }
            ready={view === 'ready'}
          />
        )
      break
    }
    default:
      return <div>Game has not been created yet.</div>
  }

  return (
    <GameLayout
      data={data}
      refetchResult={refetch}
      readyControl={readyControl}
      resultView={resultView}
      action={action}
    >
      {body}
    </GameLayout>
  )
}

export default Cockpit
