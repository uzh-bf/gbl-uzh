import { Button, FormikTextField } from '@uzh-bf/design-system'
import { Form, Formik } from 'formik'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { trpc } from '~/lib/trpc'

function Games() {
  const router = useRouter()
  const utils = trpc.useUtils()

  const session = useSession({
    required: true,
    onUnauthenticated: () => {
      router.push('/admin/login')
    },
  })

  const gamesQuery = trpc.game.list.useQuery()
  const createGame = trpc.game.create.useMutation({
    async onSuccess() {
      await utils.game.list.invalidate()
    },
  })

  if (gamesQuery.isLoading || !gamesQuery.data) {
    return <div>loading...</div>
  }

  if (gamesQuery.error) {
    return <div>{gamesQuery.error.message}</div>
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
          facts: {
            myInt: 1,
          },
        }}
        onSubmit={async (variables, { resetForm }) => {
          await createGame.mutateAsync({
            ...variables,
            // playerCount is edited through a text input, so Formik stores it
            // as a string; parseInt coerces to an integer (Number would let a
            // fractional "1.5" through and fail schema validation).
            playerCount: parseInt(String(variables.playerCount), 10),
          })
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
              step={1}
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
        {gamesQuery.data.map((game) => (
          <Link className="w-96" href={`/admin/games/${game.id}`} key={game.id}>
            <Button
              className={{
                root: 'flex w-full flex-col items-start justify-around',
              }}
            >
              <div className="flex w-full justify-between p-2">
                <div>{game.name}</div>
                <div className="flex w-10">Id: {game.id}</div>
              </div>
              <div className="flex w-full items-end justify-between p-2 text-sm">
                <div className="flex flex-col justify-between gap-y-1 text-left">
                  <div>Player count: {game.playersCount}</div>
                  <div>
                    Active Period/Segment: {game.activePeriodIx}/
                    {game.activeSegmentIx}
                  </div>
                </div>
                <div className="text-right">Status: {game.status}</div>
              </div>
            </Button>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Games
