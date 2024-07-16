import { useMemo } from 'react'
import { mapObjIndexed } from 'ramda'
import {
  Bar,
  BarChart,
  Cell,
  Label,
  LabelList,
  ResponsiveContainer,
  // Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

// TODO(JJ):
// - It would make sense to define this prob. distribution somewhere else
//   which is customized
const PROB: { [key: string]: number } = {
  2: 0.0278,
  3: 0.0556,
  4: 0.0833,
  5: 0.1111,
  6: 0.1389,
  7: 0.1667,
  8: 0.1389,
  9: 0.1111,
  10: 0.0833,
  11: 0.0556,
  12: 0.0278,
}

function DIST_VOLATILITY({
  trendE,
  trendGap,
}: {
  trendE: number
  trendGap: number
}) {
  const distribution: Record<number, number> = {
    2: trendE - 5 * trendGap,
    3: trendE - 4 * trendGap,
    4: trendE - 3 * trendGap,
    5: trendE - 2 * trendGap,
    6: trendE - trendGap,
    7: trendE,
    8: trendE + trendGap,
    9: trendE + 2 * trendGap,
    10: trendE + 3 * trendGap,
    11: trendE + 4 * trendGap,
    12: trendE + 5 * trendGap,
  }

  const E = Object.keys(PROB).reduce(
    (acc: number, key: string) => acc + PROB[key] * distribution[Number(key)],
    0
  )

  const squared = mapObjIndexed((item) => (item - E) ** 2, distribution)

  const vola =
    (Object.keys(distribution).reduce(
      (acc, key) => acc + PROB[key] * squared[key],
      0
    ) *
      4) **
    0.5

  return {
    distribution,
    E,
    squared,
    vola,
  }
}

// TODO(JJ):
// - Make it workt, -> ts is complaining
// function CustomTooltip({ active, payload }: { active: boolean; payload: any }) {
//   if (active && payload && payload.length) {
//     return (
//       <div className="p-2 bg-white border rounded shadow">
//         <div>Dice Roll: {payload[0].payload.eyes}</div>
//         <div>Probability: {(payload[0].payload.prob * 100).toFixed(2)}%</div>
//         <div>Price Delta: {payload[0].payload.change}</div>
//       </div>
//     )
//   }

//   return null
// }

function ProbabilityChart({
  trendE,
  trendGap,
  totalEyes,
}: {
  trendE: number
  trendGap: number
  totalEyes: string
}) {
  const { data, vola } = useMemo(() => {
    const { distribution, vola } = DIST_VOLATILITY({
      trendE,
      trendGap,
    })

    const data = Object.entries(PROB).map(([eyes, prob]) => ({
      eyes,
      prob,
      change: `${(distribution[Number(eyes)] * 100).toFixed(1)}%`,
    }))

    return { data, vola }
  }, [trendE, trendGap])

  return (
    <div>
      <div className="flex flex-row gap-4 px-2 py-1 text-sm">
        <div>Expectation: {trendE * 100}%</div>
        <div>Trend Gap: {trendGap * 100}%</div>
        <div>Volatility: {(vola * 100).toFixed(2)}%</div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={data}
          margin={{ left: 15, bottom: 15, top: 30, right: 15 }}
        >
          {/* <Tooltip content={CustomTooltip} /> */}

          <XAxis dataKey="eyes">
            <Label value="Dice Roll" position="bottom" offset={0} />
          </XAxis>
          <YAxis dataKey="prob" tickFormatter={(value) => `${value * 100}%`}>
            <Label value="Probability" angle={-90} position="left" offset={0} />
          </YAxis>
          <Bar dataKey="prob">
            <LabelList
              dataKey="change"
              position="top"
              offset={10}
              fontSize={14}
              angle={0}
            />

            {data.map((entry, index) => (
              <Cell
                fill={entry.eyes == totalEyes ? '#dc6027' : 'grey'}
                key={`cell-${index}`}
              ></Cell>
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default ProbabilityChart
