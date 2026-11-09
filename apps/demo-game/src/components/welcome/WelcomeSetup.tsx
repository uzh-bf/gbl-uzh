import { cn } from '@gbl-uzh/ui'
import { useFormik } from 'formik'
import { ArrowLeft, Info, MapPin, UserRound } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useRef, useState, type ReactElement } from 'react'
import type { MessageKey } from '~/i18n/catalogs'
import { cantonLabel } from '~/i18n/labels'
import { useLanguage } from '~/i18n/Language'
import { ALLOCATION_KEYS } from '~/lib/allocation'
import {
  assetLabels,
  AVATARS,
  COLORS,
  INITIAL_CAPITAL,
  LOCATIONS,
} from '~/lib/constants'
import { parseFacts } from '~/lib/facts'
import { bankSetupSchema, registrationError } from '~/lib/registration'
import CantonFlagBadge from '../CantonFlagBadge'
import OptionPicker, { type Option } from './OptionPicker'
import WelcomeBankPreview from './WelcomeBankPreview'
import {
  WelcomeActionButton,
  WelcomePickerTrigger,
  WelcomeTextButton,
  WelcomeTextInput,
} from './WelcomeControls'

const avatarNames: Record<
  Exclude<keyof typeof AVATARS, 'avatar_placeholder'>,
  MessageKey
> = {
  sparbaer: 'player.avatars.bear',
  sparbulle: 'player.avatars.bull',
  sparfalken: 'player.avatars.falcon',
  spargecko: 'player.avatars.gecko',
  spargeier: 'player.avatars.vulture',
  sparhai: 'player.avatars.shark',
  sparheuschrecke: 'player.avatars.locust',
  sparhund_1: 'player.avatars.dogOne',
  sparhund_2: 'player.avatars.dogTwo',
  sparhund_3: 'player.avatars.dogThree',
  sparmaeuse: 'player.avatars.mice',
  sparpegasus: 'player.avatars.pegasus',
  sparschaf: 'player.avatars.sheep',
  sparschwein: 'player.avatars.pig',
}

const steps = {
  intro: {
    title: 'player.setup.introTitle',
    description: 'player.setup.introDescription',
  },
  setup: {
    title: 'player.setup.setupTitle',
    description: 'player.setup.setupDescription',
  },
  review: {
    title: 'player.setup.bank',
    description: 'player.setup.reviewDescription',
  },
} as const

