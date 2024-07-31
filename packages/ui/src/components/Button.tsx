import { cn } from '~/lib/utils'

function Button({ className }: { className?: string }) {
  return <button className={cn(className)}>hello world</button>
}

export { Button }
