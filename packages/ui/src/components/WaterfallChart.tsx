import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts'
import { formatCurrency, formatPercent } from '~/lib/utils'

export interface WaterfallData {
  category: string
  value: number
  cumulative: number
  percentage: number
  isTotal?: boolean
}

export interface WaterfallChartProps {
  data: WaterfallData[]
  height?: number
  positiveColor?: string
  negativeColor?: string
  costsColor?: string
}

const DEFAULT_COLORS = {
  positive: '#82ca9d', // Green for profits/success
  negative: '#ff6b6b', // Red for losses/failures
  costs: '#F4A460',    // Sandy brown for costs
}

interface CustomTooltipProps {
  active?: boolean
  payload?: { payload: WaterfallData }[]
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const isPositive = data.value >= 0
    return (
      <div className="bg-white rounded border p-2 shadow-lg text-xs">
        <p className="font-semibold text-slate-800">{data.category}</p>
        <p className="text-slate-600">
          {isPositive ? 'Added: ' : 'Subtracted: '}
          {formatCurrency(Math.abs(data.value), 0)}
        </p>
        <p className="text-slate-600">
          {formatPercent(Math.abs(data.percentage) / 100)} of revenue
        </p>
        <p className="text-slate-500 border-t pt-1 mt-1">
          Balance: {formatCurrency(data.cumulative, 0)}
        </p>
      </div>
    )
  }
  return null
}

export function WaterfallChart({
  data,
  height = 350,
  positiveColor = DEFAULT_COLORS.positive,
  negativeColor = DEFAULT_COLORS.negative,
  costsColor = DEFAULT_COLORS.costs,
}: WaterfallChartProps) {
  const chartData = React.useMemo(() => {
    return data.map((item, index) => {
      const prev = index > 0 ? data[index - 1].cumulative : 0

      if (item.isTotal) {
        return {
          ...item,
          invisible: 0,
          positive: item.value >= 0 ? item.value : 0,
          negative: item.value < 0 ? Math.abs(item.value) : 0,
        }
      } else if (index === 0) {
        return {
          ...item,
          invisible: 0,
          positive: item.value,
          negative: 0,
        }
      } else {
        const minVal = Math.min(prev, item.cumulative)
        return {
          ...item,
          invisible: minVal,
          positive: 0,
          negative: Math.abs(item.value),
        }
      }
    })
  }, [data])

  const maxValue = Math.max(...data.map((d) => d.cumulative))
  const minValue = Math.min(...data.map((d) => d.cumulative), 0)
  const padding = (maxValue - minValue) * 0.1

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="category"
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fontSize: 11 }}
            interval={0}
          />
          <YAxis
            domain={[minValue - padding, maxValue + padding]}
            tickFormatter={(value) => formatCurrency(value, 0)}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />

          {/* Invisible bars to create the waterfall effect */}
          <Bar dataKey="invisible" stackId="stack" fill="transparent" />

          {/* Positive values (Revenue and positive Net Income) */}
          <Bar
            dataKey="positive"
            stackId="stack"
            fill={positiveColor}
            label={(props: { x?: number; y?: number; width?: number; index?: number }) => {
              const { x, y, width, index } = props
              if (x === undefined || y === undefined || width === undefined || index === undefined) return <g />
              const item = data[index]
              if (!item || item.value <= 0 || item.percentage < 1) return <g />
              return (
                <text x={x + width / 2} y={y - 5} fill="#666" textAnchor="middle" fontSize={11}>
                  {formatPercent(item.percentage / 100)}
                </text>
              )
            }}
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-positive-${index}`} />
            ))}
          </Bar>

          {/* Negative values (Costs and negative Net Income) */}
          <Bar
            dataKey="negative"
            stackId="stack"
            fill={negativeColor}
            label={(props: { x?: number; y?: number; width?: number; height?: number; index?: number }) => {
              const { x, y, width, height: barHeight, index } = props
              if (x === undefined || y === undefined || width === undefined || barHeight === undefined || index === undefined) return <g />
              const item = data[index]
              if (!item || item.value >= 0 || item.percentage < 1) return <g />
              return (
                <text x={x + width / 2} y={y + barHeight + 15} fill="#666" textAnchor="middle" fontSize={11}>
                  {formatPercent(item.percentage / 100)}
                </text>
              )
            }}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-negative-${index}`}
                fill={entry.isTotal && entry.negative > 0 ? negativeColor : costsColor}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
