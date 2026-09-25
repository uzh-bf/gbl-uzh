import { cn } from '@gbl-uzh/ui'
import { useFormik } from 'formik'
import { ArrowLeft, Info, MapPin, UserRound } from 'lucide-react'
import Image from 'next/image'
import { useRef, useState, type ReactElement } from 'react'
import type { SelfQuery } from 'src/graphql/generated/ops'
import { AVATARS, COLORS, LOCATIONS, cantonNames } from 'src/lib/constants'
import * as yup from 'yup'
import { ALLOCATION_KEYS } from '~/lib/allocation'
import { assetLabels } from '~/lib/constants'
import { parseFacts } from '~/lib/facts'
import OptionPicker, { type Option } from './OptionPicker'
import {
  WelcomeActionButton,
  WelcomePickerTrigger,
  WelcomeTextButton,
  WelcomeTextInput,
} from './WelcomeControls'

const avatarNames: Record<string, string> = {
  sparbaer: 'Bear',
  sparbulle: 'Bull',
  sparfalken: 'Falcon',
  spargecko: 'Gecko',
  spargeier: 'Vulture',
  sparhai: 'Shark',
  sparheuschrecke: 'Locust',
  sparhund_1: 'Dog 1',
  sparhund_2: 'Dog 2',
  sparhund_3: 'Dog 3',
  sparmaeuse: 'Mice',
  sparpegasus: 'Pegasus',
  sparschaf: 'Sheep',
  sparschwein: 'Pig',
}

