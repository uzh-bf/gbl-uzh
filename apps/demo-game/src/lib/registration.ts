import * as yup from 'yup'
import type { MessageKey } from '../i18n/catalogs'
import { AVATARS, LOCATIONS } from './constants'

export const bankSetupSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required('shared.validation.bankNameRequired')
    .min(2, 'shared.validation.nameTooShort')
    .max(20, 'shared.validation.nameTooLong'),
  avatar: yup
    .string()
    .oneOf(
      Object.entries(AVATARS)
        .filter(([key]) => key !== 'avatar_placeholder')
        .map(([, value]) => value)
    )
    .required(),
  location: yup.string().oneOf(LOCATIONS.Trader).required(),
})

export const RegistrationSchema = yup.object({
  name: bankSetupSchema.fields.name,
  facts: yup
    .object({
      avatar: bankSetupSchema.fields.avatar,
      location: bankSetupSchema.fields.location,
      color: yup.string().oneOf(['Blue']).default('Blue'),
    })
    .required(),
})

export function registrationError(error: unknown): MessageKey {
  const message = error instanceof Error ? error.message : ''
  if (message.includes('REGISTRATION_CLOSED'))
    return 'player.registration.closedHelp'
  if (message.includes('REGISTRATION_FULL'))
    return 'player.registration.fullHelp'
  if (message.includes('INVALID_REGISTRATION_LINK'))
    return 'player.registration.invalidLink'
  if (message.includes('REGISTRATION_SESSION_REQUIRED'))
    return 'player.registration.cookiesRequired'
  return 'player.registration.joinError'
}
