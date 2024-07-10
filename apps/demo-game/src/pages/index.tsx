import { PlayerDisplay } from '@gbl-uzh/ui'
import { Progress } from '@uzh-bf/design-system'
import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()
  return (
    <div className="font-source-sans p-4">
      hello world
      {/* <Button /> */}
      {/* <Dice dice1={'dice1'} dice2={'dice2'} /> */}
      <Progress value={50} max={100} formatter={(val) => `${val}XP`} />
      <PlayerDisplay
        name={'playerName'}
        avatar={''}
        color={'Red'}
        achievements={[]}
        location={'playerFactsLocation'}
        xp={20}
        xpToNext={50}
        level={1}
        onClick={() => {
          router.replace('/play/welcome')
        }}
      />
    </div>
  )
}
