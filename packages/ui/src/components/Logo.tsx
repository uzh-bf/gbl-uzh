import { faUserSecret } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { COLORS } from '~/lib/constants'
import { twMerge } from 'tailwind-merge'

interface Props {
  color?: string
  avatar?: string
  name?: string
  location?: string
  level?: number
}

function Logo({ color, avatar, name, location, level }: Props) {
  return (
    <div
      className={twMerge(
        'relative p-2 m-auto bg-white border shadow rounded-md',
        color && COLORS[color]
      )}
    >
      {avatar ? (
        <img className="w-full h-auto" src={`/avatars/${avatar}.png`} />
      ) : (
        <FontAwesomeIcon className="w-full h-auto" icon={faUserSecret} />
      )}
      {location && (
        <img
          className="absolute w-1/4 p-1 bg-white rounded-lg shadow left-2 top-2"
          src={`/locations/${location}.svg`}
        />
      )}
      {name && (
        <div className="absolute left-0 right-0 p-1 text-center text-white shadow bg-slate-600 bg-opacity-90 bottom-2">
          <div className="text-sm font-semibold">{name}</div>
          <div className="text-xs">HQ: {location}</div>
        </div>
      )}
      {level && (
        <div className="absolute flex flex-col items-center justify-center w-8 h-8 text-lg font-bold text-white bg-red-500 rounded-full shadow top-2 right-2">
          {level}
        </div>
      )}
    </div>
  )
}

export default Logo
