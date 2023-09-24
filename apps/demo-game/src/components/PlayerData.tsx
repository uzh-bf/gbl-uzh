import { useRouter } from 'next/router'
import { Achievement, Player } from 'src/graphql/generated/ops'

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
      <div className="absolute bottom-0 right-0 rounded bg-white bg-opacity-90 p-[2px] text-xs text-red-700">
        {xpReward}
      </div>
      {count > 1 && (
        <div className="absolute right-0 top-0 rounded bg-white bg-opacity-90 p-[2px] text-xs text-red-700">
          {count}x
        </div>
      )}
    </div>
  )
}

function PlayerData({
  achievements,
  name,
  color,
  level,
  avatar,
  location,
}: Player) {
  const router = useRouter()

  return (
    <div>
      <div className="flex flex-col gap-2">
        <div
          className="cursor-pointer"
          onClick={() => {
            router.replace('/play/welcome')
          }}
        >
          {/*<Logo
            color={color}
            avatar={avatar}
            name={name}
            location={location}
            level={level}
          />?*/}
        </div>

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

        {/* <div>
            <div className="p-2 text-sm bg-orange-400 border rounded w-28">
              5% Storage Cost
            </div>
          </div> */}
      </div>
    </div>
  )
}

export default PlayerData