export default function WelcomeSetup({
  player,
  onSave,
  onCancel,
  registration = false,
}: {
  player: {
    name?: string
    facts?: unknown
    game: { name: string; status: string }
  }
  registration?: boolean
  onSave: (name: string, facts: Record<string, unknown>) => Promise<void>
  /** Supplying Cancel opens profile editing instead of first-time setup. */
  onCancel?: () => void
}) {
  const t = useTranslations()
  const { language, formatCHF } = useLanguage()
  const locations: Option[] = LOCATIONS.Trader.map((value) => ({
    value,
    label: `${cantonLabel(t, value)} (${value})`,
  }))
  const avatars = Object.entries(avatarNames).map(([key, label]) => ({
    value: AVATARS[key],
    label: t(label),
  }))
  const editing = Boolean(onCancel)
  const [step, setStep] = useState<keyof typeof steps>(
    editing ? 'setup' : 'intro'
  )
  const [submitError, setSubmitError] = useState<MessageKey | ''>('')
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
    validationSchema: bankSetupSchema,
    validateOnMount: true,
    onSubmit: async (values) => {
      if (step === 'setup' && !editing) {
        goTo('review')
        return
      }
      setSubmitError('')
      try {
        await onSave(values.name.trim(), {
          ...facts,
          avatar: values.avatar,
          location: values.location,
          color:
            typeof facts.color === 'string' &&
            Object.hasOwn(COLORS, facts.color)
              ? facts.color
              : 'Blue',
        })
      } catch (error) {
        setSubmitError(
          registration ? registrationError(error) : 'player.setup.saveError'
        )
      }
    },
  })
  const avatar = avatars.find(({ value }) => value === form.values.avatar)
  const location = locations.find(({ value }) => value === form.values.location)
  const canContinue = form.isValid && !form.isValidating
  const submitLabel = editing
    ? t('player.setup.saveChanges')
    : step === 'setup'
      ? t('player.setup.review')
      : registration
        ? t('player.setup.join')
        : t('player.setup.start')

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
        title={t('player.setup.pickAvatar')}
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
        title={t('player.setup.pickLocation')}
        options={locations}
        value={form.values.location}
        searchable
        onChange={(value) => void form.setFieldValue('location', value)}
      >
        {trigger}
      </OptionPicker>
    )
  }

  const stepHeading = (
    <>
      <h1
        ref={heading}
        tabIndex={-1}
        className="mobile:mb-app-2 mobile:app-heading tablet:app-heading m-0 mb-[8px] text-[24px] leading-[1.25] font-bold tracking-[-0.3px] focus:outline-none"
      >
        {editing ? t('player.setup.editBank') : t(steps[step].title)}
      </h1>
      <p className="text-player-body m-0 leading-[1.65]">
        {editing
          ? t('player.setup.editDescription')
          : t(steps[step].description)}
      </p>
    </>
  )

  return (
    <div className="font-player text-player-text min-[721px]:border-player-input mobile:app-body tablet:max-w-[1440px] tablet:app-body mx-auto flex h-[calc(100dvh-36px)] max-w-[720px] flex-col bg-white text-[16px] leading-[1.5] min-[721px]:border-x">
      <header className="border-player-input mobile:gap-app-3 mobile:px-app-4 mobile:py-app-3 tablet:px-[20px] flex min-h-[54px] shrink-0 items-center justify-between gap-[12px] border-b px-[16px] py-[12px] min-[721px]:px-[32px]">
        <div className="mobile:gap-app-3 flex min-w-0 items-baseline gap-[10px]">
          <strong className="mobile:app-body tablet:app-body text-[18px]">
            {t('player.setup.minigame')}
          </strong>
          <span className="text-player-muted truncate" title={player.game.name}>
            {player.game.name}
          </span>
        </div>
        {!editing && (
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
              ? t('player.setup.complete')
              : t('player.setup.step', { step: step === 'intro' ? 1 : 2 })}
          </span>
        )}
      </header>
      <form
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={form.handleSubmit}
        noValidate
      >
        <main
          ref={content}
          className={cn(
            'mobile:p-app-4 flex-1 overflow-y-auto p-[16px] min-[721px]:px-[32px] min-[721px]:py-[28px]',
            step === 'intro'
              ? 'tablet:px-[40px] tablet:py-[32px]'
              : 'tablet:grid tablet:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] tablet:p-0'
          )}
        >
          {step === 'intro' && (
            <Image
              className="border-player-input mobile:mb-app-3 tablet:mb-[32px] mb-[14px] aspect-[2/1] h-auto w-full rounded-[12px] border object-cover"
              src="/images/welcome.jpg"
              alt={t('player.setup.lotteryImage')}
              width={720}
              height={360}
              sizes="(min-width: 641px) min(calc(100vw - 80px), 1358px), (max-width: 720px) calc(100vw - 32px), 654px"
              loading="eager"
            />
          )}
          {step === 'intro' ? (
            <div className="tablet:grid tablet:grid-cols-2 tablet:gap-[40px]">
              <div className="min-w-0">
                {stepHeading}
                <section
                  className="border-player-primary mobile:mt-app-4 mobile:mb-app-3 mobile:pl-app-3 mt-[16px] mb-[14px] border-l-[3px] pl-[14px]"
                  aria-labelledby="your-task"
                >
                  <h2
                    id="your-task"
                    className="text-player-muted mobile:mb-app-2 mobile:app-caption m-0 mb-[5px] text-[13px] font-bold tracking-[1px] uppercase"
                  >
                    {t('player.setup.task')}
                  </h2>
                  <p className="m-0 leading-[1.6]">
                    {t('player.setup.allocationTask')}
                  </p>
                </section>
              </div>
              <div className="min-w-0">
                <h2 className="text-player-muted tablet:block m-0 mb-[8px] hidden text-[14px] font-bold tracking-[1px] uppercase">
                  {t('player.setup.assets')}
                </h2>
                <ul className="mobile:mb-app-3 mobile:gap-app-2 tablet:gap-0 m-0 mb-[14px] grid list-none gap-[8px] p-0">
                  {ALLOCATION_KEYS.map((key) => {
                    const { name, risk, color } = assetLabels[key]
                    return (
                      <li
                        key={name}
                        className="border-player-input mobile:gap-app-3 mobile:px-app-3 mobile:py-app-3 tablet:grid-cols-[10px_minmax(0,1fr)_auto] tablet:rounded-none tablet:border-x-0 tablet:border-t-0 tablet:px-0 tablet:py-[16px] grid grid-cols-[10px_78px_1fr] items-center gap-[10px] rounded-[12px] border px-[12px] py-[11px]"
                      >
                        <i className={cn('size-[10px] rounded-[2px]', color)} />
                        <strong>{t(name)}</strong>
                        <span className="text-player-muted">{t(risk)}</span>
                      </li>
                    )
                  })}
                </ul>
                <p className="text-player-muted mobile:app-caption m-0 text-[14px] leading-[1.65]">
                  {t('player.setup.assetDescription')}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="tablet:px-[40px] tablet:py-[32px] min-w-0">
                {stepHeading}
                {step === 'setup' ? (
                  <>
                    <div className="mobile:mt-app-4 mobile:gap-app-3 tablet:gap-[24px] mt-[20px] grid gap-[20px]">
                      <div className="mobile:gap-app-2 flex flex-col gap-[8px]">
                        <label className="font-bold" htmlFor="bank-name">
                          {t('player.setup.bankName')}
                        </label>
                        <WelcomeTextInput
                          ref={nameInput}
                          id="bank-name"
                          {...form.getFieldProps('name')}
                          placeholder={t('player.setup.namePlaceholder')}
                          autoComplete="organization"
                          disabled={form.isSubmitting}
                          aria-invalid={Boolean(
                            form.touched.name && form.errors.name
                          )}
                          aria-describedby="bank-name-help bank-name-error"
                        />
                        <p
                          id="bank-name-help"
                          className="text-player-muted mobile:mt-app-2 mobile:app-caption m-0 mt-[6px] text-[14px] leading-[1.65]"
                        >
                          {t('player.setup.nameHint')}
                        </p>
                        <p
                          id="bank-name-error"
                          className="text-player-invalid mobile:app-caption m-0 text-[14px] empty:hidden"
                          aria-live="polite"
                        >
                          {form.touched.name &&
                            form.errors.name &&
                            t(form.errors.name as MessageKey)}
                        </p>
                      </div>
                      <div className="mobile:gap-app-2 flex flex-col gap-[8px]">
                        <span className="font-bold" id="avatar-label">
                          {t('player.setup.avatar')}
                        </span>
                        {avatarPicker(
                          <WelcomePickerTrigger
                            labelId="avatar-label"
                            valueId="avatar-value"
                            disabled={form.isSubmitting}
                            icon={
                              avatar?.value ? (
                                <Image
                                  src={avatar.value}
                                  alt=""
                                  className="size-[32px] rounded-full object-cover"
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
                            {avatar?.label ?? t('player.setup.chooseAnimal')}
                          </WelcomePickerTrigger>
                        )}
                      </div>
                      <div className="mobile:gap-app-2 flex flex-col gap-[8px]">
                        <span className="font-bold" id="location-label">
                          {t('player.setup.location')}
                        </span>
                        {locationPicker(
                          <WelcomePickerTrigger
                            labelId="location-label"
                            valueId="location-value"
                            disabled={form.isSubmitting}
                            icon={
                              <MapPin
                                aria-hidden="true"
                                className="w-[20px] shrink-0"
                              />
                            }
                          >
                            {location?.label ?? t('player.setup.chooseCanton')}
                          </WelcomePickerTrigger>
                        )}
                      </div>
                    </div>
                    {!editing && (
                      <div className="border-player-input mobile:mt-app-4 mobile:gap-app-3 mobile:pt-app-4 tablet:hidden mt-[24px] flex items-center justify-between gap-[14px] border-t pt-[16px]">
                        <div>
                          <span className="text-player-body mobile:app-caption text-[14px]">
                            {t('player.setup.capital')}
                          </span>
                          <strong className="mobile:app-value block text-[22px] leading-[1.3] whitespace-nowrap">
                            {formatCHF(INITIAL_CAPITAL)}
                          </strong>
                        </div>
                        <span className="text-player-body mobile:app-caption text-right text-[14px]">
                          {t('player.setup.sameForTeams')}
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="border-player-input tablet:hidden mobile:mt-app-4 mobile:mb-app-4 mobile:gap-app-3 mobile:px-app-4 mobile:py-app-4 mt-[18px] mb-[16px] flex items-center gap-[14px] rounded-[16px] border px-[20px] py-[15px] shadow-[0_1px_3px_#00000014]">
                      {avatar?.value && (
                        <div className="relative size-[56px] shrink-0">
                          <Image
                            src={avatar.value}
                            alt=""
                            width={56}
                            height={56}
                            className="size-full rounded-full object-cover"
                          />
                          <CantonFlagBadge location={form.values.location} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <strong className="mobile:app-heading text-[20px] [overflow-wrap:anywhere]">
                          {form.values.name.trim()}
                        </strong>
                        <p className="text-player-muted mobile:app-caption m-0 text-[14px]">
                          {avatar?.label} {t('player.progress.locationPrefix')}{' '}
                          {location?.label}
                        </p>
                        <p className="text-player-muted mobile:app-caption m-0 text-[14px]">
                          {t('player.setup.investmentCapital', {
                            amount: formatCHF(INITIAL_CAPITAL),
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="mobile:gap-app-2 tablet:mt-[20px] grid gap-[8px]">
                      {(
                        [
                          {
                            labelKey: 'player.setup.bankName',
                            value: form.values.name.trim(),
                            picker: undefined,
                          },
                          {
                            labelKey: 'player.setup.avatar',
                            value: avatar?.label,
                            picker: avatarPicker,
                          },
                          {
                            labelKey: 'player.setup.location',
                            value: location?.label,
                            picker: locationPicker,
                          },
                        ] as const
                      ).map(({ labelKey, value, picker }) => {
                        const label = t(labelKey)
                        const editButton = (
                          <WelcomeTextButton
                            aria-label={t('player.setup.editField', {
                              field:
                                language === 'en' ? label.toLowerCase() : label,
                            })}
                            disabled={form.isSubmitting}
                            onClick={
                              picker ? undefined : () => goTo('setup', true)
                            }
                          >
                            {t('player.setup.edit')}
                          </WelcomeTextButton>
                        )
                        return (
                          <div
                            key={labelKey}
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
                          ? t('player.setup.waitingHint')
                          : t('player.setup.runningHint')}
                      </p>
                    </div>
                  </>
                )}
              </div>
              <WelcomeBankPreview
                name={form.values.name}
                avatar={avatar}
                location={location}
                editing={editing}
              />
            </>
          )}
        </main>
        <footer className="border-player-input mobile:px-app-4 mobile:pt-app-3 tablet:px-[20px] shrink-0 border-t bg-white px-[16px] pt-[12px] pb-[max(12px,env(safe-area-inset-bottom))] min-[721px]:px-[32px]">
          {submitError && (
            <p
              role="alert"
              className="text-player-invalid mobile:mb-app-3 mobile:app-caption m-0 mb-[10px] text-[14px] empty:hidden"
            >
              {t(submitError)}
            </p>
          )}
          <div className="mobile:gap-app-3 tablet:justify-between flex items-center gap-[12px]">
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
                  className="tablet:ml-auto"
                >
                  {t('player.setup.setupTitle')}
                </WelcomeActionButton>
              </>
            ) : (
              <>
                {editing ? (
                  <WelcomeTextButton
                    disabled={form.isSubmitting}
                    onClick={onCancel}
                  >
                    {t('shared.actions.cancel')}
                  </WelcomeTextButton>
                ) : (
                  <button
                    type="button"
                    className="border-player-input text-player-primary focus-visible:outline-player-primary tablet:min-h-[44px] grid min-h-[48px] min-w-[44px] cursor-pointer place-items-center rounded-[6px] border bg-white focus-visible:outline-2 focus-visible:outline-offset-[3px]"
                    aria-label={
                      step === 'setup'
                        ? t('player.setup.backToIntroduction')
                        : t('player.setup.backToSetup')
                    }
                    disabled={form.isSubmitting}
                    onClick={() => goTo(step === 'setup' ? 'intro' : 'setup')}
                  >
                    <ArrowLeft aria-hidden="true" />
                  </button>
                )}
                <WelcomeActionButton
                  type="submit"
                  disabled={!canContinue || form.isSubmitting}
                  className="tablet:flex-none tablet:ml-auto flex-1"
                >
                  {form.isSubmitting
                    ? editing
                      ? t('player.story.saving')
                      : t('player.setup.starting')
                    : submitLabel}
                </WelcomeActionButton>
              </>
            )}
          </div>
          {step === 'setup' && !canContinue && (
            <p className="text-player-muted mobile:mt-app-2 mobile:app-caption m-0 mt-[8px] text-center text-[14px]">
              {t('player.setup.incomplete')}
            </p>
          )}
        </footer>
      </form>
    </div>
  )
}
