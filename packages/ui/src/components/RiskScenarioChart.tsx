import {
  Bar,
  BarChart,
  Cell,
  Tooltip as RechartsTooltip,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import { formatCurrency } from '~/lib/utils'

export interface RiskScenarioData {
  diceSum: number
  prob: number
  pnl: number
  storagePnL?: number
  futuresPnL?: number
  optionsPnL?: number
}

export interface RiskScenarioChartProps {
  data: RiskScenarioData[]
  var95?: number
  es95?: number
  height?: number
}

interface CustomScenarioTooltipProps {
  active?: boolean
  payload?: { payload: RiskScenarioData }[]
}

const CustomScenarioTooltip = ({ active, payload }: CustomScenarioTooltipProps) => {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  if (!d) return null
  return (
    <div className="rounded border border-slate-200 bg-white p-2 text-xs shadow-md">
      <div className="font-semibold text-slate-800">Dice Sum: {d.diceSum}</div>
      <div className="text-slate-600">Probability: {(d.prob * 100).toFixed(1)}%</div>
      <div className="text-slate-800 font-medium">P&L: {formatCurrency(d.pnl, 0)}</div>
      {(d.storagePnL !== undefined || d.futuresPnL !== undefined || d.optionsPnL !== undefined) && (
        <div className="mt-1 border-t pt-1 text-slate-500 space-y-0.5">
          {d.storagePnL !== undefined && <div>Storage: {formatCurrency(d.storagePnL, 0)}</div>}
          {d.futuresPnL !== undefined && <div>Futures: {formatCurrency(d.futuresPnL, 0)}</div>}
          {d.optionsPnL !== undefined && <div>Options: {formatCurrency(d.optionsPnL, 0)}</div>}
        </div>
      )}
    </div>
  )
}

export function RiskScenarioChart({
  data,
  var95,
  es95,
  height = 150,
}: RiskScenarioChartProps) {
  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{ left: 0, right: 0, top: 5, bottom: 0 }}
        >
          <XAxis dataKey="diceSum" tick={{ fontSize: 10 }} />
          <YAxis hide />
          <RechartsTooltip content={<CustomScenarioTooltip />} />
          <ReferenceLine y={0} stroke="#999" strokeWidth={1} />
          {var95 !== undefined && var95 > 0 && (
            <ReferenceLine
              y={-var95}
              stroke="#ef4444"
              strokeDasharray="4 3"
              strokeWidth={1.5}
              label={{
                value: 'VaR',
                position: 'right',
                fontSize: 10,
                fill: '#ef4444',
              }}
            />
          )}
          {es95 !== undefined && es95 > 0 && (
            <ReferenceLine
              y={-es95}
              stroke="#f97316"
              strokeDasharray="4 3"
              strokeWidth={1.5}
              label={{
                value: 'ES',
                position: 'right',
                fontSize: 10,
                fill: '#f97316',
              }}
            />
          )}
          <Bar dataKey="pnl" maxBarSize={20}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.pnl >= 0 ? '#22c55e' : '#ef4444'}
                fillOpacity={0.7}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
