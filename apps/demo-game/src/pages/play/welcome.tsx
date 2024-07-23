import { useMutation } from '@apollo/client'
import { Logo } from '@gbl-uzh/ui'
import { Button, FormikTextField } from '@uzh-bf/design-system'
import { Form, Formik } from 'formik'
import { useRouter } from 'next/router'
import { UpdatePlayerDataDocument } from 'src/graphql/generated/ops'
import * as Yup from 'yup'

const Schema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Too Short!')
    .max(20, 'Too Long!')
    .required('Required'),
})

// TODO(JJ):
// - Maybe move to ui package
// - Double-check if for this game location is needed?
// - LogoSelector
// - Will all games have the same greeting layout?
// - Maybe change title (now: Demo Game)
function Welcome() {
  const router = useRouter()

  const [updatePlayerData, { loading }] = useMutation(UpdatePlayerDataDocument)

  return (
    <div className="m-auto w-full max-w-2xl gap-8 rounded border p-8">
      <Formik
        initialValues={{
          name: 'Your Name',
          color: 'red',
          location: 'ZH',
          avatar: 'avatar_placeholder',
          // color: player.color,
          // avatar: AVATARS[player.role][0]['key'],
          // name: player.name,
          // location: LOCATIONS[player.role][0],
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
          <div className="flex flex-col gap-4">
            <div className="text-xl font-bold">Welcome to the Demo Game!</div>
            <div className="flex flex-row gap-8">
              <div className="w-48 flex-initial">
                <Logo
                  color={values.color}
                  location={values.location}
                  name={values.name}
                  avatar={values.avatar}
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
                  {/* <FormikSelectField
                    label="Location"
                    name="location"
                    items={LOCATIONS[player.role].map((key) => ({
                      value: key,
                      label: key,
                    }))}
                  />
                  <FormikSelectField
                    label="Color"
                    name="color"
                    items={Object.keys(COLORS).map((label) => ({
                      value: label,
                      label,
                    }))}
                  /> */}
                </div>
              </div>

              {/* <FormikTextField label="Trader Name" name="name" /> */}
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
