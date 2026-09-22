import { ProbabilityChart } from '@gbl-uzh/ui'
import type { ResultQuery } from '~/graphql/generated/ops'
import {
  formatMarketReturn,
  latestRevealedRoll,
  marketPeriod,
  readScenario,
  type MarketRoll,
} from '~/lib/market'

const sectionClass =
  'border-player-border border-b mobile:px-app-4 mobile:py-app-4 min-[601px]:px-[32px] min-[601px]:py-[28px]'
const marketAssets = [
  {
    key: 'bonds',
    label: 'Bonds',
    color: 'bg-player-bonds',
    dieColor: 'bg-[#ffe000] text-black',
    trend: 'trendBonds',
    gap: 'gapBonds',
  },
  {
    key: 'stocks',
    label: 'Stocks',
    color: 'bg-player-stocks',
    dieColor: 'bg-[#268368] text-white',
    trend: 'trendStocks',
    gap: 'gapStocks',
  },
] as const
const assets = [
  ...marketAssets,
  { key: 'bank', label: 'Savings', color: 'bg-player-savings' },
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
      className={`mobile:size-app-die mobile:gap-[2px] mobile:p-app-1 grid size-[36px] shrink-0 grid-cols-3 grid-rows-3 gap-[3px] rounded-[8px] p-[6px] ${color}`}
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
      <strong className="text-player-body mobile:app-body min-w-[32px] text-[18px]">
        = {dice[asset.key]}
      </strong>
    </div>
  )
}

export default function MarketPanel({ data }: { data: ResultQuery }) {
  const game = data.result?.currentGame
  const scenario = readScenario(marketPeriod(game)?.facts)
  const latest = latestRevealedRoll(game)
  const roll = latest?.roll
  const values = roll ? Object.values(roll.returns) : []
  const min = Math.min(0, ...values)
  const max = Math.max(0, ...values)
  const span = max - min || 1
  const zero = (-min / span) * 100
  return (
    <section aria-label="Market" data-cy="market-panel">
      {scenario ? (
        marketAssets.map((asset) => (
          <div
            className={sectionClass}
            key={asset.key}
            data-cy={`market-${asset.key}`}
          >
            <ProbabilityChart
              variant="market"
              title={asset.label}
              titleContent={
                roll && <AssetDice dice={roll.dice} asset={asset} />
              }
              trendE={scenario[asset.trend]}
              trendGap={scenario[asset.gap]}
              totalEyes={roll ? String(roll.dice[asset.key]) : undefined}
              month={roll ? latest.index + 1 : undefined}
            />
          </div>
        ))
      ) : (
        <p className={sectionClass}>Market outlook is not available yet.</p>
      )}
      {roll && (
        <div
          className={sectionClass}
          data-cy="market-comparison"
          aria-live="polite"
        >
          <p className="text-player-muted mobile:mb-app-4 mobile:app-caption m-0 mb-[24px] min-[601px]:text-[24px]">
            Monthly returns · Month {latest.index + 1}
          </p>
          <div className="mobile:gap-app-3 grid gap-[18px]">
            {assets.map(({ key, label, color }) => {
              const value = roll.returns[key]
              const end = ((value - min) / span) * 100
              return (
                <div
                  className="mobile:gap-app-3 grid grid-cols-[90px_1fr_65px] items-center gap-[12px] min-[601px]:grid-cols-[160px_1fr_80px]"
                  key={key}
                  data-cy={`market-return-${key}`}
                  aria-label={`${label}: ${formatMarketReturn(value)}`}
                >
                  <div className="text-player-body mobile:gap-app-3 mobile:app-body flex items-center min-[601px]:gap-[20px] min-[601px]:text-[26px]">
                    <span
                      className={`size-[14px] shrink-0 rounded-[4px] min-[601px]:size-[20px] ${color}`}
                    />
                    {label}
                  </div>
                  <div
                    className="bg-player-progress relative h-[16px] rounded-[5px] min-[601px]:h-[20px]"
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
                  <strong className="mobile:app-caption text-right min-[601px]:text-[24px]">
                    {formatMarketReturn(value)}
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
