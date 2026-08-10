import { Button, Form, RhfNumberField } from '@uzh-bf/design-system'
import { useForm } from 'react-hook-form'

type TradingFormValues = {
  volume: number | ''
}

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
  const form = useForm<TradingFormValues>({
    defaultValues: {
      volume: 0,
    },
    mode: 'onChange',
  })

  const submitTrade = (modifier: 1 | -1) =>
    form.handleSubmit(async (values) => {
      await onSubmit({ volume: Number(values.volume), modifier })
      form.reset()
    })

  return (
    <div className="flex w-max gap-4 rounded border p-8">
      <Form {...form}>
        <form onSubmit={(event) => event.preventDefault()}>
          <RhfNumberField
            control={form.control}
            name="volume"
            label="Volume"
            placeholder="0"
            required
            max={max}
            rules={{
              required: 'Volume is required',
              validate: (value) =>
                value !== '' && value > 0
                  ? true
                  : 'Volume must be greater than 0',
              max: {
                value: max,
                message: 'Volume must be smaller equal than ' + max,
              },
            }}
          />
          <div className="mt-2">
            Trading {Number(form.watch('volume') || 0)} {unitName} for{' '}
            {optionalValueToCHFString(
              Number(form.watch('volume') || 0) * price
            )}
          </div>

          <div className="mt-2 flex flex-row gap-2">
            <Button
              disabled={
                form.formState.isSubmitting ||
                !form.formState.isValid ||
                disableButtonBuy
              }
              type="button"
              onClick={submitTrade(1)}
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
              onClick={submitTrade(-1)}
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
