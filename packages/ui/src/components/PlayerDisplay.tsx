import Logo from './Logo'
import Achievement from './Achievement'
import XpBar from './XpBar'

interface PlayerDataProps {
  achievements?: any[]
  name?: string
  color?: string
  xp?: number
  xpMax: number
  level: number
  imgPathAvatar?: string
  imgPathLocation?: string
  location?: string
  onClick?: () => void
}

// TODO(JJ): Discuss with RS
// - Instead of having an onClick, provide only a href with a Link component
function PlayerDisplay({
  achievements,
  name,
  color,
  xp,
  xpMax,
  level,
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

export default PlayerDisplay
