import { useTranslations } from 'next-intl'
import { useState } from 'react'

export default function ReturnLink({ token }: { token?: string | null }) {
  const t = useTranslations()
  const [copied, setCopied] = useState(false)
  const [fallback, setFallback] = useState('')
  if (!token) return null
  return (
    <section
      className="border-player-border tablet:p-3 border-b p-4"
      aria-label={t('player.returnLink.title')}
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
        {copied ? t('player.returnLink.copied') : t('player.returnLink.copy')}
      </button>
      <p className="text-player-muted text-sm">
        {t('player.returnLink.description')}
      </p>
      {fallback && (
        <input
          aria-label={t('player.returnLink.label')}
          readOnly
          value={fallback}
          onFocus={(event) => event.target.select()}
          className="mt-2 w-full rounded border p-2"
        />
      )}
    </section>
  )
}
