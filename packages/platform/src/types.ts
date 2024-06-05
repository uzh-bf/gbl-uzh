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

export interface Reducers<PrismaType> {
  Actions: Reducer<any, any, any, any, any, any, PrismaType>
  Period: Reducer<any, any, any, any, any, any, PrismaType>
  PeriodResult: Reducer<any, any, any, any, any, any, PrismaType>
  Segment: Reducer<any, any, any, any, any, any, PrismaType>
  SegmentResult: Reducer<any, any, any, any, any, any, PrismaType>
  [key: string]: Reducer<any, any, any, any, any, any, PrismaType>
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
