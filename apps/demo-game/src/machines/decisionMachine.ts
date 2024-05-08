import { assign, setup } from 'xstate'

function getKey(actionType: string) {
  switch (actionType) {
    case 'DECIDE_BANK':
      return 'bank'
    case 'DECIDE_BONDS':
      return 'bonds'
    case 'DECIDE_STOCK':
      return 'stocks'
    default:
      return ''
  }
}

const updateResult = (result, actionType: string, decision: boolean) => {
  let output = result
  output.decisions[getKey(actionType)] = decision
  return output
}

const decisionMachine = setup({
  types: {
    input: {} as {
      result: {
        assets: {
          bank: number
          bonds: number
          stocks: number
          totalAssets: number
        }
        decisions: {
          bank: boolean
          bonds: boolean
          stocks: boolean
        }
      }
    },
  },
}).createMachine({
  id: 'decisionMachine',
  initial: 'Preparation',
  context: ({ input }) => ({
    // TODO(Jakob): is the type necessary to store? Not really..., the decision
    // comes from outside as an input. But maybe we need it somewhere else
    // (return value)
    actionType: 'DECIDE_BANK',
    result: input.result,
    isDirty: true,
  }),
  states: {
    Preparation: {
      on: {
        preparationDone: 'Running',
      },
    },
    Running: {
      on: {
        updateInvestment: {
          actions: assign({
            actionType: ({ event }) => event.values.actionType,
            result: ({ event }) =>
              updateResult(
                event.values.result,
                event.values.actionType,
                event.values.decision
              ),
            isDirty: ({ event }) => event.values.isDirty,
          }),
        },
        // decideBank: {
        //   actions: assign({
        //     actionType: ({ event }) => event.values.actionType,
        //     result: ({ event }) => updateResult(event, 'bank'),
        //     isDirty: ({ event }) => event.values.isDirty,
        //   }),
        // },
        submit: 'Paused',
      },
    },
    Paused: {},
  },
})

export default decisionMachine