const steps = {
  intro: {
    title: 'You just won the lottery',
    description:
      "You picked five correct numbers. After spending a little, CHF 10'000 is left and you want to invest it.",
  },
  setup: {
    title: 'Set up your bank',
    description: 'Three things to choose. Make your bank your own.',
  },
  review: {
    title: 'Your bank',
    description: 'Check it once, then start.',
  },
}

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
  const [step, setStep] = useState<keyof typeof steps>('intro')
  const [submitError, setSubmitError] = useState('')
  const content = useRef<HTMLElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const nameInput = useRef<HTMLInputElement>(null)
  const facts = parseFacts(player.facts)
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
    <div className="font-player text-player-text min-[721px]:border-player-input mobile:app-body mx-auto flex h-dvh max-w-[720px] flex-col bg-white text-[16px] leading-[1.5] min-[721px]:border-x">
      <header className="border-player-input mobile:gap-app-3 mobile:px-app-4 mobile:py-app-3 flex min-h-[54px] shrink-0 items-center justify-between gap-[12px] border-b px-[16px] py-[12px] min-[721px]:px-[32px]">
        <div className="mobile:gap-app-3 flex min-w-0 items-baseline gap-[10px]">
          <strong className="mobile:app-body text-[18px]">Minigame</strong>
          <span className="text-player-muted truncate" title={player.game.name}>
            {player.game.name}
          </span>
        </div>
        <span
          className={cn(
            'mobile:px-app-3 mobile:py-app-1 mobile:app-caption shrink-0 rounded-[5px] px-[11px] py-[3px] text-[13px] font-bold',
            step === 'review'
              ? 'bg-player-success-surface text-player-success'
              : 'bg-player-border'
          )}
          aria-live="polite"
        >
          {step === 'review'
            ? 'Complete'
            : `Step ${step === 'intro' ? 1 : 2} of 2`}
        </span>
      </header>
      <form
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={form.handleSubmit}
        noValidate
      >
        <main
          ref={content}
          className="mobile:p-app-4 flex-1 overflow-y-auto p-[16px] min-[721px]:px-[32px] min-[721px]:py-[28px]"
        >
          {step === 'intro' && (
            <Image
              className="border-player-input mobile:mb-app-3 mb-[14px] aspect-[2/1] h-auto w-full rounded-[12px] border object-cover"
              src="/images/welcome.jpg"
              alt="A winning lottery ticket surrounded by coins and a piggy bank"
              width={720}
              height={360}
              sizes="(max-width: 720px) calc(100vw - 32px), 654px"
              loading="eager"
            />
          )}
          <h1
            ref={heading}
            tabIndex={-1}
            className="mobile:mb-app-2 mobile:app-heading m-0 mb-[8px] text-[24px] leading-[1.25] font-bold tracking-[-0.3px] focus:outline-none"
          >
            {steps[step].title}
          </h1>
          <p className="text-player-body m-0 leading-[1.65]">
            {steps[step].description}
          </p>
          {step === 'intro' ? (
            <>
              <section
                className="border-player-primary mobile:mt-app-4 mobile:mb-app-3 mobile:pl-app-3 mt-[16px] mb-[14px] border-l-[3px] pl-[14px]"
                aria-labelledby="your-task"
              >
                <h2
                  id="your-task"
                  className="text-player-muted mobile:mb-app-2 mobile:app-caption m-0 mb-[5px] text-[13px] font-bold tracking-[1px] uppercase"
                >
                  Your task
                </h2>
                <p className="m-0 leading-[1.6]">
                  Decide how much goes into savings, bonds and stocks. You
                  repeat that decision every segment.
                </p>
              </section>
              <ul className="mobile:mb-app-3 mobile:gap-app-2 m-0 mb-[14px] grid list-none gap-[8px] p-0">
                {ALLOCATION_KEYS.map((key) => {
                  const { name, risk, color } = assetLabels[key]
                  return (
                    <li
                      key={name}
                      className="border-player-input mobile:gap-app-3 mobile:px-app-3 mobile:py-app-3 grid grid-cols-[10px_78px_1fr] items-center gap-[10px] rounded-[12px] border px-[12px] py-[11px]"
                    >
                      <i className={cn('size-[10px] rounded-[2px]', color)} />
                      <strong>{name}</strong>
                      <span className="text-player-muted">{risk}</span>
                    </li>
                  )
                })}
              </ul>
              <p className="text-player-muted mobile:app-caption m-0 text-[14px] leading-[1.65]">
                Savings pay 0.2% a month. Bonds and stocks follow the market
                expectation, simulated by two dice.
              </p>
            </>
          ) : step === 'setup' ? (
            <>
              <div className="mobile:mt-app-4 mobile:gap-app-3 mt-[20px] grid gap-[20px]">
                <div className="mobile:gap-app-2 flex flex-col gap-[8px]">
                  <label className="font-bold" htmlFor="bank-name">
                    Bank name
                  </label>
                  <WelcomeTextInput
                    ref={nameInput}
                    id="bank-name"
                    {...form.getFieldProps('name')}
                    placeholder="e.g. Team 1"
                    autoComplete="organization"
                    aria-invalid={Boolean(
                      form.touched.name && form.errors.name
                    )}
                    aria-describedby="bank-name-help bank-name-error"
                  />
                  <p
                    id="bank-name-help"
                    className="text-player-muted mobile:mt-app-2 mobile:app-caption m-0 mt-[6px] text-[14px] leading-[1.65]"
                  >
                    Shown on the ranking and the projector.
                  </p>
                  <p
                    id="bank-name-error"
                    className="text-player-invalid mobile:app-caption m-0 text-[14px] empty:hidden"
                    aria-live="polite"
                  >
                    {form.touched.name && form.errors.name}
                  </p>
                </div>
                <div className="mobile:gap-app-2 flex flex-col gap-[8px]">
                  <span className="font-bold" id="avatar-label">
                    Avatar
                  </span>
                  {avatarPicker(
                    <WelcomePickerTrigger
                      labelId="avatar-label"
                      valueId="avatar-value"
                      icon={
                        avatar?.value ? (
                          <Image
                            src={avatar.value}
                            alt=""
                            className="size-[32px] rounded-[6px] object-cover"
                            width={32}
                            height={32}
                          />
                        ) : (
                          <UserRound
                            aria-hidden="true"
                            className="w-[20px] shrink-0"
                          />
                        )
                      }
                    >
                      {avatar?.label ?? 'Choose an animal'}
                    </WelcomePickerTrigger>
                  )}
                </div>
                <div className="mobile:gap-app-2 flex flex-col gap-[8px]">
                  <span className="font-bold" id="location-label">
                    Location
                  </span>
                  {locationPicker(
                    <WelcomePickerTrigger
                      labelId="location-label"
                      valueId="location-value"
                      icon={
                        <MapPin
                          aria-hidden="true"
                          className="w-[20px] shrink-0"
                        />
                      }
                    >
                      {location?.label ?? 'Choose a canton'}
                    </WelcomePickerTrigger>
                  )}
                </div>
              </div>
              <div className="border-player-input mobile:mt-app-4 mobile:gap-app-3 mobile:pt-app-4 mt-[24px] flex items-center justify-between gap-[14px] border-t pt-[16px]">
                <div>
                  <span className="text-player-body mobile:app-caption text-[14px]">
                    Starting capital
                  </span>
                  <strong className="mobile:app-value block text-[22px] leading-[1.3] whitespace-nowrap">
                    10&apos;000.00 CHF
                  </strong>
                </div>
                <span className="text-player-body mobile:app-caption text-right text-[14px]">
                  Same for every team
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="border-player-input mobile:mt-app-4 mobile:mb-app-4 mobile:gap-app-3 mobile:px-app-4 mobile:py-app-4 mt-[18px] mb-[16px] flex items-center gap-[14px] rounded-[16px] border px-[20px] py-[15px] shadow-[0_1px_3px_#00000014]">
                {avatar?.value && (
                  <Image
                    src={avatar.value}
                    alt=""
                    width={56}
                    height={56}
                    className="size-[56px] rounded-[12px] object-cover"
                  />
                )}
                <div className="min-w-0">
                  <strong className="mobile:app-heading text-[20px] [overflow-wrap:anywhere]">
                    {form.values.name.trim()}
                  </strong>
                  <p className="text-player-muted mobile:app-caption m-0 text-[14px]">
                    {avatar?.label} · HQ {location?.label}
                  </p>
                  <p className="text-player-muted mobile:app-caption m-0 text-[14px]">
                    10&apos;000.00 CHF to invest
                  </p>
                </div>
              </div>
              <div className="mobile:gap-app-2 grid gap-[8px]">
                {[
                  {
                    label: 'Bank name',
                    value: form.values.name.trim(),
                  },
                  {
                    label: 'Avatar',
                    value: avatar?.label,
                    picker: avatarPicker,
                  },
                  {
                    label: 'Location',
                    value: location?.label,
                    picker: locationPicker,
                  },
                ].map(({ label, value, picker }) => {
                  const editButton = (
                    <WelcomeTextButton
                      aria-label={`Edit ${label.toLowerCase()}`}
                      disabled={form.isSubmitting}
                      onClick={picker ? undefined : () => goTo('setup', true)}
                    >
                      Edit
                    </WelcomeTextButton>
                  )
                  return (
                    <div
                      key={label}
                      className="border-player-input mobile:gap-app-3 mobile:px-app-3 mobile:py-app-2 flex min-h-[54px] items-center gap-[10px] rounded-[12px] border px-[14px] py-[5px]"
                    >
                      <span className="flex-1">{label}</span>
                      <strong className="max-w-[48%] text-right [overflow-wrap:anywhere]">
                        {value}
                      </strong>
                      {picker ? picker(editButton) : editButton}
                    </div>
                  )
                })}
              </div>
              <div className="border-player-input text-player-body mobile:mt-app-4 mobile:gap-app-3 mobile:p-app-3 mt-[16px] flex gap-[12px] rounded-[12px] border p-[14px]">
                <Info
                  aria-hidden="true"
                  className="text-player-primary mobile:mt-app-1 mt-[3px] w-[18px] shrink-0"
                />
                <p className="m-0">
                  {player.game.status === 'SCHEDULED' ||
                  player.game.status === 'PREPARATION'
                    ? 'Starting now puts you in the waiting room until the instructor opens segment 1.'
                    : 'Your game is already underway. Start now to open your bank’s Decisions tab.'}
                </p>
              </div>
            </>
          )}
        </main>
        <footer className="border-player-input mobile:px-app-4 mobile:pt-app-3 shrink-0 border-t bg-white px-[16px] pt-[12px] pb-[max(12px,env(safe-area-inset-bottom))] min-[721px]:px-[32px]">
          {submitError && (
            <p
              role="alert"
              className="text-player-invalid mobile:mb-app-3 mobile:app-caption m-0 mb-[10px] text-[14px] empty:hidden"
            >
              {submitError}
            </p>
          )}
          <div className="mobile:gap-app-3 flex items-center gap-[12px]">
            {step === 'intro' ? (
              <>
                <div
                  className="mobile:gap-app-2 flex gap-[5px]"
                  aria-hidden="true"
                >
                  <i className="bg-player-primary size-[7px] rounded-full" />
                  <i className="bg-player-progress-done size-[7px] rounded-full" />
                  <i className="bg-player-progress size-[7px] rounded-full" />
                </div>
                <WelcomeActionButton
                  type="button"
                  onClick={() => goTo('setup')}
                >
                  Set up your bank
                </WelcomeActionButton>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="border-player-input text-player-primary focus-visible:outline-player-primary grid min-h-[48px] min-w-[44px] cursor-pointer place-items-center rounded-[6px] border bg-white focus-visible:outline-2 focus-visible:outline-offset-[3px]"
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
                <WelcomeActionButton
                  type="submit"
                  disabled={!canContinue || form.isSubmitting}
                  className="flex-1"
                >
                  {form.isSubmitting
                    ? 'Starting…'
                    : step === 'setup'
                      ? 'Review your bank'
                      : 'Start the game'}
                </WelcomeActionButton>
              </>
            )}
          </div>
          {step === 'setup' && !canContinue && (
            <p className="text-player-muted mobile:mt-app-2 mobile:app-caption m-0 mt-[8px] text-center text-[14px]">
              Choose all three to continue
            </p>
          )}
        </footer>
      </form>
    </div>
  )
}
