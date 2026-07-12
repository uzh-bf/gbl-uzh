import { useRouter } from 'next/router'

import { useQuery } from '@apollo/client'
import {
  GameDocument,
  SpecificResultsDocument,
} from 'src/graphql/generated/ops'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  ShadcnTable as Table,
  ShadcnTableBody as TableBody,
  ShadcnTableCell as TableCell,
  ShadcnTableHead as TableHead,
  ShadcnTableHeader as TableHeader,
  ShadcnTableRow as TableRow,
} from '@uzh-bf/design-system'

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'

const colors = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

function ReportGame() {
  const router = useRouter()

  const { data, error, loading } = useQuery(GameDocument, {
    variables: { id: Number(router.query.id) },
    skip: !router.query.id,
  })

  const { data: resultsData } = useQuery(SpecificResultsDocument, {
    variables: { gameId: Number(router.query.id), type: 'PERIOD_END' },
    skip: !router.query.id,
  })

  if (loading || !data?.game) return <div>loading...</div>
  if (error) return <div>{error.message}</div>

  const game = data.game
  const playersById = Object.fromEntries(
    game.players.map((p) => [p.id, p.name])
  )

  const periodEndResults = resultsData?.specificResults ?? []

  // one series point per (player, period): equity after that year
  const byPeriod: Record<number, any> = {}
  const latestByPlayer: Record<string, any> = {}
  periodEndResults.forEach((r: any) => {
    const periodIx = r.period?.index ?? r.facts?.history?.slice(-1)[0]?.periodIx
    const label = `Year ${periodIx + 1}`
    byPeriod[periodIx] = byPeriod[periodIx] ?? { year: label }
    byPeriod[periodIx][playersById[r.player?.id] ?? r.player?.id] =
      r.facts?.equity
    latestByPlayer[r.player?.id] = r.facts
  })
  const equityData = Object.keys(byPeriod)
    .sort((a, b) => Number(a) - Number(b))
    .map((k) => byPeriod[Number(k)])

  const chartConfig = Object.fromEntries(
    game.players.map((p, ix) => [
      p.name,
      { label: p.name, color: colors[ix % colors.length] },
    ])
  )

  const standings = Object.entries(latestByPlayer)
    .map(([playerId, facts]: [string, any]) => ({
      playerId,
      name: playersById[playerId] ?? playerId,
      equity: facts?.equity,
      cumulativeProfit: facts?.cumulativeProfit,
      rank: facts?.rank,
      lastDecisions: facts?.history?.slice(-1)[0]?.decisions,
    }))
    .sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99))

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="text-xl font-bold">
        Rate Wars report — {game.name} (status {game.status})
      </div>

      <Card data-cy="admin-leaderboard">
        <CardHeader>
          <CardTitle>Standings</CardTitle>
          <CardDescription>
            After the most recent completed year.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Bank</TableHead>
                <TableHead className="text-right">Equity</TableHead>
                <TableHead className="text-right">Cumulative profit</TableHead>
                <TableHead className="text-right">Deposit rate</TableHead>
                <TableHead className="text-right">Loan rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {standings.map((s) => (
                <TableRow key={s.playerId}>
                  <TableCell>{s.rank}</TableCell>
                  <TableCell>{s.name}</TableCell>
                  <TableCell className="text-right">
                    {s.equity?.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {s.cumulativeProfit?.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {s.lastDecisions?.depositRate?.toFixed(2)}%
                  </TableCell>
                  <TableCell className="text-right">
                    {s.lastDecisions?.loanRate?.toFixed(2)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Equity per bank over the years</CardTitle>
          <CardDescription>
            The debrief chart: who built capital, who burned it, and when.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <LineChart data={equityData} accessibilityLayer>
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              {game.players.map((p, ix) => (
                <Line
                  key={p.id}
                  type="natural"
                  dataKey={p.name}
                  stroke={colors[ix % colors.length]}
                  strokeWidth={2}
                />
              ))}
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="year"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <ChartLegend content={<ChartLegendContent />} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

export default ReportGame
