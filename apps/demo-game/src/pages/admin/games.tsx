import { useMutation, useQuery } from '@apollo/client'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useForm, useWatch } from 'react-hook-form'
import {
  CreateGameDocument,
  GamesDocument,
  RegistrationMode,
} from 'src/graphql/generated/ops'
import { Button } from '~/components/admin/AdminControls'
import { AdminInputField } from '~/components/fields/AdminInputField'

interface CreateGameFormValues {
  name: string
  playerCount: number
  registrationMode: RegistrationMode
  maxPlayers: number | ''
}

function Games() {
  const router = useRouter()

  const session = useSession({
    required: true,
    onUnauthenticated: () => {
      router.push('/admin/login')
    },
  })

  const { data, error, loading } = useQuery(GamesDocument)
  const [createGame, { loading: creating, error: createError }] = useMutation(
    CreateGameDocument,
    { refetchQueries: [GamesDocument] }
  )

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateGameFormValues>({
    shouldUnregister: true,
    defaultValues: {
      name: '',
      playerCount: 1,
      registrationMode: RegistrationMode.SharedLink,
      maxPlayers: '',
    },
  })

  const registrationMode = useWatch({ control, name: 'registrationMode' })

  if (error) return <div role="alert">{error.message}</div>
  if (loading || !data) return <div>loading...</div>

  const onSubmit = async (values: CreateGameFormValues) => {
    try {
      await createGame({
        variables: {
          name: values.name,
          playerCount:
            values.registrationMode === RegistrationMode.Fixed
              ? values.playerCount
              : null,
          registrationMode: values.registrationMode,
          maxPlayers:
            values.registrationMode === RegistrationMode.SharedLink &&
            typeof values.maxPlayers === 'number' &&
            Number.isFinite(values.maxPlayers)
              ? values.maxPlayers
              : null,
          facts: { myInt: 1 },
        },
      })
      reset()
    } catch {
      // The mutation error is shown below; keep the form values for retry.
    }
  }

  return (
    <div className="mobile:app-panel mobile:app-body p-4">
      {session && (
        <Button
          onClick={async () => {
            const data = await signOut({
              redirect: false,
              callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin/games`,
            })
            router.push(data.url)
          }}
        >
          Logout
        </Button>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mobile:app-card mobile:gap-app-3 my-4 flex max-w-md flex-col gap-4 rounded border p-4"
      >
        <AdminInputField
          label="Name"
          name="name"
          register={register}
          error={errors.name}
          required
          placeholder="Game Name"
          testId="game-name"
        />

        <div className="flex flex-col gap-1">
          <label htmlFor="registrationMode">Registration</label>
          <select
            id="registrationMode"
            {...register('registrationMode')}
            className="rounded border p-2"
          >
            <option value="SHARED_LINK">Shared registration link</option>
            <option value="FIXED">Fixed player count</option>
          </select>
        </div>
        {registrationMode === RegistrationMode.Fixed ? (
          <AdminInputField
            key="playerCount"
            label="Player Count"
            name="playerCount"
            type="number"
            register={register}
            error={errors.playerCount}
            required
            min={1}
            step={1}
            testId="game-player-count"
            minMessage="Must be at least 1"
          />
        ) : (
          <AdminInputField
            key="maxPlayers"
            label="Maximum players (optional)"
            name="maxPlayers"
            type="number"
            register={register}
            error={errors.maxPlayers}
            min={1}
            minMessage="Must be at least 1"
            step={1}
            placeholder="No limit"
          />
        )}

        <Button
          type="submit"
          disabled={creating}
          data={{ cy: 'create-game' }}
          className={{ root: 'w-max' }}
        >
          Create Game
        </Button>
        {createError && (
          <p role="alert">Couldn’t create the game. Please try again.</p>
        )}
      </form>

      <div className="mt-4 flex flex-col gap-1">
        {data.games.map((game) => {
          return (
            <Link
              className="mobile:w-full mobile:min-w-0 w-96 font-medium text-slate-700"
              href={`/admin/games/${game?.id}`}
              key={game?.id}
            >
              <Button
                className={{
                  root: 'mobile:app-card mobile:gap-app-2 flex w-full flex-col items-start justify-around text-left',
                }}
              >
                <div className="mobile:gap-app-2 mobile:p-0 flex w-full justify-between p-2">
                  <div className="mobile:min-w-0 mobile:[overflow-wrap:anywhere]">
                    {game?.name}
                  </div>
                  <div className="mobile:shrink-0 flex w-10">
                    Id: {game?.id}
                  </div>
                </div>
                <div className="mobile:app-caption mobile:flex-wrap mobile:gap-app-2 mobile:p-0 flex w-full items-end justify-between p-2 text-sm">
                  <div className="flex flex-col justify-between gap-y-1 text-left">
                    <div>Player count: {game?.playerCount}</div>
                    <div>
                      Active Period/Segment: {game?.activePeriodIx}/
                      {game?.activeSegmentIx}
                    </div>
                  </div>
                  <div className="text-right">Status: {game?.status}</div>
                </div>
              </Button>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default Games
