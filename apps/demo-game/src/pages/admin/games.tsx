import { useMutation, useQuery } from '@apollo/client'
import {
  CreateGameDocument,
  GameDataFragmentDoc,
  GamesDocument,
} from 'src/graphql/generated/ops'
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
          <Form className="p-4 border rounded">
            <FormikTextField name="name" label="Name" />
            <FormikTextField
              name="playerCount"
              type="number"
              min={1}
              label="Player Count"
            />
            <Button type="submit">Create Game</Button>
          </Form>
        )}
      </Formik>

      <div className="grid grid-cols-10 gap-1 mt-4">
        {data.games.map((game) => (
          <div className="p-2 border" key={game?.id}>
            <Link href={`/admin/games/${game?.id}`}>
              {game?.name} {game?.activePeriodIx}
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Games
