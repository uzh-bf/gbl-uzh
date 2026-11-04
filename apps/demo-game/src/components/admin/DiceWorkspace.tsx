import { probabilityDistribution } from '@gbl-uzh/ui'
import { useTranslations } from 'next-intl'
import dynamic from 'next/dynamic'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import type { MarketDiceQuery } from '~/graphql/generated/ops'
import { useLanguage } from '~/i18n/Language'
import { FIRST_GAME_YEAR, NUM_MONTHS_PER_SEGMENT } from '~/lib/constants'
import {
  readMarketRoll,
  revealedIndices,
  type MarketScenario,
} from '~/lib/market'
import { Button } from './AdminControls'

const Die = dynamic(() => import('@gbl-uzh/ui').then((mod) => mod.Die), {
  ssr: false,
})
const months = Array.from(
  { length: NUM_MONTHS_PER_SEGMENT },
  (_, index) => index
)
const diceRows = [
  {
    name: 'shared.assets.bonds',
    description: 'shared.assets.bondsOnly',
    color: '#268368',
    dots: 'white',
  },
  {
    name: 'shared.assets.shared',
    description: 'shared.assets.bondsAndStocks',
    color: '#e85c24',
    dots: 'white',
  },
  {
    name: 'shared.assets.stocks',
    description: 'shared.assets.stocksOnly',
    color: '#ffe000',
    dots: '#151515',
  },
] as const
const sectionPadding = 'mobile:p-app-4 p-[28px]'
const phaseMessages = {
  idle: 'manage.dice.pending',
  rolling: 'manage.dice.rolling',
  publishing: 'manage.dice.publishing',
  error: 'manage.dice.publishError',
} as const
type Phase = keyof typeof phaseMessages

