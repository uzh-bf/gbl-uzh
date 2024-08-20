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

interface TransactionProps {
  periodIx: number
  segmentIx: number
  type: string
  facts: { decision: boolean }
}

interface TransactionsDisplayProps {
  transactions: TransactionProps[]
}

function TransactionLayout({
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

function TransactionDisplay({
  transaction,
}: {
  transaction: TransactionProps
}) {
  return (
    <div>
      <TransactionLayout
        title={`P ${transaction.periodIx} S ${transaction.segmentIx}`}
        actionTitle={transaction.type.substring('DECIDE_'.length)}
        icon={<OnOffIcon on={transaction.facts.decision} />}
      />
    </div>
  )
}

function TransactionsDisplay({ transactions }: TransactionsDisplayProps) {
  return (
    <>
      <Card className="w-full min-w-[200px] max-w-[320px]">
        <CardHeader>
          <CardTitle>Transaction history</CardTitle>
          <CardDescription>
            Here is an overview of all the transactions that have been made.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96 w-full rounded-md border p-4">
            <TransactionLayout
              title="Time"
              actionTitle="Action"
              activeTitle="On/Off"
            >
              {transactions
                .slice(0)
                .reverse()
                .map((transaction) => {
                  const key = `transaction-${transaction.periodIx}-${transaction.segmentIx}`
                  return (
                    <TransactionDisplay transaction={transaction} key={key} />
                  )
                })}
            </TransactionLayout>
          </ScrollArea>
        </CardContent>
      </Card>
    </>
  )
}

function TransactionsDisplayCompact({
  transactions,
}: TransactionsDisplayProps) {
  const transactionsReduced = transactions.reduce((acc, transaction) => {
    const key = `transaction-${transaction.periodIx}-${transaction.segmentIx}`

    if (!acc.hasOwnProperty(key)) {
      acc[key] = {
        periodIx: transaction.periodIx,
        segmentIx: transaction.segmentIx,
        transactions: {
          [transaction.type]: transaction.facts.decision,
        },
      }
    } else {
      acc[key].transactions[transaction.type] = transaction.facts.decision
    }

    return acc
  }, {})
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
            <TransactionLayout
              title="Time"
              actionTitle="Action"
              activeTitle="On/Off"
            >
              <div className="flex flex-col justify-between">
                {Object.keys(transactionsReduced)
                  .sort()
                  .reverse()
                  .map((key) => {
                    const transaction = transactionsReduced[key]
                    return (
                      <div
                        className="flex flex-col justify-between py-2"
                        key={key}
                      >
                        <div className="flex justify-between">
                          <h4 className="flex gap-2">
                            <div>P {transaction.periodIx}</div>
                            <div>S {transaction.segmentIx}</div>
                          </h4>

                          <div className="flex w-1/2 flex-col justify-between">
                            {Object.keys(transaction.transactions)
                              .sort()
                              .map((type) => {
                                return (
                                  <div
                                    key={type}
                                    className="flex justify-between"
                                  >
                                    <div>
                                      {type.substring('DECIDE_'.length)}
                                    </div>
                                    <OnOffIcon
                                      on={transaction.transactions[type]}
                                    />
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
            </TransactionLayout>
          </ScrollArea>
        </CardContent>
      </Card>
    </>
  )
}

export { TransactionDisplay, TransactionsDisplay, TransactionsDisplayCompact }
