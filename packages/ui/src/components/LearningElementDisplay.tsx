import { BookOpen, Gem, Info } from 'lucide-react'
import React from 'react'
import Markdown from 'react-markdown'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'

export interface LearningElementOption {
  content: string
}

export interface LearningElementDisplayProps {
  title: string
  question: string
  options: readonly LearningElementOption[] | LearningElementOption[]
  state: 'SOLVED' | 'ATTEMPTED' | 'UNATTEMPTED' | string
  pointsText?: string
  feedback?: string | null
  motivation?: string | null
  activeElements: number[]
  onOptionClick: (index: number) => void
  onSubmit: () => void
  submitButtonText?: string
  loading?: boolean
  returnButton?: React.ReactNode
}

export const LearningElementDisplay: React.FC<LearningElementDisplayProps> = ({
  title,
  question,
  options,
  state,
  pointsText = 'Awards 20XP',
  feedback,
  motivation,
  activeElements,
  onOptionClick,
  onSubmit,
  submitButtonText = 'Submit',
  loading = false,
  returnButton,
}) => {
  const isSolved = state === 'SOLVED'

  return (
    <div className="m-auto flex w-full max-w-5xl flex-col rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div
        className={cn(
          'px-4 py-1.5 text-xs font-bold uppercase tracking-wider',
          isSolved
            ? 'bg-emerald-50 text-emerald-700 border-b border-emerald-100'
            : 'bg-amber-50 text-amber-700 border-b border-amber-100'
        )}
      >
        {state}
      </div>
      <div className="flex flex-col md:flex-row items-start gap-6 border-b border-slate-100 px-6 py-6 md:px-8">
        <div className="flex-1">
          <h1 className="mb-2 text-xl font-semibold text-slate-900">{title}</h1>
          <div className="prose prose-slate max-w-full text-slate-600">
            <Markdown>{question}</Markdown>
          </div>
        </div>
        <div className="flex flex-row md:flex-col items-center md:items-end gap-2 shrink-0 self-stretch md:self-auto justify-between border-t md:border-t-0 pt-4 md:pt-0">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-slate-50 text-slate-400">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="text-sm font-medium text-amber-600">{pointsText}</div>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-8 px-6 py-6 md:px-8">
        <div
          className={cn(
            'flex flex-1 flex-col gap-6',
            isSolved ? 'lg:order-2' : 'lg:order-1'
          )}
        >
          {isSolved && feedback && (
            <div className="flex gap-4 rounded-lg bg-slate-50 p-4 border border-slate-100">
              <Info className="h-5 w-5 mt-0.5 text-slate-400 shrink-0" />
              <div>
                <div className="mb-1 text-sm font-semibold text-slate-800">Explanation</div>
                <div className="prose prose-sm prose-slate text-slate-600">
                  <Markdown>{feedback}</Markdown>
                </div>
              </div>
            </div>
          )}
          {isSolved && motivation && (
            <div className="flex gap-4 rounded-lg bg-amber-50/50 p-4 border border-amber-100/50">
              <Gem className="h-5 w-5 mt-0.5 text-amber-500 shrink-0" />
              <div>
                <div className="mb-1 text-sm font-semibold text-slate-800">Why is it relevant?</div>
                <div className="prose prose-sm prose-slate text-slate-600">
                  <Markdown>{motivation}</Markdown>
                </div>
              </div>
            </div>
          )}
        </div>
        <div
          className={cn(
            'flex w-full lg:w-80 flex-col gap-3',
            isSolved ? 'lg:order-1' : 'lg:order-2'
          )}
        >
          {options.map((option, ix) => {
            const isSelected = activeElements.includes(ix)
            return (
              <button
                key={ix}
                disabled={isSolved || loading}
                onClick={() => onOptionClick(ix)}
                className={cn(
                  'w-full text-left p-4 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2',
                  isSolved
                    ? isSelected
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                    : isSelected
                    ? 'border-amber-500 bg-amber-50/50 text-slate-800 font-medium ring-1 ring-amber-500'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                )}
              >
                <div className="prose prose-sm prose-slate text-current pointer-events-none">
                  <Markdown>{option.content}</Markdown>
                </div>
              </button>
            )
          })}
        </div>
      </div>
      <div className="flex flex-row items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4 md:px-8">
        <div>{returnButton}</div>
        {!isSolved && (
          <Button
            disabled={activeElements.length === 0 || loading}
            onClick={onSubmit}
          >
            {loading ? 'Submitting...' : state === 'ATTEMPTED' ? 'Try Again' : submitButtonText}
          </Button>
        )}
      </div>
    </div>
  )
}
