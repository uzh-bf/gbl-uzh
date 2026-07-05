import { HelpCircle } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { cn } from '~/lib/utils'

interface HelpTooltipProps {
  content: string
  className?: string
}

export function HelpTooltip({ content, className }: HelpTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle 
          className={cn("h-4 w-4 text-muted-foreground cursor-help", className)} 
          aria-label="Help information"
        />
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs">{content}</p>
      </TooltipContent>
    </Tooltip>
  )
}