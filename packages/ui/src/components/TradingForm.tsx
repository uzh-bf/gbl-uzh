import { Button, FormikTextField } from '@uzh-bf/design-system'
import { Form, Formik } from 'formik'
import * as yup from 'yup'

// TODO(JJ):
// - UserNotification as child?
// - Name is currently Trading -> input spotPrice, how to name?

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
  onSubmit: (values: any, helpers: any) => Promise<void>
  min?: number
  disableButtonBuy?: boolean
  disableButtonSell?: boolean
}

function TradingForm({
  price,
  nameButtonBuy,
  nameButtonSell,
  onSubmit,
  min = 0,
  disableButtonBuy = false,
  disableButtonSell = false,
}: Props) {
  return (
    <div className="flex w-max gap-4 rounded border p-8">
      <Formik
        initialValues={{
          modifier: 1,
          volume: min,
        }}
        isInitialValid={false}
        validationSchema={yup.object({
          volume: yup.number().min(min).required(),
        })}
        onSubmit={onSubmit}
      >
        {(tradeInterface) => (
          <Form className="">
            <FormikTextField
              min={min}
              type="number"
              label="Volume"
              name="volume"
            />
            <div className="mt-2">
              Trading {tradeInterface.values.volume}T for{' '}
              {optionalValueToCHFString(tradeInterface.values.volume * price)}
            </div>

            {/* {!sufficientFunds && !sufficientStorage && (
              <UserNotification
                type="errornotificationType"
                message="You do not have the funds or goods to trade this volume."
              />
            )} */}

            <div className="mt-2 flex flex-row gap-2">
              <Button
                disabled={
                  tradeInterface.isSubmitting ||
                  !tradeInterface.isValid ||
                  disableButtonBuy
                }
                type="button"
                onClick={async () => {
                  await tradeInterface.setFieldValue('modifier', 1)
                  tradeInterface.handleSubmit()
                }}
              >
                {nameButtonBuy}
              </Button>
              <Button
                disabled={
                  tradeInterface.isSubmitting ||
                  !tradeInterface.isValid ||
                  disableButtonSell
                }
                type="button"
                onClick={async () => {
                  await tradeInterface.setFieldValue('modifier', -1)
                  tradeInterface.handleSubmit()
                }}
              >
                {nameButtonSell}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}

export { TradingForm }
