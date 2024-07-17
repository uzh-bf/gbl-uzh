import { useMutation, useQuery } from '@apollo/client'
import {
  CreateGameDocument,
  GameDataFragmentDoc,
  GamesDocument,
} from 'src/graphql/generated/ops'

//import { CreateGameDocument, GameDataFragmentDoc, GamesDocument } from '@gbl-uzh/platform/dist/generated/ops'
import { Button, FormikTextField } from '@uzh-bf/design-system'
import { Form, Formik } from 'formik'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'

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

  if (loading || !data) {
    return <div>loading...</div>
  }

  if (error) {
    return <div>{error.message}</div>
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

      <Formik
        initialValues={{
          name: '',
          playerCount: 1,
        }}
        onSubmit={async (variables, { resetForm }) => {
          await createGame({ variables })
          resetForm()
        }}
      >
        {() => (
          <Form className="rounded border p-4">
            <FormikTextField
              name="name"
              label="Name"
              data={{ cy: 'game-name' }}
            />
            <FormikTextField
              name="playerCount"
              type="number"
              min={1}
              label="Player Count"
              data={{ cy: 'game-player-count' }}
            />
            <Button type="submit" data={{ cy: 'create-game' }}>
              Create Game
            </Button>
          </Form>
        )}
      </Formik>

      <div className="mt-4 flex flex-col gap-1">
        {[...data.games]
          .sort((gameA, gameB) => Number(gameB.id) - Number(gameA.id))
          .map((game, index, array) => {
            return (
              <div className="flex w-96 border p-2" key={game?.id}>
                <div className="w-10 pr-2 text-right">
                  {array.length - index}.
                </div>
                <Link
                  className="flex w-full flex-col justify-between"
                  href={`/admin/games/${game?.id}`}
                >
                  <div>{game?.name}</div>
                  <div className="flex gap-x-4 text-sm">
                    <div>Id: {game?.id}</div>
                    <div>Active period: {game?.activePeriodIx}</div>
                    <div>Status: {game?.status}</div>
                  </div>
                </Link>
              </div>
            )
          })}
      </div>
    </div>
  )
}

export default Games
