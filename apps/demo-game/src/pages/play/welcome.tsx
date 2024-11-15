import { useMutation, useQuery } from '@apollo/client'
import { COLORS } from '@gbl-uzh/platform/src/lib/constants'
import { Logo } from '@gbl-uzh/ui'
import {
  Button,
  NewFormikSelectField,
  NewFormikTextField,
} from '@uzh-bf/design-system'
import { Form, Formik } from 'formik'
import { useRouter } from 'next/router'
import { useState } from 'react'
import {
  SelfDocument,
  UpdatePlayerDataDocument,
} from 'src/graphql/generated/ops'
import { LOCATIONS } from 'src/lib/constants'
import * as Yup from 'yup'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@uzh-bf/design-system/dist/future'

const Schema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Too Short!')
    .max(20, 'Too Long!')
    .required('Required'),
})

// TODO(JJ):
// - Move modal to ui package
// - LogoSelector

// props:
// - descriptions
// - avatar info, color, location, onSubmit, no player.role
// - add banks, like colors
function Welcome() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { data, loading, error } = useQuery(SelfDocument)

  const [updatePlayerData] = useMutation(UpdatePlayerDataDocument, {
    optimisticResponse: {
      updatePlayerData: {
        name: data?.self.name,
        facts: JSON.stringify({
          color: data?.self.facts.color,
          avatar: data?.self.facts.avatar,
          location: data?.self.facts.location,
        }),
      },
    },
    onError: (error) => {
      console.error('Error updating player data:', error)
      setIsSubmitting(false)
    },
  })

  if (loading) return null
  if (error) return `Error! ${error}`

  const gameName = 'Minigame'

  const player = data.self

  return (
    <div className="m-auto w-full max-w-4xl p-8">
      <Formik
        initialValues={{
          name: player.name,
          color: player.facts.color ?? Object.keys(COLORS)[0],
          location: player.facts.location ?? LOCATIONS.Trader[0],
          imgPathAvatar:
            player.facts.avatar ?? '/avatars/avatar_placeholder.png',
        }}
        validationSchema={Schema}
        onSubmit={async (values) => {
          setIsSubmitting(true)
          try {
            await updatePlayerData({
              variables: {
                name: values.name,
                facts: JSON.stringify({
                  color: values.color,
                  avatar: values.imgPathAvatar,
                  location: values.location,
                }),
              },
            })
            router.replace('/play/cockpit')
          } catch (e) {
            console.error('Error updating player data:', e)
            setIsSubmitting(false)
          }
        }}
      >
        {({ values, errors, touched }) => (
          <Card className="flex w-full flex-col">
            <CardHeader>
              <CardTitle>Welcome to the {gameName}!</CardTitle>
              <CardDescription>
                Read the introduction and task description, and fill in the
                avator form.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4 sm:flex-nowrap  sm:justify-center">
              <div className="flex w-full flex-col gap-4">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Introduction</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='pb-4'>
                      Welcome, {values.name}
                      <br />
                      Lucky you! You recently found out that you picked five
                      correct numbers in the lottery. You now want to invest CHF
                      10&apos;000 of the winnings, some of which you have
                      already spent.
                    </div>
                    <img src="/images/welcome.jpg" className="w-full" />
                    <div className="pt-10">
                      <span className="pb-2 text-2xl font-medium">Task</span>
                      <div>
                        Decide what proportion of your starting capital you want
                        to put into a safe bank account, what proportion you
                        want to invest in bonds and what proportion you want to
                        invest in stocks.
                      </div>
                      
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Form className="max-w-1/2 w-full sm:w-max">
                {/* <LogoSelector
                  className="w-48 flex-none"
                  color={values.color}
                  name="avatar"
                /> */}
                <Card>
                  <CardHeader>
                    <CardTitle>Avatar</CardTitle>
                    <CardDescription>Configure your avatar.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-8">
                    <div>
                      <Logo
                        color={values.color}
                        location={values.location}
                        name={values.name}
                        imgPathAvatar={values.imgPathAvatar}
                        imgPathLocation={`/locations/${values.location}.svg`}
                      />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex-initial space-y-1.5">
                        <NewFormikTextField
                          label="Name of bank"
                          name="name"
                          className={{ label: 'pb-2 font-normal' }}
                        />
                        <NewFormikSelectField
                          label="Location"
                          name="location"
                          items={LOCATIONS.Trader.map((label) => ({
                            value: label,
                            label,
                          }))}
                          className={{
                            root: 'w-full',
                            label: 'pb-2 font-normal',
                            select: { root: 'w-full', trigger: 'w-full' },
                          }}
                        />
                        <NewFormikSelectField
                          label="Color"
                          name="color"
                          items={Object.keys(COLORS).map((label) => ({
                            value: label,
                            label,
                          }))}
                          className={{
                            root: 'w-full',
                            label: 'pb-2 font-normal',
                            select: { root: 'w-full', trigger: 'w-full' },
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className={{ root: 'mt-4' }}
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Loading...' : 'Start Game'}
                    </Button>
                  </CardFooter>
                </Card>
              </Form>
            </CardContent>
          </Card>
        )}
      </Formik>
    </div>
  )
}

export default Welcome
