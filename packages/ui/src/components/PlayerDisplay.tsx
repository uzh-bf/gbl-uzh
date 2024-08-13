import { Logo } from './Logo'
import { Achievement } from './Achievement'
import { XpBar } from './XpBar'
import { Button } from '@uzh-bf/design-system'

interface PlayerDataProps {
  name?: string
  color?: string
  xp?: number
  xpMax: number
  level: number
  location?: string
  achievements?: {
    id: number
    count: number
    achievement: {
      id: number
      name: string
      descpription: string
      image: string
      reward?: any
    }
  }[]
  imgPathAvatar?: string
  imgPathLocation?: string
  onClick?: () => void
}

// TODO(JJ):
// - Change basic styling of button

function PlayerDisplay({
  name,
  color,
  xp,
  xpMax,
  level,
  location,
  achievements,
  imgPathAvatar,
  imgPathLocation,
  onClick,
}: PlayerDataProps) {
  return (
    <div>
      <div className="flex flex-col gap-2">
        <Button basic onClick={onClick}>
          <Logo
            color={color}
            name={name}
            imgPathAvatar={imgPathAvatar}
            imgPathLocation={imgPathLocation}
            location={location}
            level={level}
          />
        </Button>

        <XpBar value={xp ?? 0} max={xpMax} />

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

export { PlayerDisplay }
