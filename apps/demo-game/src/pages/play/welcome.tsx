import { useMutation } from '@apollo/client'
import { Button } from '@uzh-bf/design-system'
import { Form, Formik } from 'formik'
import { UpdatePlayerDataDocument } from '@gbl-uzh/platform/dist/generated/ops'
import { useRouter } from 'next/router'
import { useContext } from 'react'
import Markdown from 'react-markdown'
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
          name: '',

        }}
        onSubmit={async (values) => {
          console.log(values)
        }}>

        <Form className="">
          <div className="flex flex-row gap-8">
            <div className="flex flex-col flex-initial gap-4">
              company name
                
            </div>
          </div>
        </Form>

      </Formik>
    </div>
  )
}

export default Welcome
