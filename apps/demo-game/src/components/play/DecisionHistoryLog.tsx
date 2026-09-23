import { EventLog } from '@gbl-uzh/ui'

const DECISION_HISTORY_COLUMNS = [
  {
    key: 'time',
    label: 'Time',
    formatter: (_, row) => `P${row.period.index + 1} S${row.segment.index + 1}`,
  },
  {
    key: 'savings',
    label: 'Savings',
    formatter: (_, row) => `${row.decisions.bank}%`,
  },
  {
    key: 'bonds',
    label: 'Bonds',
    formatter: (_, row) => `${row.decisions.bonds}%`,
  },
  {
    key: 'stocks',
    label: 'Stocks',
    formatter: (_, row) => `${row.decisions.stocks}%`,
  },
]

export function formatSegmentEndResults(results: any[]) {
  return results
    .filter((o) => o.type == 'SEGMENT_END')
    .map((e) => ({
      period: e.period,
      segment: e.segment,
      decisions: e.facts.decisions,
    }))
    .reverse()
}

function DecisionHistoryLog({ data }: { data: any[] }) {
  return (
    <EventLog
      title="Decision History"
      description="Chronological record of your portfolio allocation decisions across savings, bonds, and stocks by time period. P: Period S: Segment"
      data={data}
      maxHeightClass="h-56"
      columns={DECISION_HISTORY_COLUMNS}
    />
  )
}

export default DecisionHistoryLog
