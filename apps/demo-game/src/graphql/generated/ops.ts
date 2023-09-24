import {
  GraphQLResolveInfo,
  GraphQLScalarType,
  GraphQLScalarTypeConfig,
} from 'graphql'
export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K]
}
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>
}
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>
}
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T
> = { [_ in K]?: never }
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never
    }
export type RequireFields<T, K extends keyof T> = Omit<T, K> & {
  [P in K]-?: NonNullable<T[P]>
}
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string }
  String: { input: string; output: string }
  Boolean: { input: boolean; output: boolean }
  Int: { input: number; output: number }
  Float: { input: number; output: number }
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: { input: any; output: any }
  /** The `JSONObject` scalar type represents JSON objects as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSONObject: { input: any; output: any }
}

export type Achievement = {
  __typename?: 'Achievement'
  description: Scalars['String']['output']
  id: Scalars['ID']['output']
  image?: Maybe<Scalars['String']['output']>
  name: Scalars['String']['output']
  reward?: Maybe<Scalars['JSONObject']['output']>
  when: AchievementFrequency
}

export enum AchievementFrequency {
  Each = 'EACH',
  First = 'FIRST',
}

export type AchievementInstance = {
  __typename?: 'AchievementInstance'
  achievement: Achievement
  count: Scalars['Int']['output']
  id: Scalars['Int']['output']
}

export type Event = {
  __typename?: 'Event'
  type?: Maybe<Scalars['String']['output']>
}

export type Game = {
  __typename?: 'Game'
  activePeriod?: Maybe<Period>
  activePeriodIx?: Maybe<Scalars['Int']['output']>
  id: Scalars['ID']['output']
  name: Scalars['String']['output']
  periods: Array<Period>
  players: Array<Player>
  status: GameStatus
}

export enum GameStatus {
  Completed = 'COMPLETED',
  Consolidation = 'CONSOLIDATION',
  Paused = 'PAUSED',
  Preparation = 'PREPARATION',
  Results = 'RESULTS',
  Running = 'RUNNING',
  Scheduled = 'SCHEDULED',
}

export type LearningAnswerOption = {
  __typename?: 'LearningAnswerOption'
  content: Scalars['String']['output']
  correct: Scalars['Boolean']['output']
  id: Scalars['ID']['output']
}

export type LearningElement = {
  __typename?: 'LearningElement'
  feedback?: Maybe<Scalars['String']['output']>
  id: Scalars['ID']['output']
  motivation?: Maybe<Scalars['String']['output']>
  options: Array<LearningAnswerOption>
  question: Scalars['String']['output']
  reward?: Maybe<Scalars['JSONObject']['output']>
  title: Scalars['String']['output']
}

export type LearningElementAttempt = {
  __typename?: 'LearningElementAttempt'
  element?: Maybe<LearningElement>
  id?: Maybe<Scalars['ID']['output']>
  player?: Maybe<Player>
  pointsAchieved?: Maybe<Scalars['Int']['output']>
  pointsMax?: Maybe<Scalars['Int']['output']>
}

export type LearningElementState = {
  __typename?: 'LearningElementState'
  element?: Maybe<LearningElement>
  id?: Maybe<Scalars['ID']['output']>
  solution?: Maybe<Scalars['String']['output']>
  state?: Maybe<Scalars['String']['output']>
}

export type Mutation = {
  __typename?: 'Mutation'
  activateNextPeriod?: Maybe<Game>
  activateNextSegment?: Maybe<Game>
  addCountdown?: Maybe<Scalars['Boolean']['output']>
  addGamePeriod?: Maybe<Period>
  addPeriodSegment?: Maybe<PeriodSegment>
  attemptLearningElement?: Maybe<LearningElementAttempt>
  createGame?: Maybe<Game>
  loginAsTeam?: Maybe<Player>
  logoutAsTeam?: Maybe<Scalars['Boolean']['output']>
  markStoryElement?: Maybe<Player>
  performAction?: Maybe<PlayerResult>
  saveConsolidationDecision?: Maybe<PlayerDecision>
  updatePlayerData?: Maybe<Player>
  updateReadyState?: Maybe<Player>
}

export type MutationActivateNextPeriodArgs = {
  gameId: Scalars['Int']['input']
}

export type MutationActivateNextSegmentArgs = {
  gameId: Scalars['Int']['input']
}

export type MutationAddCountdownArgs = {
  gameId: Scalars['Int']['input']
  seconds: Scalars['Int']['input']
}

export type MutationAddGamePeriodArgs = {
  facts: PeriodFactsInput
  gameId: Scalars['Int']['input']
}

export type MutationAddPeriodSegmentArgs = {
  facts: PeriodSegmentFactsInput
  gameId: Scalars['Int']['input']
  learningElements?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  periodIx: Scalars['Int']['input']
  storyElements?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type MutationAttemptLearningElementArgs = {
  elementId: Scalars['ID']['input']
  selection: Scalars['String']['input']
}

export type MutationCreateGameArgs = {
  name: Scalars['String']['input']
  playerCount: Scalars['Int']['input']
}

export type MutationLoginAsTeamArgs = {
  token: Scalars['String']['input']
}

export type MutationMarkStoryElementArgs = {
  elementId: Scalars['ID']['input']
}

export type MutationPerformActionArgs = {
  payload: Scalars['String']['input']
  type: Scalars['String']['input']
}

export type MutationSaveConsolidationDecisionArgs = {
  payload: Scalars['String']['input']
}

export type MutationUpdatePlayerDataArgs = {
  avatar?: InputMaybe<Scalars['String']['input']>
  color?: InputMaybe<Scalars['String']['input']>
  facts?: InputMaybe<Scalars['String']['input']>
  name?: InputMaybe<Scalars['String']['input']>
}

export type MutationUpdateReadyStateArgs = {
  isReady: Scalars['Boolean']['input']
}

export type Period = {
  __typename?: 'Period'
  actions: Array<PlayerAction>
  activeSegment?: Maybe<PeriodSegment>
  activeSegmentIx?: Maybe<Scalars['Int']['output']>
  facts: Scalars['JSONObject']['output']
  id: Scalars['ID']['output']
  index: Scalars['Int']['output']
  results: Array<PlayerResult>
  segments: Array<PeriodSegment>
}

export type PeriodFactsInput = {
  rollsPerSegment?: InputMaybe<Scalars['Int']['input']>
  scenario?: InputMaybe<PeriodFactsScenarioInput>
}

export type PeriodFactsScenarioInput = {
  bankReturn?: InputMaybe<Scalars['Float']['input']>
  gapBonds?: InputMaybe<Scalars['Float']['input']>
  gapStocks?: InputMaybe<Scalars['Float']['input']>
  seed?: InputMaybe<Scalars['Int']['input']>
  trendBonds?: InputMaybe<Scalars['Float']['input']>
  trendStocks?: InputMaybe<Scalars['Float']['input']>
}

export type PeriodSegment = {
  __typename?: 'PeriodSegment'
  actions: Array<PlayerAction>
  countdownExpiresAt?: Maybe<Scalars['DateTime']['output']>
  facts: Scalars['JSONObject']['output']
  id: Scalars['ID']['output']
  index: Scalars['Int']['output']
  learningElements: Array<LearningElement>
  periodIx: Scalars['Int']['output']
  results: Array<PlayerResult>
  storyElements: Array<StoryElement>
}

export type PeriodSegmentFactsInput = {
  bankPercentage?: InputMaybe<Scalars['Float']['input']>
  bondsPercentage?: InputMaybe<Scalars['Float']['input']>
  stockPercentage?: InputMaybe<Scalars['Float']['input']>
}

export type Player = {
  __typename?: 'Player'
  achievementIds: Array<Scalars['String']['output']>
  achievementKeys: Array<Scalars['String']['output']>
  achievements: Array<AchievementInstance>
  avatar: Scalars['String']['output']
  color: Scalars['String']['output']
  completedLearningElementIds: Array<Scalars['String']['output']>
  completedLearningElements: Array<LearningElement>
  experience: Scalars['Int']['output']
  experienceToNext: Scalars['Int']['output']
  facts: Scalars['JSONObject']['output']
  id: Scalars['ID']['output']
  isReady: Scalars['Boolean']['output']
  level: PlayerLevel
  levelIx: Scalars['Int']['output']
  location: Scalars['String']['output']
  name: Scalars['String']['output']
  number: Scalars['Int']['output']
  role?: Maybe<Scalars['String']['output']>
  token: Scalars['String']['output']
  tutorialCompleted: Scalars['Boolean']['output']
  visitedStoryElementIds: Array<Scalars['String']['output']>
  visitedStoryElements: Array<StoryElement>
}

export type PlayerAction = {
  __typename?: 'PlayerAction'
  facts?: Maybe<Scalars['JSONObject']['output']>
  id: Scalars['ID']['output']
  period: Period
  periodIx: Scalars['Int']['output']
  player: Player
  segment?: Maybe<PeriodSegment>
  segmentIx?: Maybe<Scalars['Int']['output']>
  type: Scalars['String']['output']
}

export type PlayerDecision = {
  __typename?: 'PlayerDecision'
  facts: Scalars['JSONObject']['output']
  id: Scalars['ID']['output']
  period: Period
  periodIx: Scalars['Int']['output']
  player: Player
  type: PlayerDecisionType
}

export enum PlayerDecisionType {
  Consolidation = 'CONSOLIDATION',
  Preparation = 'PREPARATION',
}

export type PlayerLevel = {
  __typename?: 'PlayerLevel'
  description: Scalars['String']['output']
  id: Scalars['ID']['output']
  index: Scalars['Int']['output']
  requiredXP: Scalars['Int']['output']
}

export type PlayerResult = {
  __typename?: 'PlayerResult'
  facts?: Maybe<Scalars['JSONObject']['output']>
  id: Scalars['ID']['output']
  period: Period
  player: Player
  segment?: Maybe<PeriodSegment>
  type?: Maybe<PlayerResultType>
}

export enum PlayerResultType {
  PeriodEnd = 'PERIOD_END',
  PeriodStart = 'PERIOD_START',
  SegmentEnd = 'SEGMENT_END',
  SegmentStart = 'SEGMENT_START',
}

export type PlayerState = {
  __typename?: 'PlayerState'
  currentGame?: Maybe<Game>
  playerResult?: Maybe<PlayerResult>
  previousResults?: Maybe<Array<PlayerResult>>
  transactions?: Maybe<Array<PlayerAction>>
}

export type Query = {
  __typename?: 'Query'
  game?: Maybe<Game>
  games?: Maybe<Array<Game>>
  learningElement?: Maybe<LearningElementState>
  learningElements?: Maybe<Array<LearningElement>>
  pastResults?: Maybe<Array<PlayerResult>>
  result?: Maybe<PlayerState>
  results?: Maybe<Array<PlayerResult>>
  self?: Maybe<Player>
}

export type QueryGameArgs = {
  id?: InputMaybe<Scalars['Int']['input']>
}

export type QueryLearningElementArgs = {
  id: Scalars['ID']['input']
}

export type StoryElement = {
  __typename?: 'StoryElement'
  content?: Maybe<Scalars['String']['output']>
  contentRole?: Maybe<Scalars['JSONObject']['output']>
  id: Scalars['ID']['output']
  reward?: Maybe<Scalars['JSONObject']['output']>
  title: Scalars['String']['output']
  type: StoryElementType
}

export enum StoryElementType {
  Generic = 'GENERIC',
  RoleBased = 'ROLE_BASED',
}

export type Subscription = {
  __typename?: 'Subscription'
  eventsGlobal?: Maybe<Array<Event>>
  eventsUser?: Maybe<Array<Event>>
}

export enum UserRole {
  Admin = 'ADMIN',
  Master = 'MASTER',
}

export type ResolverTypeWrapper<T> = Promise<T> | T

export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>
}
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | ResolverWithResolve<TResult, TParent, TContext, TArgs>

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>

export interface SubscriptionSubscriberObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs
> {
  subscribe: SubscriptionSubscribeFn<
    { [key in TKey]: TResult },
    TParent,
    TContext,
    TArgs
  >
  resolve?: SubscriptionResolveFn<
    TResult,
    { [key in TKey]: TResult },
    TContext,
    TArgs
  >
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>
}

export type SubscriptionObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs
> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>

export type SubscriptionResolver<
  TResult,
  TKey extends string,
  TParent = {},
  TContext = {},
  TArgs = {}
> =
  | ((
      ...args: any[]
    ) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (
  obj: T,
  context: TContext,
  info: GraphQLResolveInfo
) => boolean | Promise<boolean>

export type NextResolverFn<T> = () => Promise<T>

export type DirectiveResolverFn<
  TResult = {},
  TParent = {},
  TContext = {},
  TArgs = {}
> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Achievement: ResolverTypeWrapper<Achievement>
  AchievementFrequency: AchievementFrequency
  AchievementInstance: ResolverTypeWrapper<AchievementInstance>
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>
  Event: ResolverTypeWrapper<Event>
  Float: ResolverTypeWrapper<Scalars['Float']['output']>
  Game: ResolverTypeWrapper<Game>
  GameStatus: GameStatus
  ID: ResolverTypeWrapper<Scalars['ID']['output']>
  Int: ResolverTypeWrapper<Scalars['Int']['output']>
  JSONObject: ResolverTypeWrapper<Scalars['JSONObject']['output']>
  LearningAnswerOption: ResolverTypeWrapper<LearningAnswerOption>
  LearningElement: ResolverTypeWrapper<LearningElement>
  LearningElementAttempt: ResolverTypeWrapper<LearningElementAttempt>
  LearningElementState: ResolverTypeWrapper<LearningElementState>
  Mutation: ResolverTypeWrapper<{}>
  Period: ResolverTypeWrapper<Period>
  PeriodFactsInput: PeriodFactsInput
  PeriodFactsScenarioInput: PeriodFactsScenarioInput
  PeriodSegment: ResolverTypeWrapper<PeriodSegment>
  PeriodSegmentFactsInput: PeriodSegmentFactsInput
  Player: ResolverTypeWrapper<Player>
  PlayerAction: ResolverTypeWrapper<PlayerAction>
  PlayerDecision: ResolverTypeWrapper<PlayerDecision>
  PlayerDecisionType: PlayerDecisionType
  PlayerLevel: ResolverTypeWrapper<PlayerLevel>
  PlayerResult: ResolverTypeWrapper<PlayerResult>
  PlayerResultType: PlayerResultType
  PlayerState: ResolverTypeWrapper<PlayerState>
  Query: ResolverTypeWrapper<{}>
  StoryElement: ResolverTypeWrapper<StoryElement>
  StoryElementType: StoryElementType
  String: ResolverTypeWrapper<Scalars['String']['output']>
  Subscription: ResolverTypeWrapper<{}>
  UserRole: UserRole
}

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Achievement: Achievement
  AchievementInstance: AchievementInstance
  Boolean: Scalars['Boolean']['output']
  DateTime: Scalars['DateTime']['output']
  Event: Event
  Float: Scalars['Float']['output']
  Game: Game
  ID: Scalars['ID']['output']
  Int: Scalars['Int']['output']
  JSONObject: Scalars['JSONObject']['output']
  LearningAnswerOption: LearningAnswerOption
  LearningElement: LearningElement
  LearningElementAttempt: LearningElementAttempt
  LearningElementState: LearningElementState
  Mutation: {}
  Period: Period
  PeriodFactsInput: PeriodFactsInput
  PeriodFactsScenarioInput: PeriodFactsScenarioInput
  PeriodSegment: PeriodSegment
  PeriodSegmentFactsInput: PeriodSegmentFactsInput
  Player: Player
  PlayerAction: PlayerAction
  PlayerDecision: PlayerDecision
  PlayerLevel: PlayerLevel
  PlayerResult: PlayerResult
  PlayerState: PlayerState
  Query: {}
  StoryElement: StoryElement
  String: Scalars['String']['output']
  Subscription: {}
}

export type AchievementResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Achievement'] = ResolversParentTypes['Achievement']
> = {
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  image?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  reward?: Resolver<
    Maybe<ResolversTypes['JSONObject']>,
    ParentType,
    ContextType
  >
  when?: Resolver<
    ResolversTypes['AchievementFrequency'],
    ParentType,
    ContextType
  >
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type AchievementInstanceResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['AchievementInstance'] = ResolversParentTypes['AchievementInstance']
> = {
  achievement?: Resolver<ResolversTypes['Achievement'], ParentType, ContextType>
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export interface DateTimeScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime'
}

export type EventResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Event'] = ResolversParentTypes['Event']
> = {
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type GameResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Game'] = ResolversParentTypes['Game']
> = {
  activePeriod?: Resolver<
    Maybe<ResolversTypes['Period']>,
    ParentType,
    ContextType
  >
  activePeriodIx?: Resolver<
    Maybe<ResolversTypes['Int']>,
    ParentType,
    ContextType
  >
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  periods?: Resolver<Array<ResolversTypes['Period']>, ParentType, ContextType>
  players?: Resolver<Array<ResolversTypes['Player']>, ParentType, ContextType>
  status?: Resolver<ResolversTypes['GameStatus'], ParentType, ContextType>
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export interface JsonObjectScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes['JSONObject'], any> {
  name: 'JSONObject'
}

export type LearningAnswerOptionResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['LearningAnswerOption'] = ResolversParentTypes['LearningAnswerOption']
> = {
  content?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  correct?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type LearningElementResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['LearningElement'] = ResolversParentTypes['LearningElement']
> = {
  feedback?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  motivation?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >
  options?: Resolver<
    Array<ResolversTypes['LearningAnswerOption']>,
    ParentType,
    ContextType
  >
  question?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  reward?: Resolver<
    Maybe<ResolversTypes['JSONObject']>,
    ParentType,
    ContextType
  >
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type LearningElementAttemptResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['LearningElementAttempt'] = ResolversParentTypes['LearningElementAttempt']
> = {
  element?: Resolver<
    Maybe<ResolversTypes['LearningElement']>,
    ParentType,
    ContextType
  >
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>
  player?: Resolver<Maybe<ResolversTypes['Player']>, ParentType, ContextType>
  pointsAchieved?: Resolver<
    Maybe<ResolversTypes['Int']>,
    ParentType,
    ContextType
  >
  pointsMax?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type LearningElementStateResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['LearningElementState'] = ResolversParentTypes['LearningElementState']
> = {
  element?: Resolver<
    Maybe<ResolversTypes['LearningElement']>,
    ParentType,
    ContextType
  >
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>
  solution?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  state?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type MutationResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']
> = {
  activateNextPeriod?: Resolver<
    Maybe<ResolversTypes['Game']>,
    ParentType,
    ContextType,
    RequireFields<MutationActivateNextPeriodArgs, 'gameId'>
  >
  activateNextSegment?: Resolver<
    Maybe<ResolversTypes['Game']>,
    ParentType,
    ContextType,
    RequireFields<MutationActivateNextSegmentArgs, 'gameId'>
  >
  addCountdown?: Resolver<
    Maybe<ResolversTypes['Boolean']>,
    ParentType,
    ContextType,
    RequireFields<MutationAddCountdownArgs, 'gameId' | 'seconds'>
  >
  addGamePeriod?: Resolver<
    Maybe<ResolversTypes['Period']>,
    ParentType,
    ContextType,
    RequireFields<MutationAddGamePeriodArgs, 'facts' | 'gameId'>
  >
  addPeriodSegment?: Resolver<
    Maybe<ResolversTypes['PeriodSegment']>,
    ParentType,
    ContextType,
    RequireFields<MutationAddPeriodSegmentArgs, 'facts' | 'gameId' | 'periodIx'>
  >
  attemptLearningElement?: Resolver<
    Maybe<ResolversTypes['LearningElementAttempt']>,
    ParentType,
    ContextType,
    RequireFields<MutationAttemptLearningElementArgs, 'elementId' | 'selection'>
  >
  createGame?: Resolver<
    Maybe<ResolversTypes['Game']>,
    ParentType,
    ContextType,
    RequireFields<MutationCreateGameArgs, 'name' | 'playerCount'>
  >
  loginAsTeam?: Resolver<
    Maybe<ResolversTypes['Player']>,
    ParentType,
    ContextType,
    RequireFields<MutationLoginAsTeamArgs, 'token'>
  >
  logoutAsTeam?: Resolver<
    Maybe<ResolversTypes['Boolean']>,
    ParentType,
    ContextType
  >
  markStoryElement?: Resolver<
    Maybe<ResolversTypes['Player']>,
    ParentType,
    ContextType,
    RequireFields<MutationMarkStoryElementArgs, 'elementId'>
  >
  performAction?: Resolver<
    Maybe<ResolversTypes['PlayerResult']>,
    ParentType,
    ContextType,
    RequireFields<MutationPerformActionArgs, 'payload' | 'type'>
  >
  saveConsolidationDecision?: Resolver<
    Maybe<ResolversTypes['PlayerDecision']>,
    ParentType,
    ContextType,
    RequireFields<MutationSaveConsolidationDecisionArgs, 'payload'>
  >
  updatePlayerData?: Resolver<
    Maybe<ResolversTypes['Player']>,
    ParentType,
    ContextType,
    Partial<MutationUpdatePlayerDataArgs>
  >
  updateReadyState?: Resolver<
    Maybe<ResolversTypes['Player']>,
    ParentType,
    ContextType,
    RequireFields<MutationUpdateReadyStateArgs, 'isReady'>
  >
}

export type PeriodResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Period'] = ResolversParentTypes['Period']
> = {
  actions?: Resolver<
    Array<ResolversTypes['PlayerAction']>,
    ParentType,
    ContextType
  >
  activeSegment?: Resolver<
    Maybe<ResolversTypes['PeriodSegment']>,
    ParentType,
    ContextType
  >
  activeSegmentIx?: Resolver<
    Maybe<ResolversTypes['Int']>,
    ParentType,
    ContextType
  >
  facts?: Resolver<ResolversTypes['JSONObject'], ParentType, ContextType>
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  index?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  results?: Resolver<
    Array<ResolversTypes['PlayerResult']>,
    ParentType,
    ContextType
  >
  segments?: Resolver<
    Array<ResolversTypes['PeriodSegment']>,
    ParentType,
    ContextType
  >
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type PeriodSegmentResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['PeriodSegment'] = ResolversParentTypes['PeriodSegment']
> = {
  actions?: Resolver<
    Array<ResolversTypes['PlayerAction']>,
    ParentType,
    ContextType
  >
  countdownExpiresAt?: Resolver<
    Maybe<ResolversTypes['DateTime']>,
    ParentType,
    ContextType
  >
  facts?: Resolver<ResolversTypes['JSONObject'], ParentType, ContextType>
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  index?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  learningElements?: Resolver<
    Array<ResolversTypes['LearningElement']>,
    ParentType,
    ContextType
  >
  periodIx?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  results?: Resolver<
    Array<ResolversTypes['PlayerResult']>,
    ParentType,
    ContextType
  >
  storyElements?: Resolver<
    Array<ResolversTypes['StoryElement']>,
    ParentType,
    ContextType
  >
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type PlayerResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Player'] = ResolversParentTypes['Player']
> = {
  achievementIds?: Resolver<
    Array<ResolversTypes['String']>,
    ParentType,
    ContextType
  >
  achievementKeys?: Resolver<
    Array<ResolversTypes['String']>,
    ParentType,
    ContextType
  >
  achievements?: Resolver<
    Array<ResolversTypes['AchievementInstance']>,
    ParentType,
    ContextType
  >
  avatar?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  color?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  completedLearningElementIds?: Resolver<
    Array<ResolversTypes['String']>,
    ParentType,
    ContextType
  >
  completedLearningElements?: Resolver<
    Array<ResolversTypes['LearningElement']>,
    ParentType,
    ContextType
  >
  experience?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  experienceToNext?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  facts?: Resolver<ResolversTypes['JSONObject'], ParentType, ContextType>
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  isReady?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
  level?: Resolver<ResolversTypes['PlayerLevel'], ParentType, ContextType>
  levelIx?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  location?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  number?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  role?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  tutorialCompleted?: Resolver<
    ResolversTypes['Boolean'],
    ParentType,
    ContextType
  >
  visitedStoryElementIds?: Resolver<
    Array<ResolversTypes['String']>,
    ParentType,
    ContextType
  >
  visitedStoryElements?: Resolver<
    Array<ResolversTypes['StoryElement']>,
    ParentType,
    ContextType
  >
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type PlayerActionResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['PlayerAction'] = ResolversParentTypes['PlayerAction']
> = {
  facts?: Resolver<Maybe<ResolversTypes['JSONObject']>, ParentType, ContextType>
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  period?: Resolver<ResolversTypes['Period'], ParentType, ContextType>
  periodIx?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  player?: Resolver<ResolversTypes['Player'], ParentType, ContextType>
  segment?: Resolver<
    Maybe<ResolversTypes['PeriodSegment']>,
    ParentType,
    ContextType
  >
  segmentIx?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type PlayerDecisionResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['PlayerDecision'] = ResolversParentTypes['PlayerDecision']
> = {
  facts?: Resolver<ResolversTypes['JSONObject'], ParentType, ContextType>
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  period?: Resolver<ResolversTypes['Period'], ParentType, ContextType>
  periodIx?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  player?: Resolver<ResolversTypes['Player'], ParentType, ContextType>
  type?: Resolver<ResolversTypes['PlayerDecisionType'], ParentType, ContextType>
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type PlayerLevelResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['PlayerLevel'] = ResolversParentTypes['PlayerLevel']
> = {
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  index?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  requiredXP?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type PlayerResultResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['PlayerResult'] = ResolversParentTypes['PlayerResult']
> = {
  facts?: Resolver<Maybe<ResolversTypes['JSONObject']>, ParentType, ContextType>
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  period?: Resolver<ResolversTypes['Period'], ParentType, ContextType>
  player?: Resolver<ResolversTypes['Player'], ParentType, ContextType>
  segment?: Resolver<
    Maybe<ResolversTypes['PeriodSegment']>,
    ParentType,
    ContextType
  >
  type?: Resolver<
    Maybe<ResolversTypes['PlayerResultType']>,
    ParentType,
    ContextType
  >
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type PlayerStateResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['PlayerState'] = ResolversParentTypes['PlayerState']
> = {
  currentGame?: Resolver<Maybe<ResolversTypes['Game']>, ParentType, ContextType>
  playerResult?: Resolver<
    Maybe<ResolversTypes['PlayerResult']>,
    ParentType,
    ContextType
  >
  previousResults?: Resolver<
    Maybe<Array<ResolversTypes['PlayerResult']>>,
    ParentType,
    ContextType
  >
  transactions?: Resolver<
    Maybe<Array<ResolversTypes['PlayerAction']>>,
    ParentType,
    ContextType
  >
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type QueryResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']
> = {
  game?: Resolver<
    Maybe<ResolversTypes['Game']>,
    ParentType,
    ContextType,
    Partial<QueryGameArgs>
  >
  games?: Resolver<
    Maybe<Array<ResolversTypes['Game']>>,
    ParentType,
    ContextType
  >
  learningElement?: Resolver<
    Maybe<ResolversTypes['LearningElementState']>,
    ParentType,
    ContextType,
    RequireFields<QueryLearningElementArgs, 'id'>
  >
  learningElements?: Resolver<
    Maybe<Array<ResolversTypes['LearningElement']>>,
    ParentType,
    ContextType
  >
  pastResults?: Resolver<
    Maybe<Array<ResolversTypes['PlayerResult']>>,
    ParentType,
    ContextType
  >
  result?: Resolver<
    Maybe<ResolversTypes['PlayerState']>,
    ParentType,
    ContextType
  >
  results?: Resolver<
    Maybe<Array<ResolversTypes['PlayerResult']>>,
    ParentType,
    ContextType
  >
  self?: Resolver<Maybe<ResolversTypes['Player']>, ParentType, ContextType>
}

export type StoryElementResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['StoryElement'] = ResolversParentTypes['StoryElement']
> = {
  content?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  contentRole?: Resolver<
    Maybe<ResolversTypes['JSONObject']>,
    ParentType,
    ContextType
  >
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  reward?: Resolver<
    Maybe<ResolversTypes['JSONObject']>,
    ParentType,
    ContextType
  >
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  type?: Resolver<ResolversTypes['StoryElementType'], ParentType, ContextType>
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type SubscriptionResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']
> = {
  eventsGlobal?: SubscriptionResolver<
    Maybe<Array<ResolversTypes['Event']>>,
    'eventsGlobal',
    ParentType,
    ContextType
  >
  eventsUser?: SubscriptionResolver<
    Maybe<Array<ResolversTypes['Event']>>,
    'eventsUser',
    ParentType,
    ContextType
  >
}

export type Resolvers<ContextType = any> = {
  Achievement?: AchievementResolvers<ContextType>
  AchievementInstance?: AchievementInstanceResolvers<ContextType>
  DateTime?: GraphQLScalarType
  Event?: EventResolvers<ContextType>
  Game?: GameResolvers<ContextType>
  JSONObject?: GraphQLScalarType
  LearningAnswerOption?: LearningAnswerOptionResolvers<ContextType>
  LearningElement?: LearningElementResolvers<ContextType>
  LearningElementAttempt?: LearningElementAttemptResolvers<ContextType>
  LearningElementState?: LearningElementStateResolvers<ContextType>
  Mutation?: MutationResolvers<ContextType>
  Period?: PeriodResolvers<ContextType>
  PeriodSegment?: PeriodSegmentResolvers<ContextType>
  Player?: PlayerResolvers<ContextType>
  PlayerAction?: PlayerActionResolvers<ContextType>
  PlayerDecision?: PlayerDecisionResolvers<ContextType>
  PlayerLevel?: PlayerLevelResolvers<ContextType>
  PlayerResult?: PlayerResultResolvers<ContextType>
  PlayerState?: PlayerStateResolvers<ContextType>
  Query?: QueryResolvers<ContextType>
  StoryElement?: StoryElementResolvers<ContextType>
  Subscription?: SubscriptionResolvers<ContextType>
}

export interface PossibleTypesResultData {
  possibleTypes: {
    [key: string]: string[]
  }
}
const result: PossibleTypesResultData = {
  possibleTypes: {},
}
export default result
