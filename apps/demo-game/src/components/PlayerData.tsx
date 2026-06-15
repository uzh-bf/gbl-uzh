import { useRouter } from 'next/router'

type PlayerAchievement = {
  id: number
  count: number
  achievement: {
    name: string
    reward: {
      xp: number
    }
    image: string
  }
}

type PlayerDataProps = {
  achievements: PlayerAchievement[]
}

function Achievement({
  name,
  xpReward,
  image,
  count,
}: {
  name: string
  xpReward: number
  image: string
  count: number
}) {
  return (
    <div
      className="relative h-10 w-10 rounded border bg-white p-2 shadow md:h-12 md:w-12"
      title={name}
    >
      <img className="h-6 w-6 md:h-8 md:w-8" src={`/${image}`} />
      <div className="absolute bottom-0 right-0 rounded bg-white/90 p-[2px] text-xs text-red-700">
        {xpReward}
      </div>
      {count > 1 && (
        <div className="absolute right-0 top-0 rounded bg-white/90 p-[2px] text-xs text-red-700">
          {count}x
        </div>
      )}
    </div>
  )
}

function PlayerData({ achievements }: PlayerDataProps) {
  const router = useRouter()

  return (
    <div className="flex flex-col gap-2">
      <div
        className="cursor-pointer"
        onClick={() => {
          router.replace('/play/welcome')
        }}
      />

      <div className="flex flex-initial flex-row flex-wrap gap-2">
        {achievements.map((achievement) => (
          <Achievement
            key={achievement.id}
            name={achievement.achievement.name}
            xpReward={achievement.achievement.reward.xp}
            count={achievement.count}
            image={achievement.achievement.image}
          />
        ))}
      </div>
    </div>
  )
}

export default PlayerData
