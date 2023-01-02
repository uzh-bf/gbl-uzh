import {
  Player
} from '@gbl-uzh/platform/dist/generated/ops'

import {
    faCheck,
    faPause,
    faPlus,
    faSnowboarding,
    faSync,
  } from '@fortawesome/free-solid-svg-icons'
  import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import Link from 'next/link'

function PlayerCompact({player} : {player : Player}){
  console.log(player);
  return (
    <div className="flex flex-row items-end gap-4 py-1 border-b last:border-0">
      <img width="20px" src={`/avatars/${player.avatar}.png`} />
      <div>
        {player.isReady ? (
          <FontAwesomeIcon icon={faCheck} />
        ) : (
          <FontAwesomeIcon icon={faSnowboarding} />
        )}
      </div>
      <div>{player.role}</div>
      <div>{player.name}</div>
      <Link
        href={`/join/${player.token}`}
        target="_blank"
        className="text-red-400"
      >
        Login
      </Link>
    </div>
  )
}

export default PlayerCompact