import { Lightbulb } from 'lucide-react'
import React from 'react'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'

export interface LearningActivityItem {
  id: string
  title: string
}

export interface LearningActivitiesListProps {
  openElements: readonly LearningActivityItem[] | LearningActivityItem[]
  completedElements: readonly LearningActivityItem[] | LearningActivityItem[]
  onElementClick: (id: string) => void
  title?: string
  emptyMessage?: string
  className?: string
}

export const LearningActivitiesList: React.FC<LearningActivitiesListProps> = ({
  openElements,
  completedElements,
  onElementClick,
  title = 'Learning Activities',
  emptyMessage = 'No open learning activities',
  className,
}) => {
  const totalCount = openElements.length + completedElements.length

  return (
    <div className={cn('flex flex-col gap-2 text-xs', className)}>
      {title && <h3 className="text-sm font-bold text-slate-800 tracking-tight">{title}</h3>}
      <ul className="flex max-h-48 flex-col gap-1 overflow-y-auto pr-1">
        {totalCount === 0 && (
          <li className="text-slate-400 py-2 italic text-center">{emptyMessage}</li>
        )}
        
        {openElements.map((elem) => (
          <li key={elem.id}>
            <Button
              variant="outline"
              onClick={() => onElementClick(elem.id)}
              className="w-full justify-start text-left font-normal py-1.5 h-auto text-amber-600 hover:text-amber-700 hover:bg-amber-50/50 border-slate-200"
            >
              <Lightbulb className="h-3.5 w-3.5 mr-2 shrink-0 text-amber-500" />
              <span className="truncate">{elem.title}</span>
            </Button>
          </li>
        ))}

        {completedElements.map((elem) => (
          <li key={elem.id}>
            <Button
              variant="ghost"
              onClick={() => onElementClick(elem.id)}
              className="w-full justify-start text-left font-normal py-1.5 h-auto text-slate-500 hover:text-slate-700 hover:bg-slate-50 border border-transparent"
            >
              <Lightbulb className="h-3.5 w-3.5 mr-2 shrink-0 text-slate-400 fill-slate-300" />
              <span className="truncate">{elem.title}</span>
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
