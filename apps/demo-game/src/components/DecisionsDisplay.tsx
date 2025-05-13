import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ScrollArea,
  Separator,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@uzh-bf/design-system/dist/future'
import { twMerge } from 'tailwind-merge'

interface ObjectProps {
  id: string
  index: number
}

interface DecisionProps {
  period: ObjectProps
  segment: ObjectProps
  decisions: {
    bank: number
    bonds: number
    stocks: number
  }
}

interface DecisionDisplayProps {
  segmentDecisions: DecisionProps[]
}

function DecisionLayout({
  title,
  actionTitle,
  activeTitle,
  icon,
  children,
  separator = true,
}: {
  title?: string
  actionTitle?: string
  activeTitle?: string
  icon?: React.ReactNode
  children?: React.ReactNode
  separator?: boolean
}) {
  return (
    <div>
      <div className="flex justify-between">
        {title && <div>{title}</div>}
        <div className="flex min-w-36 items-center justify-between">
          {actionTitle && <div>{actionTitle}</div>}
          {activeTitle && <div>{activeTitle}</div>}
          {icon}
        </div>
      </div>
      {separator && <Separator className="my-2" />}
      {children}
    </div>
  )
}

function OnOffIcon({ on = false }: { on?: boolean }) {
  return (
    <div
      className={twMerge(
        'h-4 w-4 rounded-full',
        on ? 'bg-uzh-blue-100' : 'bg-uzh-blue-20'
      )}
    />
  )
}

function DecisionsDisplayCompact({ segmentDecisions }: DecisionDisplayProps) {
  return (
    <Card className="max-w-80">
      <CardHeader>
        <CardTitle>Decision History</CardTitle>
        <CardDescription>
          Chronological record of your portfolio allocation decisions across
          savings, bonds, and stocks by time period.
          <br /> P: Period S: Segment
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* <ScrollArea className="h-96 rounded-md border p-4"> */}
        <ScrollArea className="h-56">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Savings</TableHead>
                <TableHead>Bonds</TableHead>
                <TableHead>Stocks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {segmentDecisions.map((e) => {
                return (
                  <TableRow key={e.segment.id}>
                    <TableCell className="flex text-nowrap">
                      P{e.period.index + 1} S{e.segment.index + 1}
                    </TableCell>
                    <TableCell>
                      {/* <OnOffIcon on={e.decisions.bank} /> */}
                      <div className="flex justify-center">
                        {e.decisions.bank}%
                      </div>
                    </TableCell>
                    <TableCell>
                      {/* <OnOffIcon on={e.decisions.bonds} /> */}
                      <div className="flex justify-center">
                        {e.decisions.bonds}%
                      </div>
                    </TableCell>
                    <TableCell>
                      {/* <OnOffIcon on={e.decisions.stocks} /> */}
                      <div className="flex justify-center">
                        {e.decisions.stocks}%
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export { DecisionsDisplayCompact }
