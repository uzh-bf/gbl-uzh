import { useMutation } from '@apollo/client'
import { QRCodeSVG } from 'qrcode.react'
import { useState, useSyncExternalStore } from 'react'
import { SetRegistrationOpenDocument } from '~/graphql/generated/ops'
import { Button, Modal } from './AdminControls'

// The origin is immutable for this document; the empty server snapshot keeps hydration consistent.
const subscribeOrigin = () => () => {}
const getOrigin = () => window.location.origin
const getServerOrigin = () => ''

export default function RegistrationPanel({
  game,
  onChange,
}: {
  game: {
    id: string
    name: string
    registrationMode: string
    registrationToken?: string | null
    registrationOpen: boolean
    status: string
    playerCount: number
    maxPlayers?: number | null
  }
  onChange: () => unknown
}) {
  const origin = useSyncExternalStore(
    subscribeOrigin,
    getOrigin,
    getServerOrigin
  )
  const [projecting, setProjecting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState('')
  const [toggle, { loading, error }] = useMutation(
    SetRegistrationOpenDocument,
    {
      onCompleted: () => {
        void onChange()
      },
    }
  )
  if (game.registrationMode !== 'SHARED_LINK' || !game.registrationToken)
    return null
  const url = `${origin}/join/game/${game.registrationToken}`
  const open = game.status === 'SCHEDULED' && game.registrationOpen
  const full = game.maxPlayers != null && game.playerCount >= game.maxPlayers
  const qr = (size: number) => (
    <QRCodeSVG
      data-cy="registration-qr"
      value={url}
      size={size}
      marginSize={4}
      title={`Join ${game.name}`}
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  )
  return (
    <section
      aria-labelledby="registration-heading"
      className="my-4 rounded border bg-white p-4"
      data-cy="registration-panel"
    >
      <h2 id="registration-heading" className="text-xl font-semibold">
        Player registration
      </h2>
      <p role="status">
        {open ? (full ? 'Full' : 'Open') : 'Closed'} · {game.playerCount}
        {game.maxPlayers != null ? ` / ${game.maxPlayers}` : ''} players joined
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        {origin && qr(180)}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <label htmlFor="registration-link">Shared registration link</label>
          <input
            id="registration-link"
            readOnly
            value={origin ? url : ''}
            className="w-full rounded border p-2"
            onFocus={(event) => event.target.select()}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(url)
                  setCopied(true)
                  setCopyError('')
                } catch {
                  setCopyError('Select and copy the link above.')
                }
              }}
            >
              {copied ? 'Link copied' : 'Copy link'}
            </Button>
            <Button onClick={() => setProjecting(true)}>Show QR code</Button>
            <Button
              disabled={loading || game.status !== 'SCHEDULED'}
              onClick={() =>
                void toggle({
                  variables: { gameId: Number(game.id), open: !open },
                }).catch(() => {})
              }
            >
              {open ? 'Close registration' : 'Open registration'}
            </Button>
          </div>
          {copyError && <p role="status">{copyError}</p>}
          {error && (
            <p role="alert">Couldn’t change registration. Please try again.</p>
          )}
        </div>
      </div>
      <Modal
        open={projecting}
        onClose={() => setProjecting(false)}
        title={`Join ${game.name}`}
      >
        <div className="flex flex-col items-center gap-4 p-4">
          {origin && qr(480)}
          <p className="text-center break-all">{url}</p>
          <Button onClick={() => setProjecting(false)}>Close</Button>
        </div>
      </Modal>
    </section>
  )
}