function ReturnChart({
  asset,
  trend,
  gap,
  roll,
}: {
  asset: 'bonds' | 'stocks'
  trend: number
  gap: number
  roll: ReturnType<typeof readMarketRoll>
}) {
  const t = useTranslations()
  const { signedPercent, language, percent, share } = useLanguage()
  const title =
    asset === 'bonds' ? t('shared.assets.bonds') : t('shared.assets.stocks')
  const { data, volatility } = probabilityDistribution(trend, gap)
  const total = roll?.dice[asset]
  return (
    <section
      aria-label={t('manage.dice.outcome', { asset: title })}
      data-cy={`admin-dice-${asset}`}
      className={`${sectionPadding} border-player-border min-w-0 border-t min-[900px]:last:border-l min-[1200px]:border-t-0 min-[1200px]:border-l`}
    >
      <div className="text-player-muted flex flex-wrap items-center justify-between gap-[8px]">
        <h2 className="m-0 text-[16px] font-semibold tracking-[1px] uppercase">
          {title}
        </h2>
        <p className="m-0 text-[16px]">
          {t('manage.dice.outcomePrefix')} {language === 'en' ? asset : title}
        </p>
      </div>
      <dl className="mt-[24px] flex flex-wrap gap-x-[28px] gap-y-[12px]">
        {(
          [
            [t('manage.dice.expectation'), trend],
            [t('manage.dice.trendGap'), gap],
            [t('manage.dice.volatility'), volatility],
          ] as const
        ).map(([label, value]) => (
          <div key={label}>
            <dt className="text-player-muted text-[16px]">{label}</dt>
            <dd className="m-0 mt-[4px] text-[22px] font-bold">
              {percent(value, 2)}
            </dd>
          </div>
        ))}
      </dl>
      <svg
        viewBox="0 0 740 354"
        role="img"
        aria-label={t('manage.dice.chartDescription', {
          asset: title,
          reveal:
            total === undefined
              ? t('manage.dice.noReveal')
              : t('manage.dice.revealedTotal', { total: total }),
        })}
        className="mobile:mt-app-6 mt-[40px] block w-full"
      >
        {[0, 0.045, 0.09, 0.135, 0.18].map((probability) => {
          const y = 316 - (probability / 0.18) * 280
          return (
            <g key={probability}>
              <line
                x1="62"
                x2="738"
                y1={y}
                y2={y}
                stroke="var(--color-player-border)"
              />
              <text
                x="51"
                y={y + 5}
                textAnchor="end"
                fontSize="18"
                className="mobile:text-[22px]"
                fill="var(--color-player-muted)"
              >
                {share(Number((probability * 100).toFixed(1)))}
              </text>
            </g>
          )
        })}
        {data.map((item, index) => {
          const selected = Number(item.eyes) === total
          const height = (item.prob / 0.18) * 280
          const x = 62 + index * 62
          const color = selected
            ? 'var(--theme-color-primary)'
            : 'var(--color-player-muted)'
          return (
            <g
              key={item.eyes}
              data-roll={item.eyes}
              data-highlighted={selected}
            >
              <title>
                {t('manage.dice.rollTooltip', {
                  roll: item.eyes,
                  probability: percent(item.prob, 2),
                  change: signedPercent(item.value),
                  highlight: selected ? t('manage.dice.highlighted') : '',
                })}
              </title>
              <rect
                x={x}
                y={316 - height}
                width="50"
                height={height}
                rx="6"
                fill={
                  selected
                    ? 'var(--theme-color-primary)'
                    : 'var(--color-player-progress)'
                }
              />
              <text
                x={x + 25}
                y={303 - height}
                textAnchor="middle"
                fontSize="20"
                className="mobile:text-[22px]"
                fontWeight={selected ? 700 : 400}
                fill={color}
              >
                {signedPercent(item.value)}
              </text>
              <text
                x={x + 25}
                y="344"
                textAnchor="middle"
                fontSize="22"
                className="mobile:text-[26px]"
                fontWeight={selected ? 700 : 400}
                fill={color}
              >
                {item.eyes}
              </text>
            </g>
          )
        })}
      </svg>
      <div
        aria-hidden="true"
        className="text-player-muted mobile:app-caption mt-[8px] flex justify-between gap-[12px] pl-[8.4%] text-[16px]"
      >
        <span>{t('manage.dice.probabilityPerRoll')}</span>
        <span>{t('manage.dice.diceRoll')}</span>
      </div>
      <div className="border-player-border text-player-muted mobile:app-body mt-[24px] flex min-h-[60px] flex-wrap items-center justify-between gap-[12px] border-t pt-[24px] text-[18px]">
        {roll ? (
          <>
            <span>
              {t('shared.assets.shared')} {roll.dice.shared} +{' '}
              {language === 'en' ? asset : title}{' '}
              {roll.dice[asset] - roll.dice.shared} = {total}
            </span>
            <strong
              className="text-player-primary mobile:app-value text-[28px]"
              data-cy={`admin-dice-return-${asset}`}
            >
              {signedPercent(roll.returns[asset])}
            </strong>
          </>
        ) : (
          <span>{t('manage.dice.pending')}</span>
        )}
      </div>
    </section>
  )
}

