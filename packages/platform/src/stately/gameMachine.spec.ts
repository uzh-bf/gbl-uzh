import { createActor } from 'xstate'

import { gameStateMachine } from './gameMachine'

describe('GameStateMachine', () => {
  it('should work', () => {
    const actor = createActor(gameStateMachine, {
      input: {
        activePeriodIx: 0,
        activeSegmentIx: 0,
        periodCount: 1,
        segmentCount: 2,
      },
    })

    actor.start()

    actor.send({ type: 'onNext' }) // preparation
    console.log(actor.getSnapshot().value)

    actor.send({ type: 'onNext' }) // running
    console.log(actor.getSnapshot().value)

    actor.send({ type: 'onNext' }) // paused
    console.log(actor.getSnapshot().value)

    actor.send({ type: 'onNext' }) // running
    console.log(actor.getSnapshot().value)

    actor.send({ type: 'onNext' }) // consolidation
    console.log(actor.getSnapshot().value)

    actor.send({ type: 'onNext' }) // results
    console.log(actor.getSnapshot().value)

    actor.send({ type: 'onNext' }) // preparation
    console.log(actor.getSnapshot().value)

    actor.send({ type: 'onNext' }) // running
    console.log(actor.getSnapshot().value)

    actor.send({ type: 'onNext' }) // paused
    console.log(actor.getSnapshot().value)
  })
})

export {}
