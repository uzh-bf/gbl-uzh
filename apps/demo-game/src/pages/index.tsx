import {
  Layout,
  PlayerDisplay,
  ProbabilityChart,
  StorageOverview,
  Timeline,
  TimelineEntry,
  TradingForm,
} from '@gbl-uzh/ui'

import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()
  return (
    <div>
      <Layout>
        <div className="w-full rounded bg-black"></div>
      </Layout>
      <div className="font-source-sans p-4">
        hello world
        {/* <Button /> */}
        {/* <Dice dice1={'dice1'} dice2={'dice2'} /> */}
        {/* <Progress value={50} max={100} formatter={(val) => `${val}XP`} /> */}
        <div className="flex w-1/3 flex-col">
          <PlayerDisplay
            name={'playerName'}
            imgPathAvatar={'/avatars/avatar_placeholder.png'}
            color={'Red'}
            achievements={[]}
            imgPathLocation={'/locations/ZH.svg'}
            location={'ZH'}
            xp={20}
            xpMax={50}
            level={1}
            onClick={() => {
              router.replace('/play/welcome')
            }}
          />
          <StorageOverview
            storageTotal={3}
            storageUsed={1}
            imgPathEmpty={'/avatars/cocoa_0.png'}
            imgPathFull={'/avatars/cocoa_3.png'}
          />
        </div>
        <ProbabilityChart trendE={5} trendGap={8} totalEyes={'12'} />
        <TimelineEntry
          periodIx={1}
          segmentIx={1}
          isCurrentEntry={true}
          isPastEntry={false}
          gameStatus={'PERIOD_END'}
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
          nameButtonA={'Buy'}
          nameButtonB={'Sell'}
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
      </div>
    </div>
  )
}
