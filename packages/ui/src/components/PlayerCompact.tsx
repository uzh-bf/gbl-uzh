import { faCheck, faSnowboarding } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'

export interface PlayerCompactData {
  name: string
  role?: string | null
  token?: string | null
  isReady?: boolean | null
  facts?: {
    avatar?: string | null
  } | null
}

export interface PlayerCompactProps {
  player: PlayerCompactData
}

export function PlayerCompact({ player }: PlayerCompactProps) {
  const avatar = player.facts?.avatar || '/avatars/avatar_placeholder.png'
  const role = player.role || 'Player'
  const token = player.token || ''

  return (
    <div className="flex w-4/5 flex-col border-b py-1 last:border-0">
      <div className="flex justify-between">
        <div>{player.name}</div>
        <img width="20px" src={avatar} alt={`${player.name} avatar`} />
      </div>
      <div className="flex justify-between mt-1">
        <div className="flex flex-col justify-between text-[length:var(--gbl-caption-size,0.875rem)] leading-[var(--gbl-caption-leading,1.25rem)]">
          <div>{role}</div>
          {token && (
            <Link
              href={`/join/${token}`}
              target="_blank"
              className="text-red-400 font-medium hover:underline [display:var(--gbl-link-display,inline)] min-h-[var(--gbl-control-height,0px)] items-center"
              data-cy="player-login-link"
            >
              Login
            </Link>
          )}
        </div>
        <div className="flex items-center text-slate-500">
          {player.isReady ? (
            <FontAwesomeIcon icon={faCheck} className="text-emerald-500" />
          ) : (
            <FontAwesomeIcon icon={faSnowboarding} className="text-slate-400" />
          )}
        </div>
      </div>
    </div>
  )
}
