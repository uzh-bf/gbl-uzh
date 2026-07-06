import { useMutation, useQuery } from '@apollo/client'
import { Logo, LogoSelector, cn } from '@gbl-uzh/ui'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@uzh-bf/design-system'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  SelfDocument,
  UpdatePlayerDataDocument,
} from 'src/graphql/generated/ops'
import { AVATARS, COLORS, LOCATIONS } from 'src/lib/constants'

const LOGO_SELECTOR_COLORS_MAP = Object.entries(COLORS).reduce((acc, [k, v]) => {
  let ringClass = 'ring-slate-500'
  if (k === 'Red') ringClass = 'ring-orange-500'
  if (k === 'Green') ringClass = 'ring-lime-500'
  if (k === 'Yellow') ringClass = 'ring-yellow-500'
  if (k === 'Blue') ringClass = 'ring-blue-500'
  acc[k] = { bg: v, ring: ringClass }
  return acc
}, {} as Record<string, { bg: string; ring: string }>)

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
    optimisticResponse: data?.self ? {
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
    } : undefined,
    onError: (error) => {
      console.error('Error updating player data:', error)
      setIsSubmitting(false)
    },
  })

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: data?.self?.name ?? '',
      color: data?.self?.facts?.color ?? Object.keys(COLORS)[0],
      location: data?.self?.facts?.location ?? LOCATIONS.Trader[0],
      imgPathAvatar: data?.self?.facts?.avatar ?? '/avatars/avatar_placeholder.png',
    },
    values: data?.self
      ? {
          name: data.self.name,
          color: data.self.facts.color ?? Object.keys(COLORS)[0],
          location: data.self.facts.location ?? LOCATIONS.Trader[0],
          imgPathAvatar: data.self.facts.avatar ?? '/avatars/avatar_placeholder.png',
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

  const onSubmit = async (values: {
    name: string
    color: string
    location: string
    imgPathAvatar: string
  }) => {
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
              Read the introduction and task description, and fill in the
              avatar form.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-6 sm:flex-nowrap sm:justify-center">
            <div className="flex w-full flex-col gap-4">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Introduction</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="pb-4 text-slate-600 text-sm leading-relaxed">
                    Welcome, {watchName}
                    <br />
                    Lucky you! You recently found out that you picked five
                    correct numbers in the lottery. You now want to invest CHF
                    10&apos;000 of the winnings, some of which you have
                    already spent.
                  </div>
                  <img src="/images/welcome.jpg" className="w-full rounded-md object-cover max-h-56" alt="Lottery win" />
                  <div className="pt-8">
                    <h3 className="pb-2 text-lg font-medium text-slate-800">Task</h3>
                    <div className="text-slate-600 text-sm leading-relaxed">
                      Decide what proportion of your starting capital you want
                      to put into a safe bank account, what proportion you
                      want to invest in bonds and what proportion you want to
                      invest in stocks.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="max-w-1/2 w-full sm:w-max">
              <Card>
                <CardHeader>
                  <CardTitle>Avatar</CardTitle>
                  <CardDescription>Configure your avatar.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                  <div className="flex justify-center bg-slate-50 rounded-lg p-4 border border-slate-100">
                    <Logo
                      color={watchColor}
                      location={watchLocation}
                      name={watchName}
                      imgPathAvatar={watchAvatar}
                      imgPathLocation={`/locations/${watchLocation}.svg`}
                    />
                  </div>
                  <div className="flex flex-col gap-4 w-64">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-700">Name of bank</label>
                      <input
                        {...register('name', {
                          required: 'Required',
                          minLength: { value: 2, message: 'Too Short!' },
                          maxLength: { value: 20, message: 'Too Long!' },
                        })}
                        className={cn(
                          'w-full rounded-md border border-slate-300 p-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-500',
                          errors.name && 'border-red-500 focus:ring-red-500'
                        )}
                        placeholder="Enter bank name"
                      />
                      {errors.name && (
                        <span className="text-[10px] font-semibold text-red-500">
                          {errors.name.message}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-700">Location</label>
                      <select
                        {...register('location', { required: true })}
                        className="w-full rounded-md border border-slate-300 p-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-500"
                      >
                        {LOCATIONS.Trader.map((label) => (
                          <option key={label} value={label}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-700">Avatar</label>
                      <Controller
                        control={control}
                        name="imgPathAvatar"
                        render={({ field }) => (
                          <LogoSelector
                            avatarOptions={Object.values(AVATARS)}
                            colorsMap={LOGO_SELECTOR_COLORS_MAP}
                            color={watchColor}
                            value={field.value}
                            onChange={field.onChange}
                            fallbackSrc="/avatars/avatar_placeholder.png"
                          />
                        )}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-700">Color</label>
                      <select
                        {...register('color', { required: true })}
                        className="w-full rounded-md border border-slate-300 p-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-500"
                      >
                        {Object.keys(COLORS).map((label) => (
                          <option key={label} value={label}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className={{ root: 'w-full mt-2' }}
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
