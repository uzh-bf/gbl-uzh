import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

import GameLayout from '~/components/GameLayout'
import ConsolidationView from '~/components/play/ConsolidationView'
import GameHeader from '~/components/play/GameHeader'
import ResultsView from '~/components/play/ResultsView'
import RunningView, {
  type PortfolioFormValues,
} from '~/components/play/RunningView'
import { getFacts, getNumber } from '~/lib/facts'
import { trpc } from '~/lib/trpc'
import type { RouterOutputs } from '~/server/trpc/router'
import { useToast } from '../../components/ui/use-toast'

type CockpitResult = NonNullable<RouterOutputs['play']['result']>

function Cockpit() {
  const [period, setPeriod] = useState<number | null>(null)

  const utils = trpc.useUtils()
  const { toast } = useToast()

  const { data, isLoading, error } = trpc.play.result.useQuery()

  const performAction = trpc.play.performAction.useMutation({
    async onSuccess() {
      await utils.play.result.invalidate()
    },
    onError: (err) => {
      console.error('Player Cockpit: performAction failed', err)
      toast({
        title: 'Could not submit your decision',
        description: err.message,
        variant: 'destructive',
      })
    },
  })

  const form = useForm<PortfolioFormValues>({
    defaultValues: {
      savings: 0,
      bonds: 0,
      stocks: 0,
    },
  })
  const { watch, reset } = form

  const watchSavings = watch('savings')
  const watchBonds = watch('bonds')
  const watchStocks = watch('stocks')

  const sum = useMemo(() => {
    return (
      Number(watchSavings || 0) +
      Number(watchBonds || 0) +
      Number(watchStocks || 0)
    )
  }, [watchSavings, watchBonds, watchStocks])

  const isSumValid = sum === 100

  const resultFactsForForm = getFacts(data?.playerResult?.facts)
  const resultFactsDecisionsForForm = getFacts(resultFactsForForm.decisions)
  useEffect(() => {
    if (Object.keys(resultFactsDecisionsForForm).length > 0) {
      reset({
        savings: getNumber(resultFactsDecisionsForForm.bank),
        bonds: getNumber(resultFactsDecisionsForForm.bonds),
        stocks: getNumber(resultFactsDecisionsForForm.stocks),
      })
    }
  }, [resultFactsDecisionsForForm, reset])

  useEffect(() => {
    if (data?.currentGame?.periods?.length > 0) {
      setPeriod(data.currentGame.periods.length - 1)
    }
  }, [data?.currentGame?.periods?.length])

  if (isLoading) return null
  if (error) return `Error! ${error}`

  const playerDataResult = data
  if (!playerDataResult) return null
  const currentGame = playerDataResult.currentGame

  switch (currentGame?.status) {
    case 'PREPARATION':
    case 'COMPLETED':
      return (
        <GameLayout>
          <div className="w-full">
            <GameHeader currentGame={currentGame} />
          </div>
        </GameLayout>
      )

    case 'RESULTS':
      return (
        <ResultsView
          currentGame={currentGame}
          playerDataResult={playerDataResult}
        />
      )

    case 'SCHEDULED':
      return (
        <GameLayout>
          <div> Game is scheduled. </div>
        </GameLayout>
      )

    case 'CONSOLIDATION':
    case 'PAUSED':
      return (
        <ConsolidationView
          currentGame={currentGame}
          playerDataResult={playerDataResult}
          period={period}
          setPeriod={setPeriod}
        />
      )

    case 'RUNNING':
      return (
        <RunningView
          currentGame={currentGame}
          playerDataResult={playerDataResult}
          period={period}
          form={form}
          performAction={performAction}
          isSumValid={isSumValid}
          sum={sum}
        />
      )

    default:
      return <div>Game has not been created yet.</div>
  }
}

export default Cockpit
