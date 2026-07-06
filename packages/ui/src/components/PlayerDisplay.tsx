import { Logo } from './Logo'
import { Achievement } from './Achievement'
import { Button } from '@uzh-bf/design-system'

export interface PlayerDisplayProps {
  name?: string
  color?: string
  level: number
  location?: string
  achievements?: {
    id: number
    count: number
    achievement: {
      id: string | number
      name: string
      description: string
      image?: string | null
      reward?: { xp?: number } | null
    }
  }[]
  imgPathAvatar?: string
  imgPathLocation?: string
  onClick?: () => void
}

function PlayerDisplay({
  name,
  color,
  level,
  location,
  achievements,
  imgPathAvatar,
  imgPathLocation,
  onClick,
}: PlayerDisplayProps) {
  return (
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

      <div className="flex flex-row flex-wrap flex-initial gap-2">
        {achievements?.map((achievement) => (
          <Achievement
            key={achievement.achievement.id}
            name={achievement.achievement.name}
            xpReward={achievement.achievement.reward?.xp ?? 0}
            count={achievement.count}
            image={achievement.achievement.image ?? ''}
          />
        ))}
      </div>
    </div>
  )
}

export { PlayerDisplay }
