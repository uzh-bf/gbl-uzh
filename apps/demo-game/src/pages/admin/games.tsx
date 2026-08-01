import { useMutation, useQuery } from '@apollo/client'
import { Button } from '@uzh-bf/design-system'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import {
  CreateGameDocument,
  GameDataFragmentDoc,
  GamesDocument,
} from 'src/graphql/generated/ops'
import { AdminInputField } from '~/components/fields/AdminInputField'

interface CreateGameFormValues {
  name: string
  playerCount: number
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
  const [createGame] = useMutation(CreateGameDocument, {
    update(cache, { data: { createGame: createGameResult } }) {
      cache.modify({
        fields: {
          games(existingGames = []) {
            const newGameRef = cache.writeFragment({
              data: createGameResult,
              fragment: GameDataFragmentDoc,
            })
            return [...existingGames, newGameRef]
          },
        },
      })
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateGameFormValues>({
    defaultValues: {
      name: '',
      playerCount: 1,
    },
  })

  if (loading || !data) {
    return <div>loading...</div>
  }

  if (error) {
    return <div>{error.message}</div>
  }

  const onSubmit = async (values: CreateGameFormValues) => {
    try {
      await createGame({
        variables: {
          name: values.name,
          playerCount: parseInt(String(values.playerCount), 10),
          facts: { myInt: 1 },
        },
        refetchQueries: [GamesDocument],
      })
      reset()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="p-4">
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
        className="my-4 flex max-w-md flex-col gap-4 rounded border p-4"
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

        <AdminInputField
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

        <Button
          type="submit"
          data={{ cy: 'create-game' }}
          className={{ root: 'w-max' }}
        >
          Create Game
        </Button>
      </form>

      <div className="mt-4 flex flex-col gap-1">
        {data.games.map((game) => {
          return (
            <Link
              className="w-96 font-medium text-slate-700"
              href={`/admin/games/${game?.id}`}
              key={game?.id}
            >
              <Button
                className={{
                  root: 'flex w-full flex-col items-start justify-around text-left',
                }}
              >
                <div className="flex w-full justify-between p-2">
                  <div>{game?.name}</div>
                  <div className="flex w-10">Id: {game?.id}</div>
                </div>
                <div className="flex w-full items-end justify-between p-2 text-sm">
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
