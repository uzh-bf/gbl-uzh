import { NextPageContext } from 'next'
import type yup from 'yup'

// TODO(JJ): We only need to keep track of the ActionReducer action types
// - Discuss with RS if we should put everything into one enum or separate them
// - Rename enum ActionTypes

export enum ActionTypes {
  PERIOD_INITIALIZE = 'PERIOD_INITIALIZE',
  PERIOD_CONSOLIDATE = 'PERIOD_CONSOLIDATE',
  PERIOD_RESULTS_INITIALIZE = 'PERIOD_RESULTS_INITIALIZE',
  PERIOD_RESULTS_START = 'PERIOD_RESULTS_START',
  PERIOD_RESULTS_END = 'PERIOD_RESULTS_END',
  SEGMENT_INITIALIZE = 'SEGMENT_INITIALIZE',
  SEGMENT_RESULTS_INITIALIZE = 'SEGMENT_RESULTS_INITIALIZE',
  SEGMENT_RESULTS_START = 'SEGMENT_RESULTS_START',
  SEGMENT_RESULTS_END = 'SEGMENT_RESULTS_END',
}

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

export type ResultState<ActionTypes, StateType> = {
  type: ActionTypes
  result: StateType
  isDirty: boolean
  events?: any[]
  notifications?: any[]
}

export type Output<OutputType, NotificationType, EventType> = {
  type: OutputType
  extras?: any
  result: any
  notifications?: Notification<NotificationType>[]
  events?: Event<EventType>[]
  actions?: any[]
  isDirty: boolean
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
  // TODO(JJ): Double-check if segmentFacts and nextSegmentFacts have same type
  nextSegmentFacts?: PeriodSegmentFactsType
  segmentIx: number
}

interface Period<
  StateType,
  PeriodFactsType,
  PeriodSegmentFactsType,
  NotificationType,
  EventType,
  // TODO(JJ): Decide what to do with prisma -> goes into payload?
  PrismaType
> {
  initialize: (
    state: StateType,
    payload: PayloadPeriodInitialisation<
      PeriodFactsType,
      PeriodSegmentFactsType
    >
  ) => Output<ActionTypes.PERIOD_INITIALIZE, NotificationType, EventType>
  consolidate: (
    state: StateType,
    payload: PayloadPeriodConsolidation<PeriodSegmentFactsType>
  ) => Output<ActionTypes.PERIOD_CONSOLIDATE, NotificationType, EventType>
}

interface PeriodResult<
  StateType,
  PeriodFactsType,
  PeriodSegmentFactsType,
  PlayerRoleType,
  NotificationType,
  EventType,
  PrismaType
> {
  initialize: (
    state: StateType,
    payload: PayloadPeriodResult<PeriodFactsType, PlayerRoleType>
  ) => Output<
    ActionTypes.PERIOD_RESULTS_INITIALIZE,
    NotificationType,
    EventType
  >
  start: (
    state: StateType,
    payload: PayloadPeriodResult<PeriodFactsType, PlayerRoleType>
  ) => Output<ActionTypes.PERIOD_RESULTS_START, NotificationType, EventType>
  end: (
    state: StateType,
    payload: PayloadPeriodResultEnd<
      PeriodFactsType,
      PeriodSegmentFactsType,
      PlayerRoleType
    >
  ) => Output<ActionTypes.PERIOD_RESULTS_END, NotificationType, EventType>
}

interface Segment<
  StateType,
  PeriodFactsType,
  PeriodSegmentFactsType,
  NotificationType,
  EventType,
  PrismaType
> {
  initialize: (
    state: StateType,
    payload: PayloadSegment<PeriodFactsType, PeriodSegmentFactsType>
  ) => Output<ActionTypes.SEGMENT_INITIALIZE, NotificationType, EventType>
}

interface SegmentResult<
  StateType,
  PeriodFactsType,
  PeriodSegmentFactsType,
  PlayerRoleType,
  NotificationType,
  EventType,
  PrismaType
> {
  initialize: (
    state: StateType,
    payload: PayloadSegmentResult<
      PeriodFactsType,
      PeriodSegmentFactsType,
      PlayerRoleType
    >
  ) => Output<
    ActionTypes.SEGMENT_RESULTS_INITIALIZE,
    NotificationType,
    EventType
  >
  start: (
    state: StateType,
    payload: PayloadSegmentResult<
      PeriodFactsType,
      PeriodSegmentFactsType,
      PlayerRoleType
    >
  ) => Output<ActionTypes.SEGMENT_RESULTS_START, NotificationType, EventType>
  end: (
    state: StateType,
    payload: PayloadSegmentResult<
      PeriodFactsType,
      PeriodSegmentFactsType,
      PlayerRoleType
    >
  ) => Output<ActionTypes.SEGMENT_RESULTS_END, NotificationType, EventType>
}

interface Reducer<
  StateType,
  ActionType,
  PayloadType,
  OutputType,
  NotificationType,
  EventType,
  PrismaType
> {
  apply: (
    state: StateType,
    action: Action<ActionType, PayloadType, PrismaType>
  ) => Output<OutputType, NotificationType, EventType>
  ActionTypes: Record<string, string>
}

interface Reducers<PrismaType> {
  Actions: Reducer<any, any, any, any, any, any, PrismaType>
  Period: Period<any, any, any, any, any, PrismaType>
  PeriodResult: PeriodResult<any, any, any, any, any, any, PrismaType>
  Segment: Segment<any, any, any, any, any, PrismaType>
  SegmentResult: SegmentResult<any, any, any, any, any, any, PrismaType>
  // TODO(JJ): Check with RS if safe to remove
  // [key: string]: Reducer<any, any, any, any, any, any, PrismaType>
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