export function DiceWorkspace({
  segment,
  scenario,
  publish,
}: {
  segment: NonNullable<MarketDiceQuery['marketDice']>
  scenario: MarketScenario
  publish: (rollIndex: number) => Promise<void>
}) {
  const t = useTranslations()
  const { locale } = useLanguage()
  const indices = revealedIndices(segment.facts)
  const [selected, setSelected] = useState(
    () => months.find((index) => !indices.includes(index)) ?? 0
  )
  const [phases, setPhases] = useState<Partial<Record<number, Phase>>>({})
  const phase = phases[selected] ?? 'idle'
  const busy = phase === 'rolling' || phase === 'publishing'
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    []
  )

  const monthName = (index: number) =>
    new Intl.DateTimeFormat(locale, { month: 'long', timeZone: 'UTC' }).format(
      new Date(
        Date.UTC(
          FIRST_GAME_YEAR + segment.periodIx,
          segment.index * NUM_MONTHS_PER_SEGMENT + index,
          1
        )
      )
    )
  const roll = readMarketRoll(segment.facts, selected)
  const revealed = indices.includes(selected)
  const visibleRoll = revealed && phase !== 'rolling' ? roll : null
  const values = roll
    ? [
        roll.dice.bonds - roll.dice.shared,
        roll.dice.shared,
        roll.dice.stocks - roll.dice.shared,
      ]
    : []
  const setPhase = (next: Phase) =>
    setPhases((previous) => ({ ...previous, [selected]: next }))
  const sendReveal = async () => {
    setPhase('publishing')
    try {
      await publish(selected)
      setPhase('idle')
    } catch {
      setPhase('error')
    }
  }
  const startRoll = () => {
    if (!roll || revealed || !segment.canReveal || busy) return
    setPhase('rolling')
    timer.current = setTimeout(() => void sendReveal(), 2500)
  }
  const onTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    if (busy) return
    let next: number
    switch (event.key) {
      case 'ArrowRight':
        next = (index + 1) % months.length
        break
      case 'ArrowLeft':
        next = (index + months.length - 1) % months.length
        break
      case 'Home':
        next = 0
        break
      case 'End':
        next = months.length - 1
        break
      default:
        return
    }
    event.preventDefault()
    setSelected(next)
    tabRefs.current[next]?.focus()
  }

  return (
    <main className="font-player text-player-text mobile:app-body min-h-[calc(100dvh-36px)] bg-white text-[18px]">
      <div className="border-player-divider mobile:px-app-4 flex flex-wrap items-end gap-x-[28px] border-b px-[28px]">
        <h1 className="text-player-muted m-0 py-[20px] text-[16px] font-semibold tracking-[1px] uppercase">
          {FIRST_GAME_YEAR + segment.periodIx} {t('manage.dice.quarter')}{' '}
          {segment.index + 1}
        </h1>
        <div
          role="tablist"
          aria-label={t('manage.dice.quarterMonths')}
          className="mobile:gap-app-4 flex max-w-full gap-[24px] overflow-x-auto"
        >
          {months.map((index) => (
            <button
              key={index}
              ref={(element) => {
                tabRefs.current[index] = element
              }}
              id={`month-tab-${index}`}
              type="button"
              role="tab"
              aria-selected={selected === index}
              aria-controls="dice-month-panel"
              tabIndex={selected === index ? 0 : -1}
              disabled={busy}
              onClick={() => setSelected(index)}
              onKeyDown={(event) => onTabKeyDown(event, index)}
              className={`focus-visible:outline-player-primary shrink-0 border-b-[3px] bg-transparent px-[3px] pt-[20px] pb-[16px] text-left focus-visible:outline-2 focus-visible:-outline-offset-4 disabled:cursor-wait ${selected === index ? 'border-player-primary text-player-primary' : 'text-player-muted border-transparent'}`}
            >
              <span
                className={`block ${selected === index ? 'font-bold' : 'font-semibold'}`}
              >
                {t('manage.dice.month')} {index + 1}
              </span>
              <span className="text-player-muted mobile:app-caption mt-[6px] block text-[16px]">
                {monthName(index)} ·{' '}
                {indices.includes(index)
                  ? t('manage.dice.rolled')
                  : t('manage.dice.notRolled')}
              </span>
            </button>
          ))}
        </div>
      </div>
      {/* Remount the dice so their initial faces follow the selected month. */}
      <div
        key={selected}
        id="dice-month-panel"
        role="tabpanel"
        aria-labelledby={`month-tab-${selected}`}
        tabIndex={0}
      >
        <div
          className="grid min-[900px]:grid-cols-2 min-[1200px]:grid-cols-[minmax(240px,1fr)_minmax(0,2fr)_minmax(0,2fr)]"
          data-cy={`admin-roll-${selected}`}
        >
          <section
            aria-label={t('manage.dice.title')}
            className="min-w-0 min-[900px]:col-span-2 min-[1200px]:col-span-1"
          >
            <h2 className="border-player-border text-player-muted mobile:px-app-4 mobile:py-app-4 m-0 border-b px-[28px] py-[24px] text-[16px] font-semibold tracking-[1px] uppercase">
              {t('manage.dice.title')}
            </h2>
            <div className="min-[900px]:max-[1199px]:grid min-[900px]:max-[1199px]:grid-cols-3">
              {diceRows.map((die, dieIndex) => (
                <div
                  key={die.name}
                  className="border-player-border mobile:px-app-4 mobile:py-app-4 flex items-center gap-[16px] border-b px-[28px] py-[18px]"
                >
                  <div
                    className="bg-player-disabled-surface flex size-[64px] shrink-0 items-center justify-center rounded-[14px]"
                    role="img"
                    aria-label={t('manage.dice.dieOutcome', {
                      asset: t(die.name),
                      value: visibleRoll
                        ? values[dieIndex]
                        : phase === 'rolling'
                          ? t('manage.dice.inProgress')
                          : t('manage.dice.notRevealed'),
                    })}
                  >
                    {(visibleRoll || phase === 'rolling') && roll && (
                      <div
                        aria-hidden="true"
                        className="text-[0px] leading-none"
                      >
                        <Die
                          die={values[dieIndex]}
                          defaultRoll={visibleRoll ? values[dieIndex] : 1}
                          roll={phase === 'rolling'}
                          faceColor={die.color}
                          dotColor={die.dots}
                          dieSize={64}
                          margin={0}
                        />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="m-0 text-[20px] font-bold">{t(die.name)}</h3>
                    <p className="text-player-muted mobile:app-caption m-0 text-[16px]">
                      {t(die.description)}
                    </p>
                  </div>
                  <strong className="mobile:app-value text-[28px]">
                    {visibleRoll ? values[dieIndex] : '–'}
                  </strong>
                </div>
              ))}
            </div>
            <div
              className={`${sectionPadding} flex flex-col items-start gap-[16px]`}
            >
              {!roll ? (
                <p role="alert">
                  {t('manage.dice.month')} {selected + 1}
                  {t('manage.dice.unavailable')}
                </p>
              ) : revealed && !busy ? (
                <p
                  role="status"
                  className="text-player-body m-0 flex items-center gap-[10px]"
                >
                  <span
                    aria-hidden="true"
                    className="bg-player-success size-[8px] shrink-0 rounded-full"
                  />
                  {t('manage.dice.month')} {selected + 1} ·{' '}
                  {monthName(selected)} {t('manage.dice.published')}
                </p>
              ) : (
                <>
                  <Button
                    onClick={phase === 'error' ? sendReveal : startRoll}
                    primary
                    disabled={!segment.canReveal || busy}
                    className={{
                      root: 'min-h-[48px] rounded-[6px] px-[24px] text-[20px]',
                    }}
                  >
                    {phase === 'error'
                      ? t('manage.dice.retry')
                      : t('manage.dice.roll')}
                  </Button>
                  <p
                    role={phase === 'error' ? 'alert' : 'status'}
                    className="text-player-muted m-0"
                  >
                    {t(phaseMessages[phase])}
                  </p>
                  {!segment.canReveal && (
                    <p className="text-player-muted m-0">
                      {t('manage.dice.closedOnly')}
                    </p>
                  )}
                </>
              )}
            </div>
          </section>
          <ReturnChart
            asset="bonds"
            trend={scenario.trendBonds}
            gap={scenario.gapBonds}
            roll={visibleRoll}
          />
          <ReturnChart
            asset="stocks"
            trend={scenario.trendStocks}
            gap={scenario.gapStocks}
            roll={visibleRoll}
          />
        </div>
      </div>
    </main>
  )
}
