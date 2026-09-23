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
import { AVATARS, COLORS, LOCATIONS } from 'src/lib/constants'
import { useToast } from '~/components/ui/use-toast'
import { trpc } from '~/lib/trpc'

function getPlayerFacts(value: unknown): Record<string, string> {
  return typeof value === 'object' && value !== null
    ? (value as Record<string, string>)
    : {}
}

function Welcome() {
  const router = useRouter()
  const { toast } = useToast()

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
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const playerFacts = getPlayerFacts(player?.facts)

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      color: Object.keys(COLORS)[0],
      location: LOCATIONS.Trader[0],
      imgPathAvatar: '/avatars/avatar_placeholder.png',
    },
    values: player
      ? {
          name: player.name,
          color: playerFacts.color ?? Object.keys(COLORS)[0],
          location: playerFacts.location ?? LOCATIONS.Trader[0],
          imgPathAvatar:
            playerFacts.avatar ?? '/avatars/avatar_placeholder.png',
        }
      : undefined,
  })

  const watchColor = watch('color')
  const watchName = watch('name')
  const watchLocation = watch('location')
  const watchAvatar = watch('imgPathAvatar')

  if (isPlayerLoading) return null
  if (playerError) return `Error! ${playerError.message}`
  if (!player) {
    return 'No player data found - user may not be authenticated'
  }

  const gameName = 'Minigame'

  const onSubmit = async (values: {
    name: string
    color: string
    location: string
    imgPathAvatar: string
  }) => {
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
      setIsSubmitting(false)
      toast({
        title: 'Could not save your setup',
        description:
          error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      })
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
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Name of bank
                      </label>
                      <input
                        {...register('name', {
                          required: 'Required',
                          minLength: { value: 2, message: 'Too Short!' },
                          maxLength: { value: 20, message: 'Too Long!' },
                        })}
                        className={cn(
                          'w-full rounded-md border border-slate-300 bg-white p-2 text-sm focus:ring-2 focus:ring-slate-500 focus:outline-none',
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
                      <label className="text-xs font-semibold text-slate-700">
                        Location
                      </label>
                      <select
                        {...register('location', { required: true })}
                        className="w-full rounded-md border border-slate-300 bg-white p-2 text-sm focus:ring-2 focus:ring-slate-500 focus:outline-none"
                      >
                        {LOCATIONS.Trader.map((label) => (
                          <option key={label} value={label}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>

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

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Color
                      </label>
                      <select
                        {...register('color', { required: true })}
                        className="w-full rounded-md border border-slate-300 bg-white p-2 text-sm focus:ring-2 focus:ring-slate-500 focus:outline-none"
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
