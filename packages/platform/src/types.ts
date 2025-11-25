import { Prisma, PrismaClient } from '@prisma/client'
import { DefaultArgs } from '@prisma/client/runtime/library'
import { NextPageContext } from 'next'
import type yup from 'yup'

export type TxType = Omit<
  PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>

export enum UserRole {
  PLAYER = 'PLAYER',
  ADMIN = 'ADMIN',
}

export type UpdatePlayerDataArgs<PlayerFactsType> = {
  name?: string
  facts: PlayerFactsType
}

export enum LearningElementState {
  NEW = 'NEW',
  ATTEMPTED = 'ATTEMPTED',
  SOLVED = 'SOLVED',
}

export type Notification<NotificationType> = {
  type: NotificationType
  sub?: string
  facts?: any
}

export type Event<EventType> = {
  type: EventType
  sub?: string
  facts?: any
}

export type OutputFactsGame<GameFactsType, NotificationType, EventType> = {
  updatedGameFacts?: GameFactsType
  notifications?: Notification<NotificationType>[]
  events?: Event<EventType>[]
}

// TODO(JJ): remove isDirty for ActionReducer
export type OutputFactsUser<
  FactsType,
  NotificationType,
  GlobalNotificationType,
  EventType
> = {
  result: FactsType
  isDirty?: boolean
  extras?: any
  actions?: any[]
  notifications?: Notification<NotificationType>[]
  globalNotification?: Notification<GlobalNotificationType>
  events?: Event<EventType>[]
  specificFacts?: any
  // TODO(JJ): Maybe remove these
  gameFactsToUpdate?: any
  updatedPeriodFacts?: any
  updatedSegmentFacts?: any
}

export type OutputFacts<FactsType, NotificationType, EventType> = {
  resultFacts: FactsType
  actions?: any[]
  extras?: any
  events?: Event<EventType>[]
  notifications?: Notification<NotificationType>[]
  specificFacts?: any
}

export type Action<ActionType, PayloadType, PrismaType> = {
  type: ActionType
  payload: PayloadType
  ctx?: CtxWithPrisma<PrismaType>
}

export type PayloadGame = {
  periodIx: number
  segmentIx: number
  // TODO(JJ): Add whatever we need
}

export type PayloadPeriodInitialisation<
  GameFactsType,
  PeriodFactsType,
  PeriodSegmentFactsType
> = {
  periodIx: number
  gameFacts: GameFactsType
  periodFacts: PeriodFactsType
  previousPeriodFacts?: PeriodFactsType
  previousSegmentFacts?: PeriodSegmentFactsType
}

export type PayloadPeriodConsolidation<GameFactsType, PeriodSegmentFactsType> =
  {
    periodIx: number
    gameFacts: GameFactsType
    previousSegmentFacts?: PeriodSegmentFactsType
  }

export type PayloadPeriodResult<
  GameFactsType,
  PeriodFactsType,
  PlayerRoleType
> = {
  playerRole: PlayerRoleType
  gameFacts: GameFactsType
  periodFacts: PeriodFactsType
}

export type PayloadPeriodResultEnd<
  ResultsFactsType,
  GameFactsType,
  PeriodFactsType,
  PeriodSegmentFactsType,
  PlayerRoleType
> = {
  segmentEndResults: ResultsFactsType
  otherPlayersSegmentEndResults: ResultsFactsType
  gameFacts: GameFactsType
  periodFacts: PeriodFactsType
  segmentFacts: PeriodSegmentFactsType
  playerRole: PlayerRoleType
  playerLevel: number
  playerExperience: number
  consolidationDecisions: any
  periodIx: number
  segmentIx: number
}

export type PayloadSegment<
  GameFactsType,
  PeriodFactsType,
  PeriodSegmentFactsType
> = {
  segmentIx: number
  segmentCount: number
  periodIx: number
  gameFacts: GameFactsType
  periodFacts: PeriodFactsType
  previousSegmentFacts?: PeriodSegmentFactsType
}

export type PayloadSegmentResult<
  GameFactsType,
  PeriodFactsType,
  PeriodSegmentFactsType,
  PlayerRoleType
> = {
  playerRole: PlayerRoleType
  gameFacts: GameFactsType
  periodFacts: PeriodFactsType
  segmentFacts: PeriodSegmentFactsType
  nextSegmentFacts?: PeriodSegmentFactsType
  segmentIx: number
}

interface Game<FactsType, GameFactsType, NotificationType, EventType> {
  // TODO(JJ): This should rather be an initialize fn when creating the game
  update: (
    facts: FactsType,
    payload: PayloadGame
  ) => OutputFactsGame<GameFactsType, NotificationType, EventType>
}

// TODO(JJ):
// - Replace StateType with unknown -> second step in a different branch

interface Period<
  FactsType,
  GameFactsType,
  PeriodFactsType,
  PeriodSegmentFactsType,
  NotificationType,
  EventType,
  // TODO(JJ): Decide what to do with prisma -> goes into payload?
  // -> add a third param: ctx: CtxWithPrisma
  PrismaType
> {
  initialize: (
    facts: FactsType,
    payload: PayloadPeriodInitialisation<
      GameFactsType,
      PeriodFactsType,
      PeriodSegmentFactsType
    >
  ) => OutputFacts<FactsType, NotificationType, EventType>
  consolidate: (
    facts: FactsType,
    payload: PayloadPeriodConsolidation<GameFactsType, PeriodSegmentFactsType>
  ) => OutputFacts<FactsType, NotificationType, EventType>

  updateDBAfterInitialize: (
    tx: TxType,
    facts: any,
    payload: any
  ) => Promise<void>
}

