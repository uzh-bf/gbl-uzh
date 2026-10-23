import { cn } from '@gbl-uzh/ui'
import Markdown from 'react-markdown'
import type { LearningElementQuery } from '~/graphql/generated/ops'
import { learningXP } from '~/lib/team'
import CompactCountdown from '../cockpit/CompactCountdown'
import PlayerActionButton from '../cockpit/PlayerActionButton'
import ContentSheet, {
  contentProse,
  sheetPadding,
  SheetTextButton,
} from './ContentSheet'

type Element = NonNullable<LearningElementQuery['learningElement']>['element']
const ignoreTick = () => {}

export default function LearningSheet({
  element,
  title,
  isNew,
  state,
  selection,
  onSelect,
  onSubmit,
  onClose,
  loading,
  saving,
  queryError,
  attemptError,
  onRetry,
  expiresAt,
}: {
  element?: Element
  title: string
  isNew: boolean
  state: 'SOLVED' | 'ATTEMPTED' | null
  selection: number[]
  onSelect: (value: number[]) => void
  onSubmit: () => void
  onClose: () => void
  loading: boolean
  saving: boolean
  queryError: boolean
  attemptError?: string | null
  onRetry: () => void
  expiresAt?: Date | null
}) {
  const solved = state === 'SOLVED'
  const xp = learningXP(element?.reward)
  return (
    <ContentSheet
      title="Learning Activity"
      label={
        <>
          <span>Learning activity</span>
          <span className="bg-player-success-surface text-player-success mobile:px-app-4 mobile:py-app-2 tablet:px-app-2 tablet:py-app-1 rounded-[8px] px-[16px] py-[6px] tracking-normal normal-case">
            {solved ? 'Solved' : isNew ? 'New' : 'Open'}
          </span>
        </>
      }
      onClose={onClose}
      footer={
        <>
          <SheetTextButton onClick={onClose}>
            {solved ? 'Close' : 'Later'}
          </SheetTextButton>
          {!solved && (
            <PlayerActionButton
              className="w-auto min-[641px]:min-h-[88px] min-[641px]:w-auto min-[641px]:text-[32px]"
              onClick={onSubmit}
              disabled={
                !element || loading || queryError || saving || !selection.length
              }
            >
              {saving ? 'Submitting…' : 'Submit answer'}
            </PlayerActionButton>
          )}
        </>
      }
    >
      <div
        className={`border-player-border mobile:gap-app-3 mobile:pt-app-1 mobile:pb-app-4 tablet:pb-app-3 flex items-start gap-[12px] border-b pt-[4px] pb-[24px] ${sheetPadding}`}
      >
        <div className="min-w-0 flex-1">
          <h2
            data-cy="content-sheet-heading"
            className="mobile:app-heading tablet:app-heading m-0 leading-[1.25] font-bold min-[641px]:text-[36px]"
          >
            {element?.title ?? title}
          </h2>
          {element && !queryError && (
            <div className={contentProse}>
              <Markdown>{element.question}</Markdown>
            </div>
          )}
        </div>
        {xp !== null && (
          <div className="bg-player-success-surface text-player-success mobile:px-app-3 mobile:py-app-3 mobile:rounded-app-card tablet:p-app-2 tablet:rounded-app-card shrink-0 rounded-[18px] py-[14px] text-center min-[641px]:px-[20px]">
            <span className="mobile:app-caption tablet:app-caption block font-semibold tracking-[1px] uppercase min-[641px]:text-[22px]">
              {solved ? 'Reward' : 'Awards'}
            </span>
            <span className="mobile:app-heading tablet:app-heading font-bold min-[641px]:text-[32px]">
              {xp} XP
            </span>
          </div>
        )}
      </div>
      <div
        className={`mobile:py-app-4 tablet:py-app-3 py-[20px] min-[641px]:py-[28px] ${sheetPadding}`}
      >
        {loading ? (
          <p role="status">Loading activity…</p>
        ) : queryError ? (
          <div role="alert">
            <p>Could not load this activity.</p>
            <SheetTextButton onClick={onRetry}>Try again</SheetTextButton>
          </div>
        ) : !element ? (
          <p role="status">This activity is unavailable.</p>
        ) : (
          <>
            <fieldset
              disabled={solved || saving}
              className="mobile:gap-app-3 tablet:gap-app-3 m-0 flex min-w-0 flex-col border-0 p-0 min-[641px]:gap-[20px]"
            >
              <legend className="sr-only">Choose one answer</legend>
              {element.options.map((option, ix) => (
                <label
                  key={ix}
                  className={cn(
                    'border-player-input mobile:gap-app-3 mobile:p-app-4 mobile:rounded-app-card tablet:gap-app-3 tablet:app-card flex cursor-pointer items-start rounded-[18px] border-2 min-[641px]:gap-[24px] min-[641px]:rounded-[24px] min-[641px]:p-[28px]',
                    selection.includes(ix) && 'border-player-primary',
                    (solved || saving) && 'cursor-default'
                  )}
                >
                  <input
                    type="radio"
                    name="learning-answer"
                    value={ix}
                    checked={selection.includes(ix)}
                    onChange={() => onSelect([ix])}
                    className="border-player-divider checked:border-player-primary checked:before:bg-player-primary focus-visible:outline-player-primary mobile:mt-app-1 tablet:size-[24px] tablet:border-2 tablet:before:inset-[4px] relative mt-[3px] size-[30px] shrink-0 appearance-none rounded-full border-[3px] bg-white before:absolute before:inset-[5px] before:rounded-full focus-visible:outline-2 focus-visible:outline-offset-[4px] min-[641px]:size-[48px] min-[641px]:border-[4px] min-[641px]:before:inset-[9px]"
                  />
                  <span className="mobile:app-body tablet:app-body leading-[1.5] min-[641px]:text-[28px]">
                    <Markdown
                      components={{
                        p: ({ children }) => <span>{children}</span>,
                      }}
                    >
                      {option.content}
                    </Markdown>
                  </span>
                </label>
              ))}
            </fieldset>
            <p className="text-player-muted mobile:mt-app-4 mobile:app-body tablet:app-caption tablet:mt-app-3 mt-[20px] mb-0 min-[641px]:text-[24px]">
              One answer.
              {!solved && expiresAt && Number.isFinite(expiresAt.getTime()) && (
                <>
                  {' '}
                  Quarter time remaining:{' '}
                  <CompactCountdown
                    expiresAt={expiresAt}
                    onUpdate={ignoreTick}
                  />
                  .
                </>
              )}
            </p>
            {state === 'ATTEMPTED' && (
              <p
                role="status"
                className="text-player-error mobile:mt-app-4 mobile:app-body tablet:app-body tablet:mt-app-3 mt-[16px] min-[641px]:text-[24px]"
              >
                That answer is not correct. Try again.
              </p>
            )}
            {attemptError && (
              <p
                role="alert"
                className="text-player-error mobile:mt-app-4 mobile:app-body tablet:app-body tablet:mt-app-3 mt-[16px] min-[641px]:text-[24px]"
              >
                {attemptError}
              </p>
            )}
            {solved && (
              <div
                className="mobile:mt-app-4 tablet:mt-app-3 mt-[24px]"
                role="status"
              >
                <p className="text-player-success font-semibold">
                  Correct answer
                </p>
                {element.feedback && (
                  <div className={contentProse}>
                    <h3 className="font-semibold text-inherit">Explanation</h3>
                    <Markdown>{element.feedback}</Markdown>
                  </div>
                )}
                {element.motivation && (
                  <div className={contentProse}>
                    <h3 className="font-semibold text-inherit">
                      Why is it relevant?
                    </h3>
                    <Markdown>{element.motivation}</Markdown>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </ContentSheet>
  )
}
