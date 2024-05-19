import { createActor } from 'xstate'

import { prepareGameStateMachine } from './gameMachine'

type MachineInput = {
  periodCount: number
  segmentCount: number
}

type MachineContext = {
  activePeriodIx: number
  activeSegmentIx: number
  periodCount: number
  segmentCount: number
}

const GameStateMachine = prepareGameStateMachine<MachineInput, MachineContext>({
  initializeContext: (input) => ({
    periodCount: input.periodCount,
    segmentCount: input.segmentCount,
  }),
})

describe('GameStateMachine', () => {
  let actor

  beforeEach(() => {
    actor = createActor(GameStateMachine, {
      input: {
        periodCount: 2,
        segmentCount: 2,
      },
    })

    actor.start()
  })

  it('supports basic workflow', () => {
    actor.send({ type: 'onNext' })
    expect(actor.getSnapshot().value).toMatchObject({
      GAME_ACTIVE: { PERIOD_ACTIVE: 'PREPARATION' },
    })
    expect(actor.getSnapshot().context.activePeriodIx).toEqual(0)
    expect(actor.getSnapshot().context.activeSegmentIx).toEqual(-1)

    actor.send({ type: 'onNext' })
    expect(actor.getSnapshot().value).toMatchObject({
      GAME_ACTIVE: { PERIOD_ACTIVE: 'RUNNING' },
    })
    expect(actor.getSnapshot().context.activePeriodIx).toEqual(0)
    expect(actor.getSnapshot().context.activeSegmentIx).toEqual(0)

    actor.send({ type: 'onNext' })
    expect(actor.getSnapshot().value).toMatchObject({
      GAME_ACTIVE: { PERIOD_ACTIVE: 'PAUSED' },
    })
    expect(actor.getSnapshot().context.activePeriodIx).toEqual(0)
    expect(actor.getSnapshot().context.activeSegmentIx).toEqual(0)

    actor.send({ type: 'onNext' })
    expect(actor.getSnapshot().value).toMatchObject({
      GAME_ACTIVE: { PERIOD_ACTIVE: 'RUNNING' },
    })
    expect(actor.getSnapshot().context.activePeriodIx).toEqual(0)
    expect(actor.getSnapshot().context.activeSegmentIx).toEqual(1)

    actor.send({ type: 'onNext' })
    expect(actor.getSnapshot().value).toMatchObject({
      GAME_ACTIVE: { PERIOD_ACTIVE: 'CONSOLIDATION' },
    })
    expect(actor.getSnapshot().context.activePeriodIx).toEqual(0)
    expect(actor.getSnapshot().context.activeSegmentIx).toEqual(-1)

    actor.send({ type: 'onNext' })
    expect(actor.getSnapshot().value).toMatchObject({
      GAME_ACTIVE: 'RESULTS',
    })
    expect(actor.getSnapshot().context.activePeriodIx).toEqual(0)
    expect(actor.getSnapshot().context.activeSegmentIx).toEqual(-1)

    actor.send({ type: 'onNext' })
    expect(actor.getSnapshot().value).toMatchObject({
      GAME_ACTIVE: { PERIOD_ACTIVE: 'PREPARATION' },
    })
    expect(actor.getSnapshot().context.activePeriodIx).toEqual(1)
    expect(actor.getSnapshot().context.activeSegmentIx).toEqual(-1)

    actor.send({ type: 'onNext' })
    expect(actor.getSnapshot().value).toMatchObject({
      GAME_ACTIVE: { PERIOD_ACTIVE: 'RUNNING' },
    })
    expect(actor.getSnapshot().context.activePeriodIx).toEqual(1)
    expect(actor.getSnapshot().context.activeSegmentIx).toEqual(0)

    actor.send({ type: 'onNext' })
    expect(actor.getSnapshot().value).toMatchObject({
      GAME_ACTIVE: { PERIOD_ACTIVE: 'PAUSED' },
    })
    expect(actor.getSnapshot().context.activePeriodIx).toEqual(1)
    expect(actor.getSnapshot().context.activeSegmentIx).toEqual(0)

    actor.send({ type: 'onNext' })
    expect(actor.getSnapshot().value).toMatchObject({
      GAME_ACTIVE: { PERIOD_ACTIVE: 'RUNNING' },
    })
    expect(actor.getSnapshot().context.activePeriodIx).toEqual(1)
    expect(actor.getSnapshot().context.activeSegmentIx).toEqual(1)

    actor.send({ type: 'onNext' })
    expect(actor.getSnapshot().value).toMatchObject({
      GAME_ACTIVE: { PERIOD_ACTIVE: 'CONSOLIDATION' },
    })
    expect(actor.getSnapshot().context.activePeriodIx).toEqual(1)
    expect(actor.getSnapshot().context.activeSegmentIx).toEqual(-1)

    actor.send({ type: 'onNext' })
    expect(actor.getSnapshot().value).toMatchObject({
      GAME_ACTIVE: 'RESULTS',
    })
    expect(actor.getSnapshot().context.activePeriodIx).toEqual(1)
    expect(actor.getSnapshot().context.activeSegmentIx).toEqual(-1)

    actor.send({ type: 'onNext' })
    expect(actor.getSnapshot().value).toEqual('GAME_COMPLETED')
    expect(actor.getSnapshot().context.activePeriodIx).toEqual(-1)
    expect(actor.getSnapshot().context.activeSegmentIx).toEqual(-1)

    actor.send({ type: 'onNext' })
    expect(actor.getSnapshot().value).toEqual('GAME_COMPLETED')
    expect(actor.getSnapshot().context.activePeriodIx).toEqual(-1)
    expect(actor.getSnapshot().context.activeSegmentIx).toEqual(-1)
  })
})

export {}
