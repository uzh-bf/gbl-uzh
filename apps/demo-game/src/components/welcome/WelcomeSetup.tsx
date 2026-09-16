import { Button } from '@uzh-bf/design-system'
import { useFormik } from 'formik'
import { ArrowLeft, ChevronRight, Info, MapPin, UserRound } from 'lucide-react'
import Image from 'next/image'
import { useRef, useState, type ReactElement } from 'react'
import type { SelfQuery } from 'src/graphql/generated/ops'
import { AVATARS, COLORS, LOCATIONS } from 'src/lib/constants'
import * as yup from 'yup'
import { avatarNames, cantonNames } from '~/lib/teamIdentity'
import OptionPicker, { type Option } from './OptionPicker'
import styles from './WelcomeSetup.module.css'

const avatars: Option[] = Object.entries(AVATARS)
  .filter(([key]) => key !== 'avatar_placeholder')
  .map(([key, value]) => ({
    value,
    label: avatarNames[key] ?? key,
  }))
const locations: Option[] = LOCATIONS.Trader.map((value) => ({
  value,
  label: `${cantonNames[value]} (${value})`,
}))

// Player facts can arrive as JSON, including legacy double-encoded values.
function parsePlayerFacts(raw: unknown): Record<string, unknown> {
  try {
    let value = raw
    for (let i = 0; i < 2 && typeof value === 'string'; i++)
      value = JSON.parse(value)
    return value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {}
  } catch {
    return {}
  }
}

const schema = yup.object({
  name: yup
    .string()
    .trim()
    .required('Enter a bank name.')
    .min(2, 'Use at least 2 characters.')
    .max(20, 'Use no more than 20 characters.'),
  avatar: yup
    .string()
    .oneOf(avatars.map(({ value }) => value))
    .required(),
  location: yup.string().oneOf(LOCATIONS.Trader).required(),
})

