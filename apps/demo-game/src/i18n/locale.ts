import type { Language } from './catalogs'

export const languageKey = 'demo-game.language'

export function detectLanguage(
  saved: string | null,
  preferred: readonly string[]
): Language {
  if (saved === 'en' || saved === 'de') return saved
  for (const tag of preferred) {
    const base = tag.toLowerCase().split('-')[0]
    if (base === 'en' || base === 'de') return base
  }
  return 'en'
}

function makeLanguageTools(language: Language) {
  const locale = language === 'de' ? 'de-CH' : 'en-CH'
  const amount = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  function formatAmount(value: number) {
    const formatted = amount.format(value)
    return language === 'en' ? formatted.replace(/[,’]/g, "'") : formatted
  }
  function playerAmount(value: number | null, signed = false) {
    if (value === null) return '—'
    const rounded = Math.abs(value) < 0.005 ? 0 : value
    return (signed && rounded > 0 ? '+' : '') + formatAmount(rounded)
  }
  const percentSign = language === 'de' ? ' %' : '%'
  function percent(value: number, digits: number, signed = false) {
    const fixed = (value * 100).toFixed(digits)
    return (
      (signed && Number(fixed) > 0 ? '+' : '') +
      (Number(fixed) === 0 ? (0).toFixed(digits) : fixed) +
      percentSign
    )
  }
  const count = new Intl.NumberFormat(locale)
  const compact = new Intl.NumberFormat(locale, {
    notation: 'compact',
    maximumFractionDigits: 2,
  })
  const integer = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 })
  const share = (value: number) => count.format(value) + percentSign
  const shortMonth = new Intl.DateTimeFormat(
    language === 'en' ? 'en-US' : locale,
    {
      month: 'short',
      timeZone: 'UTC',
    }
  )
  return {
    language,
    locale,
    share,
    compact: (value: number) => compact.format(value).replace('K', 'k'),
    integer: (value: number) => integer.format(value),
    count: (value: number) => count.format(value),
    shortMonth: (index: number) =>
      shortMonth.format(new Date(Date.UTC(2000, index, 1))),
    playerAmount,
    // Allocation previews round to cents before applying Swiss digit grouping.
    formatCHF: (value: number) =>
      formatAmount(Number(value.toFixed(2))) + ' CHF',
    percent,
    signedPercent: (value: number, digits = 1) => percent(value, digits, true),
    playerPercent: (value: number | null) =>
      value === null ? '—' : playerAmount(value * 100, true) + percentSign,
    reportPercent: (value: number | null) =>
      value === null ? '—' : percent(Math.round(value * 1000) / 1000, 1, true),
  }
}

const toolsByLanguage = {
  en: makeLanguageTools('en'),
  de: makeLanguageTools('de'),
}
export const languageTools = (language: Language) => toolsByLanguage[language]
