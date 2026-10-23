import { useFormik } from 'formik'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ALLOCATION_KEYS,
  allocationDraft,
  allocationSchema,
  isAllocationValid,
  parseAllocation,
  type Allocation,
  type AllocationDraft,
} from '~/lib/allocation'

const defaultAllocation: Allocation = { bank: 100, bonds: 0, stocks: 0 }

export function useAllocationForm(
  saved: Allocation | undefined,
  roundKey: string,
  submit: (value: Allocation) => Promise<unknown>,
  submitted = false,
  isReady = false
) {
  const { bank, bonds, stocks } = saved ?? defaultAllocation
  const initial = useMemo(() => {
    const value = { bank, bonds, stocks }
    return isAllocationValid(value) ? value : defaultAllocation
  }, [bank, bonds, stocks])
  const [preview, setPreview] = useState(initial)
  const currentRound = useRef(roundKey)
  const [editingRound, setEditingRound] = useState<string | null>(null)
  const [acceptedRound, setAcceptedRound] = useState<string | null>(null)
  // A legacy Ready player may have no marker yet. Unlock to the saved summary.
  useEffect(() => {
    if (isReady) setAcceptedRound(roundKey)
  }, [isReady, roundKey])
  const form = useFormik({
    initialValues: allocationDraft(initial),
    validationSchema: allocationSchema,
    onSubmit: (values, helpers) => {
      const submittingRound = currentRound.current
      helpers.setStatus(undefined)
      // Own cleanup so Formik cannot clear a newer round's submitting state
      // when this request finishes. Returning a promise would do that implicitly.
      void (async () => {
        try {
          await submit(parseAllocation(values))
          if (currentRound.current !== submittingRound) return
          setEditingRound(null)
          setAcceptedRound(submittingRound)
          helpers.resetForm({ values })
        } catch {
          if (currentRound.current === submittingRound)
            helpers.setStatus({
              error:
                'Could not save your allocation. Please try submitting again.',
            })
        } finally {
          if (currentRound.current === submittingRound)
            helpers.setSubmitting(false)
        }
      })()
    },
  })
  const { resetForm, dirty, isSubmitting } = form
  useEffect(() => {
    const changedRound = currentRound.current !== roundKey
    currentRound.current = roundKey
    if (changedRound) {
      setEditingRound(null)
      setAcceptedRound(isReady ? roundKey : null)
    }
    if (changedRound || (!dirty && !isSubmitting)) {
      const values = allocationDraft(initial)
      resetForm({
        values,
        status:
          !changedRound &&
          ALLOCATION_KEYS.every((key) => values[key] === form.values[key])
            ? form.status
            : undefined,
      })
      setPreview(initial)
    }
    // Only server decisions or round changes can initialize a draft. Becoming
    // pristine after a save must not reinitialize it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial, roundKey, resetForm])

  const allocation = parseAllocation(form.values)
  const valid = isAllocationValid(allocation)
  const setDraft = (values: AllocationDraft) => {
    const next = parseAllocation(values)
    if (isAllocationValid(next)) setPreview(next)
    form.setStatus(undefined)
    void form.setValues(values)
  }

  const view: 'editing' | 'submitted' | 'ready' = isReady
    ? 'ready'
    : editingRound === roundKey
      ? 'editing'
      : submitted || acceptedRound === roundKey
        ? 'submitted'
        : 'editing'
  const beginEditing = () => {
    if (isReady || form.isSubmitting) return
    resetForm({ values: allocationDraft(initial) })
    setPreview(initial)
    setEditingRound(roundKey)
  }

  return {
    form,
    allocation,
    valid,
    preview,
    setDraft,
    saved: initial,
    view,
    beginEditing,
  }
}
