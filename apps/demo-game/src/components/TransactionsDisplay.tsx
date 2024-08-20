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

function TransactionDisplay({
  transaction,
}: {
  transaction: TransactionProps
}) {
  const key = `transaction-${transaction.periodIx}-${transaction.segmentIx}`
  return (
    <div className="flex flex-col border-b-2 py-2" key={key}>
      <div className="flex gap-2">
        <div>P {transaction.periodIx}</div>
        <div>Q {transaction.segmentIx}</div>
      </div>
      <div className="flex justify-between">
        <div>Decision: {transaction.type}</div>
        <div> {transaction.facts.decision ? 'On' : 'Off'} </div>
      </div>
    </div>
  )
}

function TransactionsDisplay({ transactions }: TransactionsDisplayProps) {
  return (
    <div className="m-4">
      <h1 className="border-b-2 text-xl font-bold">Transaction history</h1>
      {transactions
        .slice(0)
        .reverse()
        .map((transaction) => {
          const key = `transaction-${transaction.periodIx}-${transaction.segmentIx}`
          return <TransactionDisplay transaction={transaction} key={key} />
        })}
    </div>
  )
}

function TransactionsDisplayCompact({
  transactions,
}: TransactionsDisplayProps) {
  // let transactionsReduced = {}
  // for (let index = 0; index < transactions.length; index++) {
  //   const transaction = transactions[index]
  //   const key = `transaction-${transaction.periodIx}-${transaction.segmentIx}`
  //   // if (!transactionsReduced.hasOwnProperty(key)) {
  //   //   transactionsReduced[key] = {
  //   //     periodIx: transaction.periodIx,
  //   //     segmentIx: transaction.segmentIx,
  //   //     transactions: {},
  //   //   }
  //   // }
  //   transactionsReduced[key] = {
  //     periodIx: transaction.periodIx,
  //     segmentIx: transaction.segmentIx,
  //     transactions: transactionsReduced[key]
  //       ? transactionsReduced[key].transactions
  //       : {},
  //   }
  //   transactionsReduced[key].transactions[transaction.type] =
  //     transaction.facts.decision
  // }

  const transactionsReduced = transactions.reduce((acc, transaction) => {
    const key = `transaction-${transaction.periodIx}-${transaction.segmentIx}`
    acc[key] = {
      periodIx: transaction.periodIx,
      segmentIx: transaction.segmentIx,
      transactions: acc[key] ? acc[key].transactions ?? {} : {},
    }
    acc[key].transactions[transaction.type] = transaction.facts.decision
    return acc
  }, {})
  return (
    <div className="m-4">
      <h1 className="border-b-2 text-xl font-bold">Decision history</h1>
      {Object.keys(transactionsReduced).map((key) => {
        const transaction = transactionsReduced[key]
        return (
          <div className="flex flex-col border-b-2 py-2" key={key}>
            <div className="flex gap-2">
              <div>P {transaction.periodIx}</div>
              <div>Q {transaction.segmentIx}</div>
            </div>

            <div className="flex justify-between">
              <div>Decisions:</div>
              {Object.keys(transaction.transactions)
                .sort()
                .map((type) => {
                  return (
                    <div className="flex justify-between">
                      <div className="flex flex-col items-center">
                        <div>{type.substring('DECIDE_'.length)}</div>
                        <div
                          className={twMerge(
                            'h-4 w-4 rounded-full',
                            transaction.transactions[type]
                              ? 'bg-uzh-blue-100'
                              : 'bg-uzh-blue-20'
                          )}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export { TransactionDisplay, TransactionsDisplay, TransactionsDisplayCompact }
