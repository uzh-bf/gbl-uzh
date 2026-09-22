import { useMutation, useQuery } from '@apollo/client'
import { useEffect, useRef } from 'react'
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

  switch (currentGame?.status) {
    case 'PREPARATION':
    case 'COMPLETED':
      return (
        <GameLayout
          data={data}
          refetchResult={refetch}
          readyControl={readyControl}
        >
          <div className="w-full">
            <div className="font-semibold">
              {currentGame.status === 'PREPARATION'
                ? 'Preparing the next year'
                : 'Game completed'}
            </div>
          </div>
        </GameLayout>
      )

    case 'SCHEDULED':
      return (
        <GameLayout
          data={data}
          refetchResult={refetch}
          readyControl={readyControl}
        >
          <div>Game is scheduled.</div>
        </GameLayout>
      )

    case 'PAUSED':
    case 'CONSOLIDATION':
    case 'RESULTS': {
      const resultView = buildResultView(data)
      return (
        <GameLayout
          data={data}
          refetchResult={refetch}
          readyControl={readyControl}
          resultView={resultView}
        >
          <ResultPanel view={resultView} />
        </GameLayout>
      )
    }

    case 'RUNNING': {
      const resultFacts = playerDataResult.playerResult?.facts
      const { view, form } = allocationController
      return (
        <GameLayout
          data={data}
          refetchResult={refetch}
          readyControl={readyControl}
          action={
            view === 'editing' ? (
              <PlayerActionButton
                key="submit-allocation"
                type="submit"
                form="allocation-form"
                disabled={
                  !allocationController.valid ||
                  form.isSubmitting ||
                  updatingReady
                }
              >
                {form.isSubmitting ? 'Submitting…' : 'Submit allocation'}
              </PlayerActionButton>
            ) : (
              <PlayerActionButton
                key="change-allocation"
                type="button"
                variant="secondary"
                disabled={
                  view === 'ready' || form.isSubmitting || updatingReady
                }
                onClick={allocationController.beginEditing}
              >
                Change allocation
              </PlayerActionButton>
            )
          }
        >
          {view === 'editing' ? (
            <AllocationForm
              controller={allocationController}
              disabled={updatingReady}
              assets={resultFacts?.assets?.totalAssets ?? 0}
              scenario={currentGame.activePeriod?.facts?.scenario}
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
          )}
        </GameLayout>
      )
    }

    default:
      return <div>Game has not been created yet.</div>
  }
}

export default Cockpit
