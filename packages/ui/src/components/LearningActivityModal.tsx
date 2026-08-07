import { Modal } from '@uzh-bf/design-system'
import React from 'react'
import {
  LearningElementDisplay,
  type LearningElementOption,
  type LearningElementState,
} from '~/components/LearningElementDisplay'

interface LearningActivityElement {
  title: string
  question: string
  options: readonly LearningElementOption[]
  reward?: number | null
  feedback?: string | null
  motivation?: string | null
}

export interface LearningActivityModalProps {
  open: boolean
  onClose: () => void
  element?: LearningActivityElement | null
  state: LearningElementState | null
  activeElements: number[]
  setActiveElements: React.Dispatch<React.SetStateAction<number[]>>
  onSubmit: () => void
  loading?: boolean
  returnButton?: React.ReactNode
}

export function LearningActivityModal({
  open,
  onClose,
  element,
  state,
  activeElements,
  setActiveElements,
  onSubmit,
  loading,
  returnButton,
}: LearningActivityModalProps) {
  return (
    <Modal
      className={{ content: 'max-w-4xl overflow-y-auto' }}
      open={open}
      onClose={onClose}
      title="Learning Activity"
    >
      {element && (
        <LearningElementDisplay
          title={element.title}
          question={element.question}
          options={element.options}
          state={state ?? 'UNATTEMPTED'}
          pointsText={element.reward ? `Awards ${element.reward}XP` : undefined}
          feedback={element.feedback}
          motivation={element.motivation}
          activeElements={activeElements}
          onOptionClick={(index) => {
            setActiveElements((previous) =>
              previous.includes(index)
                ? previous.filter((activeIndex) => activeIndex !== index)
                : [index]
            )
          }}
          onSubmit={onSubmit}
          loading={loading}
          returnButton={returnButton}
        />
      )}
    </Modal>
  )
}
