import { Progress } from '@uzh-bf/design-system'

import Logo from '~/components/Logo'

interface AchievementProps {
  name: string
  xpReward: number
  image: string
  count: number
}

interface PlayerDataProps {
  achievements: any[]
  name: string
  color: string
  xp?: number
  level: number
  xpToNext: number
  avatar: string
  location: string
  onClick: () => void
}

function Achievement({ name, xpReward, image, count }: AchievementProps) {
  return (
    <div
      className="relative w-10 h-10 p-2 bg-white border rounded shadow md:w-12 md:h-12"
      title={name}
    >
      <img className="w-6 h-6 md:w-8 md:h-8" src={`/${image}`} />
      <div className="absolute bottom-0 right-0 p-[2px] text-xs text-red-700 bg-white bg-opacity-90 rounded">
        {xpReward}
      </div>
      {count > 1 && (
        <div className="absolute top-0 right-0 p-[2px] text-xs text-red-700 bg-white bg-opacity-90 rounded">
          {count}x
        </div>
      )}
    </div>
  )
}

function PlayerDisplay({
  achievements,
  name,
  color,
  xp,
  level,
  xpToNext,
  avatar,
  location,
  onClick,
}: PlayerDataProps) {
  return (
    <div>
      <div className="flex flex-col gap-2">
        <div className="cursor-pointer" onClick={onClick}>
          <Logo
            color={color}
            avatar={avatar}
            name={name}
            location={location}
            level={level}
          />
        </div>

        <Progress
          value={xp ?? 0}
          max={xpToNext}
          formatter={(val) => `${val}XP`}
        />

        <div className="flex flex-row flex-wrap flex-initial gap-2">
          {achievements.map((achievement) => (
            <Achievement
              key={achievement.achievement.id}
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

export default PlayerDisplay