export default function WelcomeSetup({
  player,
  onStart,
}: {
  player: NonNullable<SelfQuery['self']>
  onStart: (name: string, facts: Record<string, unknown>) => Promise<void>
}) {
  const [step, setStep] = useState<'intro' | 'setup' | 'review'>('intro')
  const [submitError, setSubmitError] = useState('')
  const content = useRef<HTMLElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const nameInput = useRef<HTMLInputElement>(null)
  const facts = parsePlayerFacts(player.facts)
  const form = useFormik({
    initialValues: {
      name: player.name ?? '',
      avatar: avatars.find(({ value }) => value === facts.avatar)?.value ?? '',
      location:
        locations.find(({ value }) => value === facts.location)?.value ?? '',
    },
    validationSchema: schema,
    validateOnMount: true,
    onSubmit: async (values) => {
      if (step === 'setup') {
        goTo('review')
        return
      }
      setSubmitError('')
      try {
        await onStart(values.name.trim(), {
          ...facts,
          avatar: values.avatar,
          location: values.location,
          color:
            typeof facts.color === 'string' &&
            Object.hasOwn(COLORS, facts.color)
              ? facts.color
              : 'Blue',
        })
      } catch {
        setSubmitError(
          'We couldn’t save your bank. Please try again. Your choices are still here.'
        )
      }
    },
  })
  const avatar = avatars.find(({ value }) => value === form.values.avatar)
  const location = locations.find(({ value }) => value === form.values.location)
  const canContinue = form.isValid && !form.isValidating

  function goTo(next: typeof step, editName = false) {
    setStep(next)
    setSubmitError('')
    requestAnimationFrame(() => {
      content.current?.scrollTo({ top: 0, behavior: 'instant' })
      const target = editName ? nameInput.current : heading.current
      target?.focus({ preventScroll: true })
    })
  }

  function avatarPicker(trigger: ReactElement) {
    return (
      <OptionPicker
        title="Pick your avatar"
        options={avatars}
        value={form.values.avatar}
        onChange={(value) => void form.setFieldValue('avatar', value)}
      >
        {trigger}
      </OptionPicker>
    )
  }
  function locationPicker(trigger: ReactElement) {
    return (
      <OptionPicker
        title="Where is your bank?"
        options={locations}
        value={form.values.location}
        searchable
        onChange={(value) => void form.setFieldValue('location', value)}
      >
        {trigger}
      </OptionPicker>
    )
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <strong>Minigame</strong>
          <span title={player.game.name}>{player.game.name}</span>
        </div>
        <span
          className={step === 'review' ? styles.complete : styles.step}
          aria-live="polite"
        >
          {step === 'review'
            ? 'Complete'
            : `Step ${step === 'intro' ? 1 : 2} of 2`}
        </span>
      </header>
      <form className={styles.form} onSubmit={form.handleSubmit} noValidate>
        <main ref={content} className={styles.content}>
          {step === 'intro' ? (
            <>
              <Image
                className={styles.hero}
                src="/images/welcome.jpg"
                alt="A winning lottery ticket surrounded by coins and a piggy bank"
                width={720}
                height={360}
                sizes="(max-width: 720px) calc(100vw - 32px), 654px"
                loading="eager"
              />
              <h1 ref={heading} tabIndex={-1}>
                You just won the lottery
              </h1>
              <p className={styles.lead}>
                You picked five correct numbers. After spending a little, CHF
                10&apos;000 is left and you want to invest it.
              </p>
              <section className={styles.task} aria-labelledby="your-task">
                <h2 id="your-task">Your task</h2>
                <p>
                  Decide how much goes into savings, bonds and stocks. You
                  repeat that decision every segment.
                </p>
              </section>
              <ul className={styles.assets}>
                <li>
                  <i className={styles.savings} />
                  <strong>Savings</strong>
                  <span>No risk</span>
                </li>
                <li>
                  <i className={styles.bonds} />
                  <strong>Bonds</strong>
                  <span>Some risk</span>
                </li>
                <li>
                  <i className={styles.stocks} />
                  <strong>Stocks</strong>
                  <span>High risk</span>
                </li>
              </ul>
              <p className={styles.note}>
                Savings pay 0.2% a month. Bonds and stocks follow the market
                expectation, simulated by two dice.
              </p>
            </>
          ) : step === 'setup' ? (
            <>
              <h1 ref={heading} tabIndex={-1}>
                Set up your bank
              </h1>
              <p className={styles.lead}>
                Three things to choose. Make your bank your own.
              </p>
              <div className={styles.fields}>
                <div className={styles.field}>
                  <label htmlFor="bank-name">Bank name</label>
                  <input
                    ref={nameInput}
                    id="bank-name"
                    className={styles.input}
                    {...form.getFieldProps('name')}
                    placeholder="e.g. Team 1"
                    autoComplete="organization"
                    aria-invalid={Boolean(
                      form.touched.name && form.errors.name
                    )}
                    aria-describedby="bank-name-help bank-name-error"
                  />
                  <p id="bank-name-help" className={styles.note}>
                    Shown on the ranking and the projector.
                  </p>
                  <p
                    id="bank-name-error"
                    className={styles.error}
                    aria-live="polite"
                  >
                    {form.touched.name && form.errors.name}
                  </p>
                </div>
                <div className={styles.field}>
                  <span id="avatar-label">Avatar</span>
                  {avatarPicker(
                    <button
                      type="button"
                      className={styles.picker}
                      aria-labelledby="avatar-label avatar-value"
                    >
                      {avatar?.value ? (
                        <Image
                          src={avatar.value}
                          alt=""
                          width={32}
                          height={32}
                        />
                      ) : (
                        <UserRound aria-hidden="true" />
                      )}
                      <span id="avatar-value">
                        {avatar?.label ?? 'Choose an animal'}
                      </span>
                      <ChevronRight aria-hidden="true" />
                    </button>
                  )}
                </div>
                <div className={styles.field}>
                  <span id="location-label">Location</span>
                  {locationPicker(
                    <button
                      type="button"
                      className={styles.picker}
                      aria-labelledby="location-label location-value"
                    >
                      <MapPin aria-hidden="true" />
                      <span id="location-value">
                        {location?.label ?? 'Choose a canton'}
                      </span>
                      <ChevronRight aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
              <div className={styles.capital}>
                <div>
                  <span>Starting capital</span>
                  <strong>10&apos;000.00 CHF</strong>
                </div>
                <span>Same for every team</span>
              </div>
            </>
          ) : (
            <>
              <h1 ref={heading} tabIndex={-1}>
                Your bank
              </h1>
              <p className={styles.lead}>Check it once, then start.</p>
              <div className={styles.bankCard}>
                {avatar?.value && (
                  <Image src={avatar.value} alt="" width={56} height={56} />
                )}
                <div>
                  <strong>{form.values.name.trim()}</strong>
                  <p>
                    {avatar?.label} · HQ {location?.label}
                  </p>
                  <p>10&apos;000.00 CHF to invest</p>
                </div>
              </div>
              <div className={styles.reviewRows}>
                <div>
                  <span>Bank name</span>
                  <strong>{form.values.name.trim()}</strong>
                  <button
                    type="button"
                    className={styles.textButton}
                    aria-label="Edit bank name"
                    disabled={form.isSubmitting}
                    onClick={() => goTo('setup', true)}
                  >
                    Edit
                  </button>
                </div>
                <div>
                  <span>Avatar</span>
                  <strong>{avatar?.label}</strong>
                  {avatarPicker(
                    <button
                      type="button"
                      className={styles.textButton}
                      aria-label="Edit avatar"
                      disabled={form.isSubmitting}
                    >
                      Edit
                    </button>
                  )}
                </div>
                <div>
                  <span>Location</span>
                  <strong>{location?.label}</strong>
                  {locationPicker(
                    <button
                      type="button"
                      className={styles.textButton}
                      aria-label="Edit location"
                      disabled={form.isSubmitting}
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
              <div className={styles.notice}>
                <Info aria-hidden="true" />
                <p>
                  {player.game.status === 'SCHEDULED' ||
                  player.game.status === 'PREPARATION'
                    ? 'Starting now puts you in the waiting room until the instructor opens segment 1.'
                    : 'Your game is already underway. Start now to join your bank’s cockpit.'}
                </p>
              </div>
            </>
          )}
        </main>
        <footer className={styles.footer}>
          {submitError && (
            <p role="alert" className={styles.error}>
              {submitError}
            </p>
          )}
          <div className={styles.footerActions}>
            {step === 'intro' ? (
              <>
                <div className={styles.dots} aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </div>
                <Button
                  type="button"
                  primary
                  className={{ root: styles.primaryButton }}
                  onClick={() => goTo('setup')}
                >
                  Set up your bank
                </Button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className={styles.back}
                  aria-label={
                    step === 'setup'
                      ? 'Back to introduction'
                      : 'Back to bank setup'
                  }
                  disabled={form.isSubmitting}
                  onClick={() => goTo(step === 'setup' ? 'intro' : 'setup')}
                >
                  <ArrowLeft aria-hidden="true" />
                </button>
                <Button
                  type="submit"
                  primary
                  disabled={!canContinue || form.isSubmitting}
                  className={{ root: `${styles.primaryButton} ${styles.grow}` }}
                >
                  {form.isSubmitting
                    ? 'Starting…'
                    : step === 'setup'
                      ? 'Review your bank'
                      : 'Start the game'}
                </Button>
              </>
            )}
          </div>
          {step === 'setup' && !canContinue && (
            <p className={styles.footerHint}>Choose all three to continue</p>
          )}
        </footer>
      </form>
    </div>
  )
}
