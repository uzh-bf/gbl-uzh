import { useCallback, useEffect, useRef, type ReactNode } from 'react'
import GameLayout from '~/components/GameLayout'
import AllocationForm from '~/components/cockpit/AllocationForm'
import AllocationSummary from '~/components/cockpit/AllocationSummary'
import PlayerActionButton from '~/components/cockpit/PlayerActionButton'
import ResultPanel from '~/components/cockpit/ResultPanels'
import { useAllocationForm } from '~/components/cockpit/useAllocationForm'
import { useToast } from '~/components/ui/use-toast'
import { parseFacts } from '~/lib/facts'
import { readScenario } from '~/lib/market'
import { buildResultView, readAllocation } from '~/lib/results'
import { trpc } from '~/lib/trpc'
import { ActionTypes } from '~/types/facts'

function Cockpit() {
  const utils = trpc.useUtils()
  // Returning from profile editing must initialize from the latest round
  // and saved allocation, rather than briefly exposing stale cached controls.
  const resultQuery = trpc.play.result.useQuery(undefined, {
    refetchOnMount: 'always',
  })
  const selfQuery = trpc.play.self.useQuery(undefined, {
    refetchOnMount: 'always',
  })
  const data =
    resultQuery.data &&
    selfQuery.data &&
    resultQuery.isFetchedAfterMount &&
    selfQuery.isFetchedAfterMount
      ? { result: resultQuery.data, self: selfQuery.data }
      : undefined
  const error = resultQuery.error ?? selfQuery.error
  const refetch = useCallback(
    () =>
      Promise.all([
        utils.play.result.invalidate(),
        utils.play.self.invalidate(),
      ]),
    [utils]
  )

  const performAction = trpc.play.performAction.useMutation({
    onSuccess: () => refetch(),
  })

  const currentRound = `${data?.result?.currentGame?.id ?? ''}:${data?.result?.currentGame?.activePeriod?.id ?? ''}:${data?.result?.currentGame?.activePeriod?.activeSegment?.id ?? ''}`
  const roundRef = useRef(currentRound)
  useEffect(() => {
    roundRef.current = currentRound
  }, [currentRound])
  const { toast } = useToast()
  const updateReadyState = trpc.play.updateReadyState.useMutation({
    onSuccess: () => refetch(),
  })
  const updatingReady = updateReadyState.isPending
  const playerFacts = parseFacts(data?.result?.playerResult?.facts)
  const allocationController = useAllocationForm(
    readAllocation(playerFacts.decisions) ?? undefined,
    currentRound,
    (values) =>
      performAction.mutateAsync({
        type: ActionTypes.NONE,
        payload: JSON.stringify(values),
      }),
    playerFacts.allocationSubmitted === true,
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
        await updateReadyState.mutateAsync({ isReady })
      } catch {
        if (roundRef.current === changingRound)
          toast({
            title: 'Could not update Ready',
            description: 'Please try again.',
          })
      }
    },
  }

  if (error && !data) return `Error! ${error.message}`
  if (!data) return null

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
      const assets = parseFacts(playerFacts.assets)
      const totalAssets =
        typeof assets.totalAssets === 'number' ? assets.totalAssets : 0
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
            assets={totalAssets}
            scenario={readScenario(currentGame.activePeriod?.facts)}
          />
        ) : (
          <AllocationSummary
            allocation={allocationController.saved}
            assets={totalAssets}
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
