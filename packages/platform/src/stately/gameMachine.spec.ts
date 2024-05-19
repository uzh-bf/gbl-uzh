import { createActor } from 'xstate'

import { GameStateMachine } from './gameMachine'

describe('GameStateMachine', () => {
  let actor

  beforeEach(() => {
    actor = createActor(GameStateMachine, {
      input: {
        activePeriodIx: -1,
        activeSegmentIx: -1,
        periodCount: 2,
        segmentCount: 2,
      },
    })

    actor.start()
  })

  it('supports basic workflow', () => {
    actor.send({ type: 'onNext' }) // preparation
    expect(actor.getSnapshot().value).toMatchObject({
      GAME_ACTIVE: { PERIOD_ACTIVE: 'PREPARATION' },
    })
    expect(actor.getSnapshot().context.activePeriodIx).toEqual(0)
    expect(actor.getSnapshot().context.activeSegmentIx).toEqual(-1)

    actor.send({ type: 'onNext' }) // running
    expect(actor.getSnapshot().value).toMatchObject({
      GAME_ACTIVE: { PERIOD_ACTIVE: 'RUNNING' },
    })
    expect(actor.getSnapshot().context.activePeriodIx).toEqual(0)
    expect(actor.getSnapshot().context.activeSegmentIx).toEqual(0)

    actor.send({ type: 'onNext' }) // paused
    expect(actor.getSnapshot().value).toMatchObject({
      GAME_ACTIVE: { PERIOD_ACTIVE: 'PAUSED' },
    })
    expect(actor.getSnapshot().context.activePeriodIx).toEqual(0)
    expect(actor.getSnapshot().context.activeSegmentIx).toEqual(0)

    actor.send({ type: 'onNext' }) // running
    expect(actor.getSnapshot().value).toMatchObject({
      GAME_ACTIVE: { PERIOD_ACTIVE: 'RUNNING' },
    })
    expect(actor.getSnapshot().context.activePeriodIx).toEqual(0)
    expect(actor.getSnapshot().context.activeSegmentIx).toEqual(1)

    actor.send({ type: 'onNext' }) // consolidation
    expect(actor.getSnapshot().value).toMatchObject({
      GAME_ACTIVE: { PERIOD_ACTIVE: 'CONSOLIDATION' },
    })
    expect(actor.getSnapshot().context.activePeriodIx).toEqual(0)
    expect(actor.getSnapshot().context.activeSegmentIx).toEqual(-1)

    actor.send({ type: 'onNext' }) // results
    expect(actor.getSnapshot().value).toMatchObject({
      GAME_ACTIVE: 'RESULTS',
    })
    expect(actor.getSnapshot().context.activePeriodIx).toEqual(0)
    expect(actor.getSnapshot().context.activeSegmentIx).toEqual(-1)

    actor.send({ type: 'onNext' }) // preparation
    expect(actor.getSnapshot().value).toMatchObject({
      GAME_ACTIVE: { PERIOD_ACTIVE: 'PREPARATION' },
    })
    expect(actor.getSnapshot().context.activePeriodIx).toEqual(1)
    expect(actor.getSnapshot().context.activeSegmentIx).toEqual(-1)

    actor.send({ type: 'onNext' }) // running
    expect(actor.getSnapshot().value).toMatchObject({
      GAME_ACTIVE: { PERIOD_ACTIVE: 'RUNNING' },
    })
    expect(actor.getSnapshot().context.activePeriodIx).toEqual(1)
    expect(actor.getSnapshot().context.activeSegmentIx).toEqual(0)

    actor.send({ type: 'onNext' }) // paused
    expect(actor.getSnapshot().value).toMatchObject({
      GAME_ACTIVE: { PERIOD_ACTIVE: 'PAUSED' },
    })
    expect(actor.getSnapshot().context.activePeriodIx).toEqual(1)
    expect(actor.getSnapshot().context.activeSegmentIx).toEqual(0)

    actor.send({ type: 'onNext' }) // running
    expect(actor.getSnapshot().value).toMatchObject({
      GAME_ACTIVE: { PERIOD_ACTIVE: 'RUNNING' },
    })
    expect(actor.getSnapshot().context.activePeriodIx).toEqual(1)
    expect(actor.getSnapshot().context.activeSegmentIx).toEqual(1)

    actor.send({ type: 'onNext' }) // consolidation
    expect(actor.getSnapshot().value).toMatchObject({
      GAME_ACTIVE: { PERIOD_ACTIVE: 'CONSOLIDATION' },
    })
    expect(actor.getSnapshot().context.activePeriodIx).toEqual(1)
    expect(actor.getSnapshot().context.activeSegmentIx).toEqual(-1)

    actor.send({ type: 'onNext' }) // results
    expect(actor.getSnapshot().value).toMatchObject({
      GAME_ACTIVE: 'RESULTS',
    })
    expect(actor.getSnapshot().context.activePeriodIx).toEqual(1)
    expect(actor.getSnapshot().context.activeSegmentIx).toEqual(-1)

    actor.send({ type: 'onNext' }) // results
    expect(actor.getSnapshot().value).toEqual('GAME_COMPLETED')
    expect(actor.getSnapshot().context.activePeriodIx).toEqual(-1)
    expect(actor.getSnapshot().context.activeSegmentIx).toEqual(-1)

    actor.send({ type: 'onNext' }) // results
    expect(actor.getSnapshot().value).toEqual('GAME_COMPLETED')
    expect(actor.getSnapshot().context.activePeriodIx).toEqual(-1)
    expect(actor.getSnapshot().context.activeSegmentIx).toEqual(-1)
  })
})

export {}
