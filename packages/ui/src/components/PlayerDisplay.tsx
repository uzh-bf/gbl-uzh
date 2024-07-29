import { Progress } from '@uzh-bf/design-system'

import Logo from './Logo'
import Achievement from './Achievement'

interface PlayerDataProps {
  achievements?: any[]
  name?: string
  color?: string
  xp?: number
  level: number
  xpToNext: number
  imgPathAvatar?: string
  imgPathLocation?: string
  location?: string
  onClick?: () => void
}

function PlayerDisplay({
  achievements,
  name,
  color,
  xp,
  level,
  xpToNext,
  imgPathAvatar,
  imgPathLocation,
  location,
  onClick,
}: PlayerDataProps) {
  return (
    <div>
      <div className="flex flex-col gap-2">
        <div className="cursor-pointer" onClick={onClick}>
          <Logo
            color={color}
            name={name}
            imgPathAvatar={imgPathAvatar}
            imgPathLocation={imgPathLocation}
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
          {achievements?.map((achievement) => (
            <Achievement
              key={achievement.achievement.id}
              name={achievement.achievement.name}
              xpReward={achievement.achievement.reward.xp}
              count={achievement.count}
              image={achievement.achievement.image}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default PlayerDisplay
