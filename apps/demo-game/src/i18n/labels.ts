import type { MessageKey } from '~/i18n/catalogs'
import { cantonNames } from '../lib/constants'

const cantonKeys: Partial<Record<string, MessageKey>> = {
  FR: 'shared.cantons.fr',
  GE: 'shared.cantons.ge',
  NE: 'shared.cantons.ne',
  TI: 'shared.cantons.ti',
  VD: 'shared.cantons.vd',
}
export function cantonLabel(t: (key: MessageKey) => string, code: string) {
  const key = cantonKeys[code]
  return key ? t(key) : (cantonNames[code] ?? code)
}

export const statusKeys = {
  PREPARATION: 'manage.status.preparation',
  SCHEDULED: 'manage.status.scheduled',
  RUNNING: 'manage.status.running',
  PAUSED: 'manage.status.paused',
  CONSOLIDATION: 'manage.status.consolidation',
  RESULTS: 'manage.status.results',
  COMPLETED: 'manage.status.completed',
} as const
