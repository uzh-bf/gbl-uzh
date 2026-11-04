import type { TranslationValues } from 'next-intl'
import { useLocale, useTranslations } from 'next-intl'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useSyncExternalStore, type ReactNode } from 'react'
import type { Language, MessageKey } from './catalogs'
import { detectLanguage, languageKey, languageTools } from './locale'

const preferenceChanged = 'demo-game-language-changed'
let memoryChoice: Language | null = null

function preferredLanguage() {
  const saved = memoryChoice
  try {
    return detectLanguage(
      saved ?? localStorage.getItem(languageKey),
      navigator.languages
    )
  } catch {
    return detectLanguage(saved, navigator.languages)
  }
}

function choose(next: Language) {
  try {
    localStorage.setItem(languageKey, next)
    memoryChoice = null
  } catch {
    memoryChoice = next
  }
  window.dispatchEvent(new Event(preferenceChanged))
}

function subscribe(notify: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (!event.key || event.key === languageKey) notify()
  }
  window.addEventListener('storage', onStorage)
  window.addEventListener('languagechange', notify)
  window.addEventListener(preferenceChanged, notify)
  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener('languagechange', notify)
    window.removeEventListener(preferenceChanged, notify)
  }
}

export function useBrowserLanguage() {
  return useSyncExternalStore(subscribe, preferredLanguage, () => 'en' as const)
}

export function useLanguage() {
  return languageTools(useLocale())
}

export function MessageText({
  message,
  values,
}: {
  message: MessageKey
  values?: TranslationValues
}) {
  const t = useTranslations()
  return t(message, values)
}

export function LanguageSwitch({ showLabel = false }: { showLabel?: boolean }) {
  const language = useLocale()
  const t = useTranslations()
  return (
    <label className="font-player inline-flex items-center gap-2 text-[14px] text-slate-700">
      {showLabel && t('shared.actions.language')}
      <select
        data-cy="language-switch"
        aria-label={t('shared.actions.language')}
        value={language}
        onChange={(event) => choose(event.target.value === 'de' ? 'de' : 'en')}
        className="min-w-[84px] cursor-pointer rounded border border-slate-300 bg-white px-2 py-1"
      >
        <option lang="en" value="en">
          English
        </option>
        <option lang="de-CH" value="de">
          Deutsch
        </option>
      </select>
    </label>
  )
}

const pageTitles: Record<string, MessageKey> = {
  '/': 'auth.title',
  '/admin/login': 'auth.title',
  '/admin/games': 'manage.games.title',
  '/admin/games/[id]': 'manage.games.title',
  '/admin/dice/[id]/[...roll]': 'manage.dice.title',
  '/admin/reports/[id]': 'manage.report.title',
  '/join/[token]': 'manage.registration.title',
  '/join/game/[token]': 'manage.registration.title',
  '/play/welcome': 'player.setup.bank',
  '/play/cockpit': 'player.setup.bank',
}

export function LanguageLayout({ children }: { children: ReactNode }) {
  const { pathname } = useRouter()
  const { locale } = useLanguage()
  const t = useTranslations()
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])
  const title = pageTitles[pathname]
  return (
    <>
      <Head>
        {title && (
          <title>
            {title === 'auth.title' ? t(title) : `${t(title)} · StartInvest`}
          </title>
        )}
      </Head>
      {pathname !== '/play/cockpit' && (
        <div className="mx-auto flex h-[36px] max-w-[1440px] items-center justify-end px-[12px]">
          <LanguageSwitch />
        </div>
      )}
      {children}
    </>
  )
}
