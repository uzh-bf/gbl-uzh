import { cn, ProbabilityChart, signedPercent } from '@gbl-uzh/ui'
import type { ResultQuery } from '~/graphql/generated/ops'
import { assetLabels, MONTHS, NUM_MONTHS_PER_SEGMENT } from '~/lib/constants'
import {
  currentMarketReview,
  marketPeriod,
  readMarketRoll,
  readScenario,
  revealedIndices,
  type MarketRoll,
} from '~/lib/market'
import { useFullWidthMarketLayout } from '~/lib/usePlayerLayout'

const monthColors = ['#0028a5', '#8a3e98', '#a85600']

const sectionClass =
  'border-player-border border-b mobile:px-app-4 mobile:py-app-4 tablet:min-w-0 tablet:px-[16px] tablet:py-[12px]'
const marketAssets = [
  {
    key: 'bonds',
    label: assetLabels.bonds.name,
    color: assetLabels.bonds.color,
    dieColor: 'bg-[#ffe000] text-black',
    trend: 'trendBonds',
    gap: 'gapBonds',
  },
  {
    key: 'stocks',
    label: assetLabels.stocks.name,
    color: assetLabels.stocks.color,
    dieColor: 'bg-[#268368] text-white',
    trend: 'trendStocks',
    gap: 'gapStocks',
  },
] as const
const assets = [
  ...marketAssets,
  { key: 'bank', label: assetLabels.bank.name, color: assetLabels.bank.color },
] as const

function StaticDie({
  value,
  color,
  label,
}: {
  value: number
  color: string
  label: string
}) {
  const positions: Record<number, number[]> = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
  }
  return (
    <span
      role="img"
      aria-label={`${label}: ${value}`}
      className={`mobile:size-app-die mobile:gap-[2px] mobile:p-app-1 tablet:size-[28px] tablet:gap-[2px] tablet:p-[4px] grid size-[36px] shrink-0 grid-cols-3 grid-rows-3 gap-[3px] rounded-[8px] p-[6px] ${color}`}
    >
      {Array.from({ length: 9 }, (_, index) => (
        <span
          key={index}
          className={`rounded-full ${positions[value].includes(index) ? 'bg-current' : ''}`}
        />
      ))}
    </span>
  )
}

function AssetDice({
  dice,
  asset,
}: {
  dice: MarketRoll
  asset: (typeof marketAssets)[number]
}) {
  return (
    <div className="mobile:gap-app-2 flex items-center gap-[6px]">
      <StaticDie
        value={dice.shared}
        color="bg-[#e85c24] text-white"
        label="Shared die"
      />
      <StaticDie
        value={dice[asset.key] - dice.shared}
        color={asset.dieColor}
        label={`${asset.label} die`}
      />
      <strong className="text-player-body mobile:app-body tablet:text-[14px] min-w-[32px] text-[18px]">
        = {dice[asset.key]}
      </strong>
    </div>
  )
}

