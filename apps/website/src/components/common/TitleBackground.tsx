import { twMerge } from 'tailwind-merge'

interface Props {
  children: React.ReactNode
  className?: string
}

function TitleBackground({ children, className }: Props) {
  return (
    <div className={twMerge('w-full bg-slate-100 shadow', className || 'p-4')}>
      {children}
    </div>
  )
}

TitleBackground.defaultProps = {
  className: undefined,
}

export default TitleBackground
