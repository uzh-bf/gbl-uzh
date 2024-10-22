import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ScrollArea,
  Separator,
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
    bank: boolean
    bonds: boolean
    stocks: boolean
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
        <div className="flex w-1/2 items-center justify-between">
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
    <>
      <Card className="w-full min-w-[200px] max-w-[320px]">
        <CardHeader>
          <CardTitle>Final decision history</CardTitle>
          <CardDescription>
            Here is an overview of the final decisions per segment that have
            been made.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96 w-full rounded-md border p-4">
            <DecisionLayout
              title="Time"
              actionTitle="Decision"
              activeTitle="On/Off"
            >
              <div className="flex flex-col justify-between">
                {segmentDecisions.map((e) => {
                  return (
                    <div
                      className="flex flex-col justify-between py-2"
                      key={e.segment.id}
                    >
                      <div className="flex justify-between">
                        <h4 className="flex gap-2">
                          <div>P{e.period.index + 1}</div>
                          <div>S{e.segment.index + 1}</div>
                        </h4>

                        <div className="flex w-1/2 flex-col justify-between">
                          {Object.keys(e.decisions).map((type) => {
                            return (
                              <div key={type} className="flex justify-between">
                                <div>{type}</div>
                                <OnOffIcon on={e.decisions[type]} />
                              </div>
                            )
                          })}
                        </div>
                      </div>
                      <Separator className="my-2" />
                    </div>
                  )
                })}
              </div>
            </DecisionLayout>
          </ScrollArea>
        </CardContent>
      </Card>
    </>
  )
}

export { DecisionsDisplayCompact }
