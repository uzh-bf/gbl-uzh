import { useMutation } from '@apollo/client'
import { COLORS } from '@gbl-uzh/platform/src/lib/constants'
import { Logo } from '@gbl-uzh/ui'
import {
  Button,
  FormikSelectField,
  FormikTextField,
} from '@uzh-bf/design-system'
import { Form, Formik } from 'formik'
import { useRouter } from 'next/router'
import { UpdatePlayerDataDocument } from 'src/graphql/generated/ops'
import { LOCATIONS } from 'src/lib/constants'
import * as Yup from 'yup'

const Schema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Too Short!')
    .max(20, 'Too Long!')
    .required('Required'),
})

// TODO(JJ):
// - Maybe move to ui package
// - LogoSelector
// -> DISCUSS WITH RS

// props:
// - descriptions
// - avatar info, color, location, onSubmit, no player.role
function Welcome() {
  const router = useRouter()

  const [updatePlayerData, { data: playerData, loading, error }] = useMutation(
    UpdatePlayerDataDocument
  )

  if (loading) return null
  if (error) return `Error! ${error}`

  const gameName = 'Minigame'

  // TODO(JJ): @RS We have the location twice, once in facts and once in the query. Why?
  // - maybe change MUpdatePlayerDataDocument to include location?
  console.log(playerData)

  return (
    <div className="m-auto w-full max-w-2xl gap-8 rounded border p-8">
      <Formik
        initialValues={{
          name: 'Your Name',
          // name: player.name,
          color: Object.keys(COLORS)[0],
          location: LOCATIONS.Trader[0],
          imgPathAvatar: '/avatars/avatar_placeholder.png',
          // avatar: AVATARS[player.role][0]['key'],
        }}
        validationSchema={Schema}
        onSubmit={async (values) => {
          await updatePlayerData({
            variables: {
              name: values.name,
              color: values.color,
              avatar: values.imgPathAvatar,
              facts: JSON.stringify({
                location: values.location,
              }),
            },
          })
          router.replace('/play/cockpit')
        }}
      >
        {({ values, errors, touched }) => (
          <div className="flex flex-col gap-4">
            <div className="text-xl font-bold">Welcome to the {gameName}!</div>
            <div className="flex flex-row gap-8">
              <div className="w-48 flex-initial">
                <Logo
                  color={values.color}
                  location={values.location}
                  name={values.name}
                  imgPathAvatar={values.imgPathAvatar}
                  imgPathLocation={`/locations/${values.location}.svg`}
                />
              </div>
              <div className="prose flex-1">
                Welcome, {values.name}! Your bank has its headquarters in{' '}
                {values.location}.
              </div>
            </div>

            <Form className="">
              <div className="flex flex-row gap-8">
                {/* <LogoSelector
                  className="w-48 flex-none"
                  color={values.color}
                  name="avatar"
                /> */}

                <div className="flex-initial space-y-3">
                  <FormikTextField label="Trader Name" name="name" />
                  <FormikSelectField
                    label="Location"
                    name="location"
                    items={LOCATIONS.Trader.map((label) => ({
                      value: label,
                      label,
                    }))}
                  />
                  <FormikSelectField
                    label="Color"
                    name="color"
                    items={Object.keys(COLORS).map((label) => ({
                      value: label,
                      label,
                    }))}
                  />
                </div>
              </div>
              <Button className={{ root: 'mt-8' }} type="submit">
                Start Game
              </Button>
            </Form>
          </div>
        )}
      </Formik>
    </div>
  )
}

export default Welcome
