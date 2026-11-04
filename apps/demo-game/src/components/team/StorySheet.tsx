import { cn } from '@gbl-uzh/ui'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import Markdown from 'react-markdown'
import { contentText } from '~/i18n/content'
import { useLanguage } from '~/i18n/Language'
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
  const t = useTranslations()
  const { language } = useLanguage()
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
  const title = contentText(language, 'story', story.id, 'title', story.title)
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
      title={title}
      label={t('player.story.context', {
        year: sequence.year,
        quarter: sequence.quarter,
      })}
      onClose={close}
      footer={
        <>
          <SheetTextButton onClick={close}>
            {automatic ? t('player.story.skip') : t('shared.actions.close')}
          </SheetTextButton>
          <PlayerActionButton
            onClick={next}
            disabled={saving}
            className="min-[641px]:min-h-[88px] min-[641px]:text-[32px]"
          >
            {saving ? t('player.story.saving') : t('player.story.continue')}
          </PlayerActionButton>
        </>
      }
    >
      <h2
        data-cy="content-sheet-heading"
        className={`mobile:pb-app-4 mobile:app-heading tablet:app-heading tablet:pb-app-3 m-0 pb-[20px] text-[24px] leading-[1.25] font-bold min-[641px]:pb-[32px] min-[641px]:text-[36px] ${sheetPadding}`}
      >
        {title}
      </h2>
      <div
        className={`border-player-border mobile:gap-app-3 mobile:py-app-4 tablet:py-app-3 flex flex-wrap items-center justify-between gap-[12px] border-y py-[16px] min-[641px]:py-[24px] ${sheetPadding}`}
      >
        <span className="mobile:app-body tablet:app-caption font-semibold min-[641px]:text-[26px]">
          {t('player.story.card')} {index + 1} {t('player.story.of')}{' '}
          {sequence.stories.length}
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
              ? story.type === 'ROLE_BASED'
                ? content
                : contentText(language, 'story', story.id, 'content', content)
              : t('player.story.noRoleContent')}
          </Markdown>
        </div>
        {error && (
          <p
            role="alert"
            className="text-player-error mobile:app-body tablet:app-body min-[641px]:text-[24px]"
          >
            {t('player.story.saveError')}
          </p>
        )}
      </div>
    </ContentSheet>
  )
}
