import { useState } from 'react'

export default function ReturnLink({ token }: { token?: string | null }) {
  const [copied, setCopied] = useState(false)
  const [fallback, setFallback] = useState('')
  if (!token) return null
  return (
    <section
      className="border-player-border tablet:p-3 border-b p-4"
      aria-label="Return to your bank"
    >
      <button
        className="text-player-primary min-h-[44px] font-semibold underline"
        onClick={async () => {
          const url = `${window.location.origin}/join/${token}`
          try {
            await navigator.clipboard.writeText(url)
            setCopied(true)
          } catch {
            setFallback(url)
          }
        }}
      >
        {copied ? 'Return link copied' : 'Copy my return link'}
      </button>
      <p className="text-player-muted text-sm">
        Save this private link to reopen your bank on another device. Anyone
        with it can access your bank.
      </p>
      {fallback && (
        <input
          aria-label="My return link"
          readOnly
          value={fallback}
          onFocus={(event) => event.target.select()}
          className="mt-2 w-full rounded border p-2"
        />
      )}
    </section>
  )
}
