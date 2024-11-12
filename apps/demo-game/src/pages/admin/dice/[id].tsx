import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

const Dice = dynamic(() => import('@gbl-uzh/ui').then((mod) => mod.Dice), {
  ssr: false, // Ensure SSR is disabled for this component
})

function Forecast() {
  const router = useRouter()
  // const [dice1, dice2] = ((router.query?.roll?.[0] as string) ?? '').split('-')

  // if (!dice1 || !dice2) return <div>Loading...</div>

  return (
    <div className="pt-8">
      <div className="flex h-full flex-col items-center justify-center">
        <Dice
          dice={[
            { die: 2, faceColor: '#dc6027', dotColor: 'white', label: 'Die Bonds' },
            { die: 3, faceColor: '#32c8dc', dotColor: 'white', label: 'Die Shared'},
            { die: 4, faceColor: '#65a9f7', dotColor: 'white', label: 'Die Stocks' },
          ]}
        />
      </div>

      {/* <div>
        <ProbabilityChart
          trendE={currentGame.activePeriod.facts.trendE}
          trendGap={currentGame.activePeriod.facts.trendGap}
          totalEyes={totalEyes}
        />
      </div> */}
    </div>
  )
}

export default Forecast
