import { NextPageContext } from 'next'
import type yup from 'yup'

export enum UserRole {
  PLAYER = 'PLAYER',
  ADMIN = 'ADMIN',
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

// TODO(JJ): remove isDirty for ActionReducer
export type OutputFactsUser<FactsType, NotificationType, EventType> = {
  result: FactsType
  isDirty?: boolean
  extras?: any
  actions?: any[]
  notifications?: Notification<NotificationType>[]
  events?: Event<EventType>[]
}

export type OutputFacts<FactsType, NotificationType, EventType> = {
  resultFacts: FactsType
  actions?: any[]
  extras?: any
  events?: Event<EventType>[]
  notifications?: Notification<NotificationType>[]
}

export type Action<ActionType, PayloadType, PrismaType> = {
  type: ActionType
  payload: PayloadType
  ctx?: CtxWithPrisma<PrismaType>
}

export type PayloadPeriodInitialisation<
  PeriodFactsType,
  PeriodSegmentFactsType
> = {
  periodIx: number
  periodFacts: PeriodFactsType
  previousPeriodFacts?: PeriodFactsType
  previousSegmentFacts?: PeriodSegmentFactsType
}

export type PayloadPeriodConsolidation<PeriodSegmentFactsType> = {
  periodIx: number
  previousSegmentFacts?: PeriodSegmentFactsType
}

export type PayloadPeriodResult<PeriodFactsType, PlayerRoleType> = {
  playerRole: PlayerRoleType
  periodFacts: PeriodFactsType
}

export type PayloadPeriodResultEnd<
  PeriodFactsType,
  PeriodSegmentFactsType,
  PlayerRoleType
> = {
  periodFacts: PeriodFactsType
  segmentFacts: PeriodSegmentFactsType
  playerRole: PlayerRoleType
  playerLevel: number
  playerExperience: number
  consolidationDecisions: any
  periodIx: number
  segmentIx: number
}

export type PayloadSegment<PeriodFactsType, PeriodSegmentFactsType> = {
  segmentIx: number
  segmentCount: number
  periodIx: number
  periodFacts: PeriodFactsType
  previousSegmentFacts?: PeriodSegmentFactsType
}

export type PayloadSegmentResult<
  PeriodFactsType,
  PeriodSegmentFactsType,
  PlayerRoleType
> = {
  playerRole: PlayerRoleType
  periodFacts: PeriodFactsType
  segmentFacts: PeriodSegmentFactsType
  nextSegmentFacts?: PeriodSegmentFactsType
  segmentIx: number
}

// TODO(JJ):
// - Replace StateType with unknown -> second step in a different branch

interface Period<
  FactsType,
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
      PeriodFactsType,
      PeriodSegmentFactsType
    >
  ) => OutputFacts<FactsType, NotificationType, EventType>
  consolidate: (
    facts: FactsType,
    payload: PayloadPeriodConsolidation<PeriodSegmentFactsType>
  ) => OutputFacts<FactsType, NotificationType, EventType>
}

interface PeriodResult<
  FactsType,
  PeriodFactsType,
  PeriodSegmentFactsType,
  PlayerRoleType,
  NotificationType,
  EventType,
  PrismaType
> {
  initialize: (
    facts: FactsType,
    payload: PayloadPeriodResult<PeriodFactsType, PlayerRoleType>
  ) => OutputFacts<FactsType, NotificationType, EventType>
  start: (
    facts: FactsType,
    payload: PayloadPeriodResult<PeriodFactsType, PlayerRoleType>
  ) => OutputFacts<FactsType, NotificationType, EventType>
  end: (
    facts: FactsType,
    payload: PayloadPeriodResultEnd<
      PeriodFactsType,
      PeriodSegmentFactsType,
      PlayerRoleType
    >
  ) => OutputFacts<FactsType, NotificationType, EventType>
}

interface Segment<
  FactsType,
  PeriodFactsType,
  PeriodSegmentFactsType,
  NotificationType,
  EventType,
  PrismaType
> {
  initialize: (
    facts: FactsType,
    payload: PayloadSegment<PeriodFactsType, PeriodSegmentFactsType>
  ) => OutputFacts<FactsType, NotificationType, EventType>
}

interface SegmentResult<
  FactsType,
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
      PeriodFactsType,
      PeriodSegmentFactsType,
      PlayerRoleType
    >
  ) => OutputFacts<FactsType, NotificationType, EventType>
  start: (
    facts: FactsType,
    payload: PayloadSegmentResult<
      PeriodFactsType,
      PeriodSegmentFactsType,
      PlayerRoleType
    >
  ) => OutputFacts<FactsType, NotificationType, EventType>
  end: (
    facts: FactsType,
    payload: PayloadSegmentResult<
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
  EventType,
  PrismaType
> {
  apply: (
    state: StateType,
    action: Action<ActionType, PayloadType, PrismaType>
  ) => OutputFactsUser<StateType, NotificationType, EventType>
  ActionTypes: Record<string, string>
}

interface Reducers<PrismaType> {
  Actions: Reducer<any, any, any, any, any, PrismaType>
  Period: Period<any, any, any, any, any, PrismaType>
  PeriodResult: PeriodResult<any, any, any, any, any, any, PrismaType>
  Segment: Segment<any, any, any, any, any, PrismaType>
  SegmentResult: SegmentResult<any, any, any, any, any, any, PrismaType>
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
  reducers: Reducers<PrismaType>
}

export interface CtxWithFactsAndSchema<FactsType, PrismaType> {
  schema: yup.Schema<FactsType>
  reducers: Reducers<PrismaType>
}

export enum BaseGlobalNotificationType {
  PERIOD_ACTIVATED = 'PERIOD_ACTIVATED',
  SEGMENT_ACTIVATED = 'SEGMENT_ACTIVATED',
}

export enum BaseUserNotificationType {
  LEARNING_ELEMENT_SOLVED = 'LEARNING_ELEMENT_SOLVED',
  LEARNING_ELEMENT_INCORRECT = 'LEARNING_ELEMENT_INCORRECT',
  ACHIEVEMENT_RECEIVED = 'ACHIEVEMENT_RECEIVED',
  LEVEL_UP = 'LEVEL_UP',
}
