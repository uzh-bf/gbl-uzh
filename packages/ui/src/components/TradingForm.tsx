import { Button } from '@uzh-bf/design-system'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { ReusableFormField } from './ReusableFormField'
import { Form } from './ui/form'

function optionalValueToCHFString(value: number, digits = 2) {
  return value?.toLocaleString('de-CH', {
    style: 'currency',
    currency: 'CHF',
    maximumFractionDigits: digits,
  })
}

interface Props {
  price: number
  nameButtonBuy: string
  nameButtonSell: string
  onSubmit: (values: { volume: number; modifier: number }) => Promise<void>
  max: number
  unitName?: string
  disableButtonBuy?: boolean
  disableButtonSell?: boolean
}

function TradingForm({
  price,
  nameButtonBuy,
  nameButtonSell,
  onSubmit,
  max,
  unitName = 'units',
  disableButtonBuy = false,
  disableButtonSell = false,
}: Props) {
  const schema = yup.object({
    volume: yup
      .number()
      .typeError('Volume must be a number')
      .min(0, 'Volume must be greater than 0')
      .max(max, 'Volume must be smaller equal than ' + max)
      .required('Volume is required'),
  })

  const form = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      volume: 0,
    },
    mode: 'onChange'
  })

  return (
    <div className="flex w-max gap-4 rounded border p-8">
      <Form {...form}>
        <form className="" onSubmit={form.handleSubmit((values) => onSubmit({ ...values, modifier: 1 }))}>
          <ReusableFormField
            control={form.control}
            name="volume"
            label="Volume"
            type="number"
            placeholder="0"
            required
          />
          <div className="mt-2">
            Trading {form.watch('volume') || 0} {unitName} for{' '}
            {optionalValueToCHFString((form.watch('volume') || 0) * price)}
          </div>

          <div className="mt-2 flex flex-row gap-2">
            <Button
              disabled={
                form.formState.isSubmitting ||
                !form.formState.isValid ||
                disableButtonBuy
              }
              type="button"
              onClick={async () => {
                await form.handleSubmit((values) => onSubmit({ ...values, modifier: 1 }))()
              }}
            >
              {nameButtonBuy}
            </Button>
            <Button
              disabled={
                form.formState.isSubmitting ||
                !form.formState.isValid ||
                disableButtonSell
              }
              type="button"
              onClick={async () => {
                await form.handleSubmit((values) => onSubmit({ ...values, modifier: -1 }))()
              }}
            >
              {nameButtonSell}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export { TradingForm }
