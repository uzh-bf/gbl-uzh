import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart as RechartsRadarChart,
  ResponsiveContainer,
} from 'recharts'

function RadarChart({ data }) {
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