export default function MarketPanel({
  data,
  embedded = false,
}: {
  data: ResultQuery
  embedded?: boolean
}) {
  const fullWidthMarket = useFullWidthMarketLayout()
  const game = data.result?.currentGame
  const review = currentMarketReview(game)
  const scenario = readScenario((review?.period ?? marketPeriod(game))?.facts)
  const indices = revealedIndices(review?.segment.facts)
  const months = review
    ? Array.from({ length: NUM_MONTHS_PER_SEGMENT }, (_, index) => ({
        index,
        label: MONTHS[review.segment.index * NUM_MONTHS_PER_SEGMENT + index],
        color: monthColors[index],
        roll: indices.includes(index)
          ? readMarketRoll(review.segment.facts, index)
          : null,
      }))
    : []
  const revealedMonths = months.filter((month) => month.roll)
  const latest = revealedMonths.at(-1)
  const roll = latest?.roll
  const monthLabel = latest
    ? `Q${review.segment.index + 1} · ${latest.label}`
    : undefined
  const values = roll ? Object.values(roll.returns) : []
  const min = Math.min(0, ...values)
  const max = Math.max(0, ...values)
  const span = max - min || 1
  const zero = (-min / span) * 100
  return (
    <section
      aria-label="Market"
      data-cy="market-panel"
      className={cn(
        embedded &&
          'tablet:grid tablet:grid-cols-2 tablet:min-[1024px]:max-w-[768px]'
      )}
    >
      {embedded && (
        <div className="text-player-muted col-span-2 flex flex-wrap items-baseline justify-between gap-[8px] px-[16px] pt-[12px] text-[14px]">
          <h2 className="m-0 text-[14px] font-semibold tracking-[1px] uppercase">
            Market
          </h2>
          <span>Return % per dice roll · bar height is how likely it is</span>
        </div>
      )}
      {scenario ? (
        marketAssets.map((asset) => (
          <div
            className={cn(
              sectionClass,
              asset.key === 'bonds' && 'tablet:border-r'
            )}
            key={asset.key}
            data-cy={`market-${asset.key}`}
          >
            <ProbabilityChart
              variant="market"
              compact={embedded}
              fixedHeight={embedded && fullWidthMarket ? 206 : undefined}
              title={asset.label}
              trendE={scenario[asset.trend]}
              trendGap={scenario[asset.gap]}
              monthlyHighlights={revealedMonths.map((month) => ({
                totalEyes: String(month.roll.dice[asset.key]),
                label: month.label,
                color: month.color,
              }))}
            />
            {review && (
              <div
                className="mt-[12px] grid gap-[8px]"
                aria-label={`${asset.label} monthly dice`}
                data-cy={`market-months-${asset.key}`}
              >
                {months.map((month) => (
                  <div
                    key={month.index}
                    className="flex flex-wrap items-center justify-between gap-[6px] border-l-[4px] pl-[8px]"
                    style={{ borderColor: month.color }}
                    data-cy={`market-month-${asset.key}-${month.index}`}
                  >
                    <strong style={{ color: month.color }}>
                      {month.label}
                    </strong>
                    {month.roll ? (
                      <AssetDice dice={month.roll.dice} asset={asset} />
                    ) : (
                      <span
                        className="text-player-muted text-[12px]"
                        aria-label={`${month.label}: dice not revealed`}
                      >
                        – + – = – · Not rolled
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      ) : (
        <p className={cn(sectionClass, 'tablet:col-span-2')}>
          Market outlook is not available yet.
        </p>
      )}
      {roll && (
        <div
          className={cn(sectionClass, 'tablet:col-span-2')}
          data-cy="market-comparison"
          aria-live="polite"
        >
          <p className="text-player-muted mobile:mb-app-4 mobile:app-caption tablet:mb-[16px] tablet:text-[16px] m-0 mb-[24px]">
            Monthly returns · {monthLabel}
          </p>
          <div className="mobile:gap-app-3 grid gap-[18px]">
            {assets.map(({ key, label, color }) => {
              const value = roll.returns[key]
              const end = ((value - min) / span) * 100
              return (
                <div
                  className="mobile:gap-app-3 tablet:grid-cols-[70px_minmax(0,1fr)_55px] tablet:gap-[8px] grid grid-cols-[90px_1fr_65px] items-center gap-[12px]"
                  key={key}
                  data-cy={`market-return-${key}`}
                  aria-label={`${label}: ${signedPercent(value)}`}
                >
                  <div className="text-player-body mobile:gap-app-3 mobile:app-body tablet:gap-[8px] tablet:text-[14px] flex items-center">
                    <span
                      className={`tablet:size-[12px] size-[14px] shrink-0 rounded-[4px] ${color}`}
                    />
                    {label}
                  </div>
                  <div
                    className="bg-player-progress tablet:h-[14px] relative h-[16px] rounded-[5px]"
                    aria-hidden="true"
                  >
                    <span
                      className={`absolute h-full rounded-[5px] ${color}`}
                      style={{
                        left: `${Math.min(zero, end)}%`,
                        width: `${Math.abs(end - zero)}%`,
                      }}
                    />
                    {min < 0 && (
                      <span
                        className="bg-player-muted absolute top-[-3px] h-[calc(100%+6px)] w-px"
                        style={{ left: `${zero}%` }}
                      />
                    )}
                  </div>
                  <strong className="mobile:app-caption tablet:text-[14px] text-right">
                    {signedPercent(value)}
                  </strong>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}