interface PeriodResult<
  FactsType,
  GameFactsType,
  ResultFactsType,
  PeriodFactsType,
  PeriodSegmentFactsType,
  PlayerRoleType,
  NotificationType,
  EventType,
  PrismaType
> {
  initialize: (
    facts: FactsType,
    payload: PayloadPeriodResult<GameFactsType, PeriodFactsType, PlayerRoleType>
  ) => OutputFacts<FactsType, NotificationType, EventType>
  start: (
    facts: FactsType,
    payload: PayloadPeriodResult<GameFactsType, PeriodFactsType, PlayerRoleType>
  ) => OutputFacts<FactsType, NotificationType, EventType>
  end: (
    facts: FactsType,
    payload: PayloadPeriodResultEnd<
      GameFactsType,
      ResultFactsType,
      PeriodFactsType,
      PeriodSegmentFactsType,
      PlayerRoleType
    >
  ) => OutputFacts<FactsType, NotificationType, EventType>
  updateDBAfterEnd: (
    tx: TxType,
    facts: any,
    payload: { gameId: number }
  ) => Promise<any>
}

interface Segment<
  FactsType,
  GameFactsType,
  PeriodFactsType,
  PeriodSegmentFactsType,
  NotificationType,
  EventType,
  PrismaType
> {
  initialize: (
    facts: FactsType,
    payload: PayloadSegment<
      GameFactsType,
      PeriodFactsType,
      PeriodSegmentFactsType
    >
  ) => OutputFacts<FactsType, NotificationType, EventType>

  updateDBAfterInitialize: (
    tx: TxType,
    facts: any,
    payload: { gameId: number }
  ) => Promise<void>
  updateDBBeforeActivation: (
    tx: TxType,
    payload: {
      gameId: number
      periodIx: number
      segmentIx: number
    }
  ) => Promise<void>
}

interface SegmentResult<
  FactsType,
  GameFactsType,
  PeriodFactsType,
  PeriodSegmentFactsType,
  PlayerRoleType,
  NotificationType,
  EventType,
  PrismaType
> {
  initialize: (
    facts: FactsType,
    payload: PayloadSegmentResult<
      GameFactsType,
      PeriodFactsType,
      PeriodSegmentFactsType,
      PlayerRoleType
    >
  ) => OutputFacts<FactsType, NotificationType, EventType>
  start: (
    facts: FactsType,
    payload: PayloadSegmentResult<
      GameFactsType,
      PeriodFactsType,
      PeriodSegmentFactsType,
      PlayerRoleType
    >
  ) => OutputFacts<FactsType, NotificationType, EventType>
  end: (
    facts: FactsType,
    payload: PayloadSegmentResult<
      GameFactsType,
      PeriodFactsType,
      PeriodSegmentFactsType,
      PlayerRoleType
    >
  ) => OutputFacts<FactsType, NotificationType, EventType>
}

interface Reducer<
  StateType,
  ActionType,
  PayloadType,
  NotificationType,
  GlobalNotificationType,
  EventType,
  PrismaType
> {
  apply: (
    state: StateType,
    action: Action<ActionType, PayloadType, PrismaType>
  ) => OutputFactsUser<
    StateType,
    NotificationType,
    GlobalNotificationType,
    EventType
  >
  updateDBAfterApply: (
    tx: TxType,
    facts: any,
    payload: { gameId: number }
  ) => Promise<void>
  ActionTypes: Record<string, string>
}

interface Services<PrismaType> {
  GameFacts: Game<any, any, any, any>
  Actions: Reducer<any, any, any, any, any, any, PrismaType>
  Period: Period<any, any, any, any, any, any, PrismaType>
  PeriodResult: PeriodResult<any, any, any, any, any, any, any, any, PrismaType>
  Segment: Segment<any, any, any, any, any, any, PrismaType>
  SegmentResult: SegmentResult<any, any, any, any, any, any, any, PrismaType>
}

export interface CtxWithPrisma<PrismaType> extends NextPageContext {
  prisma: PrismaType
  user: {
    sub: string
    role: UserRole
    gameId?: number
  }
}

export interface CtxWithFacts<FactsType, PrismaType> {
  services: Services<PrismaType>
}

export interface CtxWithFactsAndSchema<FactsType, PrismaType> {
  schema: yup.Schema<FactsType>
  services: Services<PrismaType>
}

export enum BaseGlobalNotificationType {
  GAME_STATE_UPDATED = 'GAME_STATE_UPDATED',
  PERIOD_ACTIVATED = 'PERIOD_ACTIVATED',
  SEGMENT_ACTIVATED = 'SEGMENT_ACTIVATED',
  COUNTDOWN_UPDATED = 'COUNTDOWN_UPDATED',
  ACTION_PERFORMED = 'ACTION_PERFORMED',
  SWITCH_TOGGLED = 'SWITCH_TOGGLED',
}

export enum BaseUserNotificationType {
  LEARNING_ELEMENT_SOLVED = 'LEARNING_ELEMENT_SOLVED',
  LEARNING_ELEMENT_INCORRECT = 'LEARNING_ELEMENT_INCORRECT',
  ACHIEVEMENT_RECEIVED = 'ACHIEVEMENT_RECEIVED',
  LEVEL_UP = 'LEVEL_UP',
}
