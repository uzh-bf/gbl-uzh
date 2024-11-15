import * as Avatar from '@radix-ui/react-avatar'
import { useField } from 'formik'
import { range } from 'ramda'
import { useContext } from 'react'
// import { PlayerContext } from 'src/components/layouts/GameLayout'
import { COLORS, AVATARS } from 'src/lib/constants'
// import { PlayerRole } from 'src/types/app'
import { twMerge } from 'tailwind-merge'


interface Props {
  color?: string
  name: string
  label?: string
  className?: string
}

function LogoSelector({ color, label, className, ...props }: Props) {
  const [field, meta, { setValue }] = useField(props)

  const computedClassName = twMerge('', className)

  return (
    <div className={computedClassName}>
      {label && (
        <label htmlFor="avatarSelection" className="font-bold">
          {label}
        </label>
      )}
      <div className="mt-1 grid grid-cols-4 gap-2">
        {Object.entries(AVATARS).map(([key, src]) => {
          return (
            <Avatar.Root
              key={key}
              className={twMerge(
                'flex-1 cursor-pointer rounded border border-slate-500 p-1 hover:border-red-800 hover:shadow',
                // key === field.value && 'border-red-800',
                // color && COLORS[color]
              )}
              onClick={() => setValue(src)}
            >
              <Avatar.Image src={src} alt={key} />
            </Avatar.Root>
          )
        })}
        
      </div>
    </div>
  )
}

export default LogoSelector
