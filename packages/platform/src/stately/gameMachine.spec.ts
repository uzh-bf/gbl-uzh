import { createActor } from 'xstate'

import {
  BaseContext,
  BaseInput,
  Transitions,
  prepareGameStateMachine,
} from './gameMachine'

interface UserInput extends BaseInput {
  stockPrice: number
}

interface UserContext {
  stockPrice: number
}

function transitionFn(
  transitionName: string,
  context: BaseContext<UserContext>
): UserContext {
  switch (transitionName) {
    case Transitions.SCHEDULED_TO_PERIOD_ACTIVE:
      return {
        ...context.user,
        stockPrice: context.user.stockPrice + 10,
      }

    default:
      return context.user
  }
}

const GameStateMachine = prepareGameStateMachine<UserInput, UserContext>({
  initializeUserContext: (input) => ({
    stockPrice: 100,
  }),
  transitionFn,
})

describe('GameStateMachine', () => {
  let actor

  beforeEach(() => {
    actor = createActor(GameStateMachine, {
      input: {
        periodCount: 2,
        segmentCount: 2,
        stockPrice: 100,
      },
    })

    actor.start()
  })

  it('supports basic workflow', () => {
    expect(actor.getSnapshot().value).toEqual('GAME_PREPARED')
    expect(actor.getSnapshot().context.game.activePeriodIx).toEqual(-1)
    expect(actor.getSnapshot().context.game.activeSegmentIx).toEqual(-1)
    expect(actor.getSnapshot().context.user).toMatchObject({
      stockPrice: 100,
    })

    actor.send({ type: 'onNext' })
    expect(actor.getSnapshot().value).toMatchObject({
      GAME_ACTIVE: 'SCHEDULED',
    })
    expect(actor.getSnapshot().context.game.activePeriodIx).toEqual(-1)
    expect(actor.getSnapshot().context.game.activeSegmentIx).toEqual(-1)
    expect(actor.getSnapshot().context.user).toMatchObject({
      stockPrice: 100,
    })

    actor.send({ type: 'onNext' })
    expect(actor.getSnapshot().value).toMatchObject({
      GAME_ACTIVE: { PERIOD_ACTIVE: 'PREPARATION' },
    })
    expect(actor.getSnapshot().context.game.activePeriodIx).toEqual(0)
    expect(actor.getSnapshot().context.game.activeSegmentIx).toEqual(-1)
    expect(actor.getSnapshot().context.user).toMatchObject({
      stockPrice: 100,
    })

    actor.send({ type: 'onNext' })
    expect(actor.getSnapshot().value).toMatchObject({
      GAME_ACTIVE: { PERIOD_ACTIVE: 'RUNNING' },
    })
    expect(actor.getSnapshot().context.game.activePeriodIx).toEqual(0)
    expect(actor.getSnapshot().context.game.activeSegmentIx).toEqual(0)

    actor.send({ type: 'onNext' })
    expect(actor.getSnapshot().value).toMatchObject({
      GAME_ACTIVE: { PERIOD_ACTIVE: 'PAUSED' },
    })
    expect(actor.getSnapshot().context.game.activePeriodIx).toEqual(0)
    expect(actor.getSnapshot().context.game.activeSegmentIx).toEqual(0)

    actor.send({ type: 'onNext' })
    expect(actor.getSnapshot().value).toMatchObject({
      GAME_ACTIVE: { PERIOD_ACTIVE: 'RUNNING' },
    })
    expect(actor.getSnapshot().context.game.activePeriodIx).toEqual(0)
    expect(actor.getSnapshot().context.game.activeSegmentIx).toEqual(1)

    actor.send({ type: 'onNext' })
    expect(actor.getSnapshot().value).toMatchObject({
      GAME_ACTIVE: { PERIOD_ACTIVE: 'CONSOLIDATION' },
    })
    expect(actor.getSnapshot().context.game.activePeriodIx).toEqual(0)
    expect(actor.getSnapshot().context.game.activeSegmentIx).toEqual(-1)

    actor.send({ type: 'onNext' })
    expect(actor.getSnapshot().value).toMatchObject({
      GAME_ACTIVE: 'RESULTS',
    })
    expect(actor.getSnapshot().context.game.activePeriodIx).toEqual(0)
    expect(actor.getSnapshot().context.game.activeSegmentIx).toEqual(-1)

    actor.send({ type: 'onNext' })
    expect(actor.getSnapshot().value).toMatchObject({
      GAME_ACTIVE: { PERIOD_ACTIVE: 'PREPARATION' },
    })
    expect(actor.getSnapshot().context.game.activePeriodIx).toEqual(1)
    expect(actor.getSnapshot().context.game.activeSegmentIx).toEqual(-1)

    actor.send({ type: 'onNext' })
    expect(actor.getSnapshot().value).toMatchObject({
      GAME_ACTIVE: { PERIOD_ACTIVE: 'RUNNING' },
    })
    expect(actor.getSnapshot().context.game.activePeriodIx).toEqual(1)
    expect(actor.getSnapshot().context.game.activeSegmentIx).toEqual(0)

    actor.send({ type: 'onNext' })
    expect(actor.getSnapshot().value).toMatchObject({
      GAME_ACTIVE: { PERIOD_ACTIVE: 'PAUSED' },
    })
    expect(actor.getSnapshot().context.game.activePeriodIx).toEqual(1)
    expect(actor.getSnapshot().context.game.activeSegmentIx).toEqual(0)

    actor.send({ type: 'onNext' })
    expect(actor.getSnapshot().value).toMatchObject({
      GAME_ACTIVE: { PERIOD_ACTIVE: 'RUNNING' },
    })
    expect(actor.getSnapshot().context.game.activePeriodIx).toEqual(1)
    expect(actor.getSnapshot().context.game.activeSegmentIx).toEqual(1)

    actor.send({ type: 'onNext' })
    expect(actor.getSnapshot().value).toMatchObject({
      GAME_ACTIVE: { PERIOD_ACTIVE: 'CONSOLIDATION' },
    })
    expect(actor.getSnapshot().context.game.activePeriodIx).toEqual(1)
    expect(actor.getSnapshot().context.game.activeSegmentIx).toEqual(-1)

    actor.send({ type: 'onNext' })
    expect(actor.getSnapshot().value).toMatchObject({
      GAME_ACTIVE: 'RESULTS',
    })
    expect(actor.getSnapshot().context.game.activePeriodIx).toEqual(1)
    expect(actor.getSnapshot().context.game.activeSegmentIx).toEqual(-1)

    actor.send({ type: 'onNext' })
    expect(actor.getSnapshot().value).toEqual('GAME_COMPLETED')
    expect(actor.getSnapshot().context.game.activePeriodIx).toEqual(-1)
    expect(actor.getSnapshot().context.game.activeSegmentIx).toEqual(-1)

    actor.send({ type: 'onNext' })
    expect(actor.getSnapshot().value).toEqual('GAME_COMPLETED')
    expect(actor.getSnapshot().context.game.activePeriodIx).toEqual(-1)
    expect(actor.getSnapshot().context.game.activeSegmentIx).toEqual(-1)
  })
})

export {}
