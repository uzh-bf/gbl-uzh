import { useMutation } from '@apollo/client'
import { UpdatePlayerDataDocument } from 'src/graphql/generated/ops'
import { Button, FormikTextField } from '@uzh-bf/design-system'
import { Form, Formik } from 'formik'
import { useRouter } from 'next/router'
import * as Yup from 'yup'

const Schema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Too Short!')
    .max(20, 'Too Long!')
    .required('Required'),
})

function Welcome() {
  const router = useRouter()

  const [updatePlayerData, { loading }] = useMutation(UpdatePlayerDataDocument)

  return (
    <div className="w-full max-w-2xl gap-8 p-8 m-auto border rounded">
      <Formik
        initialValues={{
          name: 'Your Name',
        }}
        onSubmit={async (values) => {
          console.log(values)
          await updatePlayerData({
            variables: {
              name: values.name,
            },
          })
          router.replace('/play/cockpit')
        }}
      >
        {({ values, errors, touched }) => (
          <Form className="">
            <FormikTextField label="Trader Name" name="name" />
            <Button className="mt-8" type="submit">
              Start Game
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  )
}

export default Welcome
