import {
  PlayerDisplay,
  ProbabilityChart,
  StorageOverview,
  Timeline,
  TimelineEntry,
} from '@gbl-uzh/ui'
import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()
  return (
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
        type={'PERIOD_END'}
        cashBalance={1}
        storageAmount={1}
      />
      <Timeline
        periods={[
          {
            segments: [{ index: 0 }],
            index: 0,
            facts: {
              cashBalance: 1,
              storageAmount: 1,
              finalSpotprice: 1,
            },
          },
        ]}
        entries={[{ type: 'PERIOD_START', period: { index: 0 }, segment: {} }]}
        activePeriodIx={0}
        activeSegmentIx={0}
      />
    </div>
  )
}
