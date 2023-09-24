import { twMerge } from 'tailwind-merge'

interface Props {
  children: React.ReactNode
  className?: string
}

function Content({ className, children }: Props) {
  return (
    <div className={twMerge('m-auto max-w-6xl p-4 md:pt-8', className)}>
      {children}
    </div>
  )
}

export default Content
