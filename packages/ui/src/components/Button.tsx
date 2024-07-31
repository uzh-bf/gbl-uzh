import { cn } from '~/lib/utils'

function Button({ className }: { className?: string }) {
  return (
    <button className={cn(className, 'bg-fuchsia-500')}>hello world</button>
  )
}

export { Button }
