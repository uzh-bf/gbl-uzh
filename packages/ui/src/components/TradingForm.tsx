import { Button, FormikTextField } from '@uzh-bf/design-system'
import { Form, Formik } from 'formik'
// import * as yup from 'yup'

// TODO(JJ):
// - Check with RS if we would like to use yup in the ui?
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
  nameButtonA: string
  nameButtonB: string
  onSubmit: (values: any, helpers: any) => Promise<void>
  disableButtonA?: boolean
  disableButtonB?: boolean
}

function TradingForm({
  price,
  nameButtonA,
  nameButtonB,
  onSubmit,
  disableButtonA = false,
  disableButtonB = false,
}: Props) {
  return (
    <div className="flex w-max gap-4 rounded border p-8">
      <Formik
        initialValues={{
          modifier: 1,
          volume: 0,
        }}
        isInitialValid={false}
        // validationSchema={yup.object({
        //   volume: yup.number().min(1).required(),
        // })}
        onSubmit={onSubmit}
      >
        {(tradeInterface: any) => (
          <Form className="">
            <FormikTextField
              min={0}
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
                  disableButtonA
                }
                type="button"
                onClick={async () => {
                  await tradeInterface.setFieldValue('modifier', 1)
                  tradeInterface.handleSubmit()
                }}
              >
                {nameButtonA}
              </Button>
              <Button
                disabled={
                  tradeInterface.isSubmitting ||
                  !tradeInterface.isValid ||
                  disableButtonB
                }
                type="button"
                onClick={async () => {
                  await tradeInterface.setFieldValue('modifier', -1)
                  tradeInterface.handleSubmit()
                }}
              >
                {nameButtonB}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}

export default TradingForm
