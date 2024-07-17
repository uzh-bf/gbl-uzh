import { Player } from 'src/graphql/generated/ops'

import { faCheck, faSnowboarding } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import Link from 'next/link'

// TODO(JJ):
// Move this to ui package when checking with RS, also about Link in ui
function PlayerCompact({ player }: { player: Player }) {
  return (
    <div className="flex w-4/5 flex-col border-b py-1 last:border-0">
      <div className="flex justify-between">
        <div>{player.name}</div>
        <img width="20px" src={`/avatars/${player.avatar}.png`} />
      </div>
      <div className="flex justify-between">
        <div className="flex flex-col justify-between text-sm">
          <div>{player.role}</div>
          <Link
            href={`/join/${player.token}`}
            target="_blank"
            className="text-red-400"
          >
            Login
          </Link>
        </div>
        <div>
          {player.isReady ? (
            <FontAwesomeIcon icon={faCheck} />
          ) : (
            <FontAwesomeIcon icon={faSnowboarding} />
          )}
        </div>
      </div>
    </div>
  )
}

export default PlayerCompact
