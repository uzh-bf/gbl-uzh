import * as DB from '@prisma/client'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import {
  GAME_EVENTS,
  LIFECYCLE_WORK_ORDER_TYPES,
} from '../machines/gameMachine.js'
import {
  LIFECYCLE_TRANSITION,
  LIFECYCLE_TRANSITION_KEYS,
  LIFECYCLE_WORK_ORDER_EXECUTORS,
} from './GameService.js'
import {
  planLifecycleTransition,
  type GameRowForMachine,
} from './GameMachineService.js'

function gameRow(
  status: DB.GameStatus,
  opts: {
    activePeriodIx?: number
    periodCount?: number
    segmentCount?: number
    hasActiveSegment?: boolean
    hasNextSegment?: boolean
  } = {}
): GameRowForMachine {
  const {
    activePeriodIx = 0,
    periodCount = 2,
    segmentCount = 2,
    hasActiveSegment = true,
    hasNextSegment = true,
  } = opts

  return {
    status,
    activePeriodIx,
    periods: Array.from({ length: periodCount }, (_, id) => ({ id })),
    activePeriod: {
      segmentCount,
      segments: Array.from({ length: segmentCount }, (_, id) => ({ id })),
      activeSegment: hasActiveSegment
        ? { nextSegment: hasNextSegment ? { id: 99 } : null }
        : null,
    },
  }
}

function transitionKey(plan: NonNullable<ReturnType<typeof planLifecycleTransition>>) {
  return `${plan.fromStatus}:${plan.event}:${plan.targetStatus}`
}

function candidateRows(status: DB.GameStatus): GameRowForMachine[] {
  if (status === DB.GameStatus.RESULTS) {
    return [
      gameRow(status, { activePeriodIx: 1, periodCount: 2 }),
      gameRow(status, { activePeriodIx: 2, periodCount: 2 }),
    ]
  }

  return [
    gameRow(status, {
      activePeriodIx: status === DB.GameStatus.SCHEDULED ? -1 : 0,
    }),
  ]
}

function allowedPlans() {
  const plans = new Map<
    string,
    NonNullable<ReturnType<typeof planLifecycleTransition>>
  >()

  for (const status of Object.values(DB.GameStatus)) {
    for (const game of candidateRows(status)) {
      for (const event of GAME_EVENTS) {
        const plan = planLifecycleTransition(game, event)
        if (plan) plans.set(transitionKey(plan), plan)
      }
    }
  }

  return [...plans.values()]
}

test('GameService route keys cover every allowed lifecycle transition plan', () => {
  const plans = allowedPlans()
  const plannedKeys = plans.map((plan) => {
    assert.notEqual(plan.workOrders.length, 0, transitionKey(plan))
    return transitionKey(plan)
  })

  assert.deepEqual([...LIFECYCLE_TRANSITION_KEYS].sort(), plannedKeys.sort())
})

test('GameService declares executor coverage for every lifecycle work order', () => {
  assert.deepEqual(
    Object.keys(LIFECYCLE_WORK_ORDER_EXECUTORS).sort(),
    [...LIFECYCLE_WORK_ORDER_TYPES].sort()
  )

  for (const plan of allowedPlans()) {
    for (const order of plan.workOrders) {
      assert.ok(LIFECYCLE_WORK_ORDER_EXECUTORS[order.type], order.type)
    }
  }
})

test('GameService lifecycle routing uses transition plans, not target-only lookup', () => {
  const source = readFileSync(new URL('./GameService.ts', import.meta.url), 'utf8')
  const routeSourceStart = source.indexOf('function resolveTransitionPlan')
  assert.notEqual(routeSourceStart, -1)
  const routeSource = source.slice(routeSourceStart)
  const usedRouteNames = [
    ...new Set(
      [...routeSource.matchAll(/LIFECYCLE_TRANSITION\.([A-Za-z0-9]+)/g)].map(
        (match) => match[1]
      )
    ),
  ]

  assert.match(source, /planLifecycleTransition/)
  assert.equal(source.includes('GameMachineService.nextStatus('), false)
  assert.equal(source.includes('resolveTargetStatus'), false)
  assert.deepEqual(usedRouteNames.sort(), Object.keys(LIFECYCLE_TRANSITION).sort())
})
