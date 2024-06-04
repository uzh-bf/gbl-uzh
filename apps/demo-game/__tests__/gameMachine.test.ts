import { createActor, createMachine } from 'xstate'

describe('Testing setup', () => {
  const gameStateMachine = createMachine({
    id: 'toggle',
    initial: 'Inactive',
    states: {
      Inactive: {
        on: { toggle: 'Active' },
      },
      Active: {
        on: { toggle: 'Inactive' },
      },
    },
  })

  it('is set up', () => {
    const actor = createActor(gameStateMachine, {
      input: {
        activePeriodIx: 0,
        activeSegmentIx: 0,
        periodCount: 3,
        segmentCount: 3,
      },
    })
    actor.subscribe((snapshot) => {
      console.log('Value:', snapshot.value)
    })

    actor.start()

    actor.send({ type: 'toggle' }) // logs 'Active'
    actor.send({ type: 'toggle' }) // logs 'Inactive'
  })
})

export {}
