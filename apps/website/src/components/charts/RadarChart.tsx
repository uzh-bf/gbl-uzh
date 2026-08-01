import type { ComponentType } from 'react'
import {
  PolarGrid,
  PolarAngleAxis as RechartsPolarAngleAxis,
  PolarRadiusAxis as RechartsPolarRadiusAxis,
  Radar as RechartsRadar,
  RadarChart as RechartsRadarChart,
  ResponsiveContainer,
  type PolarAngleAxisProps,
  type PolarRadiusAxisProps,
  type RadarProps,
} from 'recharts'

// Recharts 2 declares legacy class components that are not JSX-compatible
// with React 19's types, despite the runtime's React 19 peer support.
const PolarAngleAxis =
  RechartsPolarAngleAxis as unknown as ComponentType<PolarAngleAxisProps>
const PolarRadiusAxis =
  RechartsPolarRadiusAxis as unknown as ComponentType<PolarRadiusAxisProps>
const Radar = RechartsRadar as unknown as ComponentType<RadarProps>

function RadarChart({ data }: any) {
  return (
    <ResponsiveContainer width="100%" height={150}>
      <RechartsRadarChart
        outerRadius={50}
        data={data}
        margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
      >
        <PolarGrid />
        <PolarAngleAxis fontSize="0.8rem" dataKey="subject" />
        <PolarRadiusAxis angle={30} domain={[0, 10]} />
        <Radar
          dataKey="value"
          stroke="#dc6027"
          fill="#dc6027"
          fillOpacity={0.3}
        />
      </RechartsRadarChart>
    </ResponsiveContainer>
  )
}

export default RadarChart
