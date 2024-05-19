import decisionMachine from 'src/machines/decisionMachine'
import { createActor } from 'xstate'

// TODO(Jakob):
// - Next steps:
//    - When we get the new updated state, we need to write it back into our
//      DB (maybe use mutation etc. and update within the actor subscription)
// - Finish TypeScript types in the setup fn - add context etc.
export default function handler(req, res) {
  // Create Data - this is how our data looks like
  // const [performAction, updatedPlayerResult] = useMutation(
  //   PerformActionDocument,
  //   {
  //     refetchQueries: 'active',
  //   }
  // )
  // Input
  const state = {
    type: 'DECIDE_BANK',
    result: {
      assets: { bank: 10000, bonds: 0, stocks: 0, totalAssets: 10000 },
      decisions: { bank: false, bonds: false, stocks: false },
    },
    isDirty: true,
  }

  // const dataAction = {
  //   type: 'DECIDE_BANK',
  //   payload: {
  //     playerArgs: { decision: true },
  //     segmentFacts: {
  //       returns: [
  //         { bank: 0.002, bonds: -0.0019, stocks: 0.0065 },
  //         { bank: 0.002, bonds: 0.0081, stocks: -0.0935 },
  //         { bank: 0.002, bonds: -0.0019, stocks: 0.0065 },
  //       ],
  //       diceRolls: [
  //         { bonds: 6, stocks: 7 },
  //         { bonds: 8, stocks: 3 },
  //         { bonds: 6, stocks: 7 },
  //       ],
  //     },
  //     periodFacts: {
  //       scenario: {
  //         seed: 0,
  //         gapBonds: 0.005,
  //         gapStocks: 0.025,
  //         bankReturn: 0.002,
  //         trendBonds: 0.0031,
  //         trendStocks: 0.0065,
  //       },
  //       rollsPerSegment: 3,
  //     },
  //   },
  // }
  const actor = createActor(decisionMachine, {
    input: {
      result: state.result,
    },
  })

  actor.subscribe((snapshot) => {
    console.log(snapshot.context)
    state.result = snapshot.context.result
  })

  actor.start()

  actor.send({ type: 'preparationDone' })
  // State is now on Running
  actor.send({
    type: 'decideBank',
    values: {
      type: 'DECIDE_BANK',
      decision: true,
      result: state.result,
      isDirty: state.isDirty,
    },
  })

  actor.send({
    type: 'decideBonds',
    values: {
      type: 'DECIDE_BONDS',
      decision: true,
      result: state.result,
      isDirty: state.isDirty,
    },
  })

  actor.send({
    type: 'decideStocks',
    values: {
      type: 'DECIDE_STOCK',
      decision: true,
      result: state.result,
      isDirty: state.isDirty,
    },
  })

  actor.send({
    type: 'decideBank',
    values: {
      type: 'DECIDE_BANK',
      decision: false,
      result: state.result,
      isDirty: state.isDirty,
    },
  })

  // const result = await performAction({
  //   variables: {
  //     type: 'DECIDE_STOCK',
  //     payload: JSON.stringify({
  //       decision: true,
  //     }),
  //   },
  // })
  // console.log(performAction)
  // We are done
  actor.send({ type: 'submit' })

  res.status(200).json(state)
}
