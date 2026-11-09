import { expect, test } from 'vitest'
import { AVATARS } from './constants'
import { bankSetupSchema, RegistrationSchema } from './registration'

test('registration and welcome share completed bank validation', () => {
  const profile = {
    name: '  Our bank  ',
    avatar: AVATARS.sparbaer,
    location: 'ZH',
  }
  expect(bankSetupSchema.validateSync(profile).name).toBe('Our bank')
  const registered = RegistrationSchema.validateSync({
    name: profile.name,
    facts: { avatar: profile.avatar, location: profile.location },
  })
  expect(registered).toEqual({
    name: 'Our bank',
    facts: { avatar: profile.avatar, location: 'ZH', color: 'Blue' },
  })
  for (const bad of [
    { name: '' },
    { name: 'x'.repeat(21) },
    { avatar: 'invalid' },
    { location: 'invalid' },
  ]) {
    const candidate = { ...profile, ...bad }
    expect(bankSetupSchema.isValidSync(candidate)).toBe(false)
    expect(
      RegistrationSchema.isValidSync({ name: candidate.name, facts: candidate })
    ).toBe(false)
  }
})
