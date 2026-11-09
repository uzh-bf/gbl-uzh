import { HelpCircle } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { cn } from '~/lib/utils'

interface HelpTooltipProps {
  label?: string
  content: string
  className?: string
}

export function HelpTooltip({ content, className, label = 'Help information' }: HelpTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle
          className={cn('h-4 w-4 text-muted-foreground cursor-help', className)}
          aria-label={label}
        />
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs">{content}</p>
      </TooltipContent>
    </Tooltip>
  )
}
