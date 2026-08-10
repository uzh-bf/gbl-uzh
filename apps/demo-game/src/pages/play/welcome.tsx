import { useMutation, useQuery } from '@apollo/client'
import { Logo, LogoSelector } from '@gbl-uzh/ui'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  RhfSelectField,
  RhfTextField,
} from '@uzh-bf/design-system'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  SelfDocument,
  UpdatePlayerDataDocument,
} from 'src/graphql/generated/ops'
import { AVATARS, COLORS, LOCATIONS } from 'src/lib/constants'

type WelcomeFormValues = {
  name: string
  color: string
  location: string
  imgPathAvatar: string
}

function Welcome() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { data, loading, error } = useQuery(SelfDocument, {
    onError: (error) => {
      console.error('Error fetching player data:', error)
    },
    onCompleted: (data) => {
      if (!data.self) {
        console.warn('No player data found - user may not be authenticated')
      }
    },
  })

  const [updatePlayerData] = useMutation(UpdatePlayerDataDocument, {
    optimisticResponse: data?.self
      ? {
          updatePlayerData: {
            __typename: 'Player',
            ...data.self,
            name: data.self.name,
            facts: JSON.stringify({
              color: data.self.facts.color,
              avatar: data.self.facts.avatar,
              location: data.self.facts.location,
            }),
          } as any,
        }
      : undefined,
    onError: (error) => {
      console.error('Error updating player data:', error)
      setIsSubmitting(false)
    },
  })

  const { handleSubmit, watch, control } = useForm<WelcomeFormValues>({
    defaultValues: {
      name: data?.self?.name ?? '',
      color: data?.self?.facts?.color ?? Object.keys(COLORS)[0],
      location: data?.self?.facts?.location ?? LOCATIONS.Trader[0],
      imgPathAvatar:
        data?.self?.facts?.avatar ?? '/avatars/avatar_placeholder.png',
    },
    values: data?.self
      ? {
          name: data.self.name,
          color: data.self.facts.color ?? Object.keys(COLORS)[0],
          location: data.self.facts.location ?? LOCATIONS.Trader[0],
          imgPathAvatar:
            data.self.facts.avatar ?? '/avatars/avatar_placeholder.png',
        }
      : undefined,
  })

  const watchColor = watch('color')
  const watchName = watch('name')
  const watchLocation = watch('location')
  const watchAvatar = watch('imgPathAvatar')

  if (loading) return null
  if (error) return `Error! ${error}`

  const gameName = 'Minigame'

  const onSubmit = async (values: WelcomeFormValues) => {
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
      console.error(e)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="m-auto w-full max-w-4xl p-8">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="flex w-full flex-col">
          <CardHeader>
            <CardTitle>Welcome to the {gameName}!</CardTitle>
            <CardDescription>
              Read the introduction and task description, and fill in the avatar
              form.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-6 sm:flex-nowrap sm:justify-center">
            <div className="flex w-full flex-col gap-4">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Introduction</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="pb-4 text-sm leading-relaxed text-slate-600">
                    Welcome, {watchName}
                    <br />
                    Lucky you! You recently found out that you picked five
                    correct numbers in the lottery. You now want to invest CHF
                    10&apos;000 of the winnings, some of which you have already
                    spent.
                  </div>
                  <img
                    src="/images/welcome.jpg"
                    className="max-h-56 w-full rounded-md object-cover"
                    alt="Lottery win"
                  />
                  <div className="pt-8">
                    <h3 className="pb-2 text-lg font-medium text-slate-800">
                      Task
                    </h3>
                    <div className="text-sm leading-relaxed text-slate-600">
                      Decide what proportion of your starting capital you want
                      to put into a safe bank account, what proportion you want
                      to invest in bonds and what proportion you want to invest
                      in stocks.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="w-full max-w-1/2 sm:w-max">
              <Card>
                <CardHeader>
                  <CardTitle>Avatar</CardTitle>
                  <CardDescription>Configure your avatar.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                  <div className="flex justify-center rounded-lg border border-slate-100 bg-slate-50 p-4">
                    <Logo
                      color={watchColor}
                      location={watchLocation}
                      name={watchName}
                      imgPathAvatar={watchAvatar}
                      imgPathLocation={`/locations/${watchLocation}.svg`}
                    />
                  </div>
                  <div className="flex w-64 flex-col gap-4">
                    <RhfTextField
                      control={control}
                      name="name"
                      label="Name of bank"
                      placeholder="Enter bank name"
                      required
                      rules={{
                        required: 'Required',
                        minLength: { value: 2, message: 'Too Short!' },
                        maxLength: { value: 20, message: 'Too Long!' },
                      }}
                    />

                    <RhfSelectField
                      control={control}
                      name="location"
                      label="Location"
                      required
                      rules={{ required: 'Required' }}
                      items={LOCATIONS.Trader.map((label) => ({
                        value: label,
                        label,
                      }))}
                    />

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Avatar
                      </label>
                      <Controller
                        control={control}
                        name="imgPathAvatar"
                        render={({ field }) => (
                          <LogoSelector
                            avatarOptions={Object.values(AVATARS)}
                            colors={COLORS}
                            color={watchColor}
                            value={field.value}
                            onChange={field.onChange}
                            fallbackSrc="/avatars/avatar_placeholder.png"
                          />
                        )}
                      />
                    </div>

                    <RhfSelectField
                      control={control}
                      name="color"
                      label="Color"
                      required
                      rules={{ required: 'Required' }}
                      items={Object.keys(COLORS).map((label) => ({
                        value: label,
                        label,
                      }))}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className={{ root: 'mt-2 w-full' }}
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Loading...' : 'Start Game'}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

export default Welcome
