import { cn } from '@gbl-uzh/ui'
import { useEffect, useRef, useState } from 'react'
import Markdown from 'react-markdown'
import type { StorySequence } from '~/lib/team'
import PlayerActionButton from '../cockpit/PlayerActionButton'
import ContentSheet, {
  contentProse,
  sheetPadding,
  SheetTextButton,
} from './ContentSheet'

export default function StorySheet({
  sequence,
  startIndex,
  automatic,
  visitedIds,
  role,
  onMark,
  onClose,
}: {
  sequence: StorySequence
  startIndex: number
  automatic: boolean
  visitedIds: readonly string[]
  role?: string
  onMark: (id: string) => Promise<void>
  onClose: () => void
}) {
  const [index, setIndex] = useState(startIndex)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(false)
  const request = useRef(0)
  useEffect(
    () => () => {
      request.current++
    },
    []
  )
  const story = sequence.stories[index]
  const content =
    story.type === 'ROLE_BASED' ? story.contentRole?.[role] : story.content
  const close = () => {
    request.current++
    onClose()
  }
  const next = async () => {
    if (saving) return
    const ticket = ++request.current
    setSaving(true)
    setError(false)
    try {
      if (!visitedIds.includes(story.id)) await onMark(story.id)
      if (ticket !== request.current) return
      const nextIndex = sequence.stories.findIndex(
        (candidate, ix) =>
          ix > index && (!automatic || !visitedIds.includes(candidate.id))
      )
      if (nextIndex < 0) onClose()
      else setIndex(nextIndex)
    } catch {
      if (ticket === request.current) setError(true)
    } finally {
      if (ticket === request.current) setSaving(false)
    }
  }
  return (
    <ContentSheet
      title={story.title}
      label={`Story element · ${sequence.year} · Quarter ${sequence.quarter}`}
      onClose={close}
      footer={
        <>
          <SheetTextButton onClick={close}>
            {automatic ? 'Skip stories' : 'Close'}
          </SheetTextButton>
          <PlayerActionButton
            onClick={next}
            disabled={saving}
            className="min-[641px]:min-h-[88px] min-[641px]:text-[32px]"
          >
            {saving ? 'Saving…' : 'Continue'}
          </PlayerActionButton>
        </>
      }
    >
      <h2
        data-cy="content-sheet-heading"
        className={`mobile:pb-app-4 mobile:app-heading tablet:app-heading tablet:pb-app-3 m-0 pb-[20px] text-[24px] leading-[1.25] font-bold min-[641px]:pb-[32px] min-[641px]:text-[36px] ${sheetPadding}`}
      >
        {story.title}
      </h2>
      <div
        className={`border-player-border mobile:gap-app-3 mobile:py-app-4 tablet:py-app-3 flex flex-wrap items-center justify-between gap-[12px] border-y py-[16px] min-[641px]:py-[24px] ${sheetPadding}`}
      >
        <span className="mobile:app-body tablet:app-caption font-semibold min-[641px]:text-[26px]">
          Card {index + 1} of {sequence.stories.length}
        </span>
        <div
          className="mobile:gap-app-2 flex max-w-[50%] flex-wrap gap-[8px]"
          aria-hidden="true"
        >
          {sequence.stories.map((item, ix) => (
            <span
              key={item.id}
              className={cn(
                'tablet:h-[8px] tablet:w-[24px] h-[8px] w-[24px] rounded-full min-[641px]:h-[12px] min-[641px]:w-[48px]',
                ix === index
                  ? 'bg-player-primary'
                  : visitedIds.includes(item.id)
                    ? 'bg-player-progress-done'
                    : 'bg-player-progress'
              )}
            />
          ))}
        </div>
      </div>
      <div
        key={story.id}
        className={`mobile:py-app-4 tablet:py-app-3 py-[16px] min-[641px]:py-[24px] ${sheetPadding}`}
      >
        <div className={contentProse}>
          <Markdown>
            {typeof content === 'string' && content.trim()
              ? content
              : 'No story content is available for your role.'}
          </Markdown>
        </div>
        {error && (
          <p
            role="alert"
            className="text-player-error mobile:app-body tablet:app-body min-[641px]:text-[24px]"
          >
            Could not save your progress. Select Continue to try again.
          </p>
        )}
      </div>
    </ContentSheet>
  )
}
