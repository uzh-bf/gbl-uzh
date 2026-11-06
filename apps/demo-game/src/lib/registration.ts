import * as yup from 'yup'
import { AVATARS, LOCATIONS } from './constants'

export const bankSetupSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required('Enter a bank name.')
    .min(2, 'Use at least 2 characters.')
    .max(20, 'Use no more than 20 characters.'),
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

export function registrationError(error: unknown) {
  const message = error instanceof Error ? error.message : ''
  if (message.includes('REGISTRATION_CLOSED'))
    return 'Registration is closed. Ask your instructor if you need help.'
  if (message.includes('REGISTRATION_FULL'))
    return 'This game is full. Ask your instructor if you need help.'
  if (message.includes('INVALID_REGISTRATION_LINK'))
    return 'This registration link is invalid.'
  if (message.includes('REGISTRATION_SESSION_REQUIRED'))
    return 'Allow cookies and reload this page to join. Your browser needs cookies to remember your entry.'
  return 'We couldn’t join the game. Please try again. Your choices are still here.'
}
