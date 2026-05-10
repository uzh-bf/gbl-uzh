import { COLORS } from '@gbl-uzh/platform/src/lib/constants'
import { Logo } from '@gbl-uzh/ui'
import {
  Button,
  FormikSelectField,
  FormikTextField,
} from '@uzh-bf/design-system'
import { Form, Formik } from 'formik'
import { useRouter } from 'next/router'
import { useState } from 'react'
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
import LogoSelector from '~/components/LogoSelector'
import { trpc } from '~/lib/trpc'

const Schema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Too Short!')
    .max(20, 'Too Long!')
    .required('Required'),
})

function Welcome() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    data: player,
    isLoading: isPlayerLoading,
    error: playerError,
  } = trpc.play.self.useQuery()

  const utils = trpc.useUtils()
  const updatePlayerData = trpc.play.updatePlayerData.useMutation({
    onSuccess: async () => {
      await utils.play.self.invalidate()
    },
    onError: () => {
      setIsSubmitting(false)
    },
  })

  if (isPlayerLoading) return null
  if (playerError) return `Error! ${playerError}`
  if (!player) {
    return 'No player data found - user may not be authenticated'
  }

  const playerFacts =
    typeof player.facts === 'object' && player.facts !== null
      ? (player.facts as Record<string, string>)
      : {}
  const gameName = 'Minigame'

  return (
    <div className="m-auto w-full max-w-4xl p-8">
      <Formik
        initialValues={{
          name: player.name,
          color: playerFacts.color ?? Object.keys(COLORS)[0],
          location: playerFacts.location ?? LOCATIONS.Trader[0],
          imgPathAvatar:
            playerFacts.avatar ?? '/avatars/avatar_placeholder.png',
        }}
        validationSchema={Schema}
        onSubmit={async (values) => {
          setIsSubmitting(true)

          try {
            await updatePlayerData.mutateAsync({
              name: values.name,
              facts: JSON.stringify({
                color: values.color,
                avatar: values.imgPathAvatar,
                location: values.location,
              }),
            })

            await router.replace('/play/cockpit')
          } catch (error) {
            console.error('Error updating player data:', error)
          }
        }}
      >
        {({ values }) => (
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
                    <div className="pb-4">
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
                        <FormikTextField
                          label="Name of bank"
                          name="name"
                          className={{ label: 'pb-2 font-normal' }}
                        />
                        <FormikSelectField
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
                        <LogoSelector
                          label="Avatar"
                          className="w-48 pb-2 text-sm text-gray-600"
                          color={values.color}
                          name="imgPathAvatar"
                        />

                        <FormikSelectField
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
                      disabled={isSubmitting || updatePlayerData.isPending}
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
