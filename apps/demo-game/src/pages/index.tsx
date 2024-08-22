// import { useQuery } from '@apollo/client'
import { faStar } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  Layout,
  ProbabilityChart,
  StorageOverview,
  Timeline,
  TimelineAdmin,
  TimelineEntry,
  TradingForm,
} from '@gbl-uzh/ui'
// import { ResultDocument } from 'src/graphql/generated/ops'

import { useRouter } from 'next/router'

export default function Home() {
  // const { data, loading, error } = useQuery(ResultDocument, {
  //   fetchPolicy: 'cache-first',
  // })

  // if (loading) return <div>Loading...</div>
  // if (error) return <div>Error {error.message}</div>
  // console.log(data)

  const router = useRouter()
  const tabs = [
    { name: 'Welcome', href: '/play/welcome' },
    { name: 'Cockpit', href: '/play/cockpit' },
  ]
  const playerInfo = {
    name: 'playerName',
    color: 'Red',
    location: 'ZH',
    level: 1,
    xp: 20,
    xpMax: 50,
    achievements: [],
    imgPathAvatar: '/avatars/avatar_placeholder.png',
    imgPathLocation: '/locations/ZH.svg',
    onClick: () => {
      router.replace('/play/welcome')
    },
  }
  const storageInfo = {
    storageTotal: 3,
    storageUsed: 1,
    icon: <FontAwesomeIcon icon={faStar} />,
    // icon: <img src={'/cocoa_1.png'} />,
  }
  return (
    <div>
      <Layout
        tabs={tabs}
        playerInfo={playerInfo}
        sidebar={<StorageOverview {...storageInfo} />}
      >
        <div className="w-full rounded bg-black"></div>
      </Layout>
      <div className="font-source-sans p-4">
        hello world
        {/* <Dice dice1={6} dice2={6} /> */}
        {/* <Progress value={50} max={100} formatter={(val) => `${val}XP`} /> */}
        <ProbabilityChart trendE={5} trendGap={8} totalEyes={'12'} />
        <TimelineEntry
          periodIx={1}
          segmentIx={1}
          numSegments={2}
          gameStatus="PERIOD_END"
          entryStatus="CURRENT"
        >
          <div>Child</div>
        </TimelineEntry>
        <Timeline
          // NOTE(JJ): Check the prisma schema what Period includes
          periods={[
            {
              segments: [
                {
                  index: 0,
                  facts: {
                    cashBalance: 3,
                    storageAmount: 6,
                    spotPrice: 1,
                    futuresPrice: 1,
                  },
                },
                {
                  index: 1,
                  facts: {
                    cashBalance: 3,
                    storageAmount: 6,
                    spotPrice: 2,
                    futuresPrice: 3,
                  },
                },
              ],
              segmentCount: 2,
              index: 0,
              facts: {
                cashBalance: 3,
                storageAmount: 6,
                spotPrice: 2,
                futuresPrice: 2,
              },
            },
          ]}
          entries={[
            {
              id: 0,
              type: 'PERIOD_START',
              period: { id: 0, index: 0 },
              segment: { id: 0, index: 0 },
              facts: {
                finalSpotPrice: 9,
              },
            },
            {
              id: 1,
              type: 'SEGMENT_START',
              period: { id: 0, index: 0 },
              segment: { id: 0, index: 0 },
              facts: {
                finalSpotPrice: 9,
              },
            },
            {
              id: 2,
              type: 'SEGMENT_END',
              period: { id: 0, index: 0 },
              segment: { id: 0, index: 0 },
              facts: {
                finalSpotPrice: 9,
              },
            },
            {
              id: 3,
              type: 'SEGMENT_START',
              period: { id: 0, index: 0 },
              segment: { id: 1, index: 1 },
              facts: {
                finalSpotPrice: 9,
              },
            },
            {
              id: 4,
              type: 'SEGMENT_END',
              period: { id: 0, index: 0 },
              segment: { id: 1, index: 1 },
              facts: {
                finalSpotPrice: 9,
              },
            },
          ]}
          activePeriodIx={0}
          activeSegmentIx={0}
          formatter={(current, prev) => {
            // Do computation here
            const spotPrice =
              current.segmentFlat?.facts.spotPrice ??
              current.facts.finalSpotPrice
            const futuresPrice =
              current.segmentFlat?.facts.futuresPrice ??
              current.facts.finalSpotPrice

            const spotPriceDelta =
              prev?.segmentFlat?.facts.spotPrice &&
              (spotPrice / prev.segmentFlat.facts.spotPrice - 1) * 100

            const futuresPriceDelta =
              prev?.segmentFlat?.facts.futuresPrice &&
              (futuresPrice / prev.segmentFlat.facts.futuresPrice - 1) * 100
            return (
              <>
                {spotPriceDelta && <div>S {spotPriceDelta}</div>}
                {futuresPriceDelta && <div>F {futuresPriceDelta}</div>}
              </>
            )
          }}
        />
        <TradingForm
          price={10}
          nameButtonBuy="Buy"
          nameButtonSell="Sell"
          max={10}
          onSubmit={async (values, helpers) => {
            console.log(values)
            // await performAction({
            //   variables: {
            //     type: ActionTypes.SPOT_TRADE,
            //     payload: JSON.stringify({
            //       volume: values.modifier * Number(values.volume),
            //     }),
            //   },
            // })
            helpers.resetForm()
          }}
        />
        <TimelineAdmin />
      </div>
    </div>
  )
}
