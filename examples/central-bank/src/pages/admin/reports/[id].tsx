import { useQuery } from '@apollo/client'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ShadcnTable as Table,
  ShadcnTableBody as TableBody,
  ShadcnTableCell as TableCell,
  ShadcnTableHead as TableHead,
  ShadcnTableHeader as TableHeader,
  ShadcnTableRow as TableRow,
} from '@uzh-bf/design-system'
import { useRouter } from 'next/router'
import {
  GameDocument,
  SpecificResultsDocument,
} from 'src/graphql/generated/ops'

export default function ReportGame() {
  const router = useRouter()
  const gameId = Number(router.query.id)

  const { data, error, loading } = useQuery(GameDocument, {
    variables: { id: gameId },
    skip: !router.query.id,
  })

  const { data: periodResultsData, loading: periodResultsLoading } = useQuery(
    SpecificResultsDocument,
    {
      variables: {
        gameId,
        type: 'PERIOD_END',
      },
      skip: !router.query.id,
    }
  )

  if (loading || periodResultsLoading) {
    return <div className="p-8 text-center">Loading Report...</div>
  }

  if (error || !data?.game) {
    return (
      <div className="p-8 text-red-500">
        Error loading game: {error?.message}
      </div>
    )
  }

  const game = data.game
  const periodResults = periodResultsData?.specificResults || []

  // Group and compile player results
  const playerSummaryMap: Record<
    string,
    {
      name: string
      level: number
      cumulativePenalty: number
      inflation: number
      unemployment: number
      growth: number
    }
  > = {}

  // Initialize with teams
  game.players.forEach((p: any) => {
    playerSummaryMap[p.id] = {
      name: p.name,
      level: p.level?.index ?? 0,
      cumulativePenalty: 0,
      inflation: 0,
      unemployment: 0,
      growth: 0,
    }
  })

  // Aggregate from results
  periodResults.forEach((r: any) => {
    let facts = r.facts
    if (typeof facts === 'string') {
      try {
        facts = JSON.parse(facts)
      } catch (e) {
        facts = {}
      }
    }
    const playerId = r.player.id
    if (playerSummaryMap[playerId] && facts) {
      playerSummaryMap[playerId].cumulativePenalty =
        facts.cumulativePenalty ?? 0
      playerSummaryMap[playerId].inflation = facts.inflation ?? 0
      playerSummaryMap[playerId].unemployment = facts.unemployment ?? 0
      playerSummaryMap[playerId].growth = facts.growth ?? 0
    }
  })

  const sortedSummaries = Object.values(playerSummaryMap).sort(
    (a, b) => a.cumulativePenalty - b.cumulativePenalty
  )

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-8">
      <div
        className="flex items-center justify-between"
        data-cy="report-loaded"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{game.name}</h1>
          <p className="text-muted-foreground mt-1">
            Central Bank Game Final Report
          </p>
        </div>
        <div className="text-right">
          <div className="font-mono text-sm">
            Status: <span className="font-semibold">{game.status}</span>
          </div>
          <div className="font-mono text-sm">
            Periods:{' '}
            <span className="font-semibold">{game.periods.length}</span>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leaderboard (Cumulative Policy Loss)</CardTitle>
          <CardDescription>
            Lower cumulative loss indicates better monetary policy performance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Team Name</TableHead>
                <TableHead className="text-right">Latest Inflation</TableHead>
                <TableHead className="text-right">
                  Latest Unemployment
                </TableHead>
                <TableHead className="text-right">Latest Growth</TableHead>
                <TableHead className="text-right">Cumulative Loss</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSummaries.map((summary, ix) => (
                <TableRow key={summary.name}>
                  <TableCell className="font-bold">{ix + 1}</TableCell>
                  <TableCell className="font-semibold">
                    {summary.name}
                  </TableCell>
                  <TableCell className="text-right">
                    {summary.inflation.toFixed(2)}%
                  </TableCell>
                  <TableCell className="text-right">
                    {summary.unemployment.toFixed(2)}%
                  </TableCell>
                  <TableCell className="text-right">
                    {summary.growth.toFixed(2)}%
                  </TableCell>
                  <TableCell className="text-primary text-right font-mono font-bold">
                    {summary.cumulativePenalty.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
