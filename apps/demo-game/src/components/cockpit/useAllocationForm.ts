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
  submit: (value: Allocation) => Promise<unknown>
) {
  const { bank, bonds, stocks } = saved ?? defaultAllocation
  const initial = useMemo(() => {
    const value = { bank, bonds, stocks }
    return isAllocationValid(value) ? value : defaultAllocation
  }, [bank, bonds, stocks])
  const [preview, setPreview] = useState(initial)
  const currentRound = useRef(roundKey)
  const form = useFormik({
    initialValues: allocationDraft(initial),
    validationSchema: allocationSchema,
    onSubmit: async (values, helpers) => {
      const submittingRound = currentRound.current
      helpers.setStatus(undefined)
      try {
        await submit(parseAllocation(values))
        if (currentRound.current !== submittingRound) return
        helpers.resetForm({
          values,
          status: { success: 'Allocation submitted.' },
        })
      } catch {
        if (currentRound.current === submittingRound)
          helpers.setStatus({
            error:
              'Could not save your allocation. Please try submitting again.',
          })
      }
    },
  })
  const { resetForm, dirty, isSubmitting } = form
  useEffect(() => {
    const changedRound = currentRound.current !== roundKey
    currentRound.current = roundKey
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
    // pristine after a save must not clear its success message.
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

  return { form, allocation, valid, preview, setDraft }
}
