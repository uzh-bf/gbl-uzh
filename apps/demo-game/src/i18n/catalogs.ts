import type { MessageKeys, NestedKeyOf } from 'next-intl'
import de from './messages/de'
import en from './messages/en'

export const catalogs = { en, de }
export type Language = keyof typeof catalogs
export type MessageKey = MessageKeys<typeof en, NestedKeyOf<typeof en>>

declare module 'next-intl' {
  interface AppConfig {
    Locale: Language
    Messages: typeof en
  }
}
