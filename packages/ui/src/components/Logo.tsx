import { faUserSecret } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { COLORS } from '~/lib/constants'
import { twMerge } from 'tailwind-merge'

interface Props {
  color?: string
  name?: string
  imgPathAvatar?: string
  imgPathLocation?: string
  location?: string
  level?: number
}

function Logo({
  color,
  name,
  imgPathAvatar,
  imgPathLocation,
  location,
  level,
}: Props) {
  return (
    <div
      className={twMerge(
        'relative p-2 m-auto bg-white rounded',
        color && COLORS[color]
      )}
    >
      {imgPathAvatar ? (
        <img className="w-full h-auto" src={imgPathAvatar} />
      ) : (
        <FontAwesomeIcon className="w-full h-auto" icon={faUserSecret} />
      )}
      {imgPathLocation && (
        <img
          className="absolute w-1/4 p-1 bg-white rounded shadow left-2 top-2"
          src={imgPathLocation}
        />
      )}
      {name && (
        <div className="absolute left-0 right-0 p-1 text-center text-white shadow bg-slate-600 bg-opacity-90 bottom-2">
          <div className="text-sm font-semibold">{name}</div>
          {location && <div className="text-xs">HQ: {location}</div>}
        </div>
      )}
      {typeof level == 'number' && (
        <div className="absolute flex flex-col items-center justify-center w-8 h-8 text-lg font-bold text-white bg-red-500 rounded-full shadow top-2 right-2">
          {level}
        </div>
      )}
    </div>
  )
}

export default Logo
