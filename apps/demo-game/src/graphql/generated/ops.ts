import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: any;
  /** The `JSONObject` scalar type represents JSON objects as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSONObject: any;
};

export type Achievement = {
  __typename?: 'Achievement';
  description: Scalars['String'];
  id: Scalars['ID'];
  image?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  reward?: Maybe<Scalars['JSONObject']>;
  when: AchievementFrequency;
};

export enum AchievementFrequency {
  Each = 'EACH',
  First = 'FIRST'
}

export type AchievementInstance = {
  __typename?: 'AchievementInstance';
  achievement: Achievement;
  count: Scalars['Int'];
  id: Scalars['Int'];
};

export type Event = {
  __typename?: 'Event';
  type?: Maybe<Scalars['String']>;
};

export type Game = {
  __typename?: 'Game';
  activePeriod?: Maybe<Period>;
  activePeriodIx?: Maybe<Scalars['Int']>;
  id: Scalars['ID'];
  name: Scalars['String'];
  periods: Array<Period>;
  players: Array<Player>;
  status: GameStatus;
};

export enum GameStatus {
  Completed = 'COMPLETED',
  Consolidation = 'CONSOLIDATION',
  Paused = 'PAUSED',
  Preparation = 'PREPARATION',
  Results = 'RESULTS',
  Running = 'RUNNING',
  Scheduled = 'SCHEDULED'
}

export type LearningAnswerOption = {
  __typename?: 'LearningAnswerOption';
  content: Scalars['String'];
  correct: Scalars['Boolean'];
  id: Scalars['ID'];
};

export type LearningElement = {
  __typename?: 'LearningElement';
  feedback?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  motivation?: Maybe<Scalars['String']>;
  options: Array<LearningAnswerOption>;
  question: Scalars['String'];
  reward?: Maybe<Scalars['JSONObject']>;
  title: Scalars['String'];
};

export type LearningElementAttempt = {
  __typename?: 'LearningElementAttempt';
  element?: Maybe<LearningElement>;
  id?: Maybe<Scalars['ID']>;
  player?: Maybe<Player>;
  pointsAchieved?: Maybe<Scalars['Int']>;
  pointsMax?: Maybe<Scalars['Int']>;
};

export type LearningElementState = {
  __typename?: 'LearningElementState';
  element?: Maybe<LearningElement>;
  id?: Maybe<Scalars['ID']>;
  solution?: Maybe<Scalars['String']>;
  state?: Maybe<Scalars['String']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  activateNextPeriod?: Maybe<Game>;
  activateNextSegment?: Maybe<Game>;
  addGamePeriod?: Maybe<Period>;
  addPeriodSegment?: Maybe<PeriodSegment>;
  attemptLearningElement?: Maybe<LearningElementAttempt>;
  createGame?: Maybe<Game>;
  loginAsTeam?: Maybe<Player>;
  markStoryElement?: Maybe<Player>;
  performAction?: Maybe<PlayerResult>;
  saveConsolidationDecision?: Maybe<PlayerDecision>;
  updatePlayerData?: Maybe<Player>;
  updateReadyState?: Maybe<Player>;
};


export type MutationActivateNextPeriodArgs = {
  gameId: Scalars['Int'];
};


export type MutationActivateNextSegmentArgs = {
  gameId: Scalars['Int'];
};


export type MutationAddGamePeriodArgs = {
  facts: PeriodFactsInput;
  gameId: Scalars['Int'];
};


export type MutationAddPeriodSegmentArgs = {
  facts: PeriodSegmentFactsInput;
  gameId: Scalars['Int'];
  learningElements?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  periodIx: Scalars['Int'];
  storyElements?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};


export type MutationAttemptLearningElementArgs = {
  elementId: Scalars['ID'];
  selection: Scalars['String'];
};


export type MutationCreateGameArgs = {
  name: Scalars['String'];
  playerCount: Scalars['Int'];
};


export type MutationLoginAsTeamArgs = {
  token: Scalars['String'];
};


export type MutationMarkStoryElementArgs = {
  elementId: Scalars['ID'];
};


export type MutationPerformActionArgs = {
  payload: Scalars['String'];
  type: Scalars['String'];
};


export type MutationSaveConsolidationDecisionArgs = {
  payload: Scalars['String'];
};


export type MutationUpdatePlayerDataArgs = {
  avatar?: InputMaybe<Scalars['String']>;
  color?: InputMaybe<Scalars['String']>;
  facts?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
};


export type MutationUpdateReadyStateArgs = {
  isReady: Scalars['Boolean'];
};

export type Period = {
  __typename?: 'Period';
  actions: Array<PlayerAction>;
  activeSegment?: Maybe<PeriodSegment>;
  activeSegmentIx?: Maybe<Scalars['Int']>;
  facts: Scalars['JSONObject'];
  id: Scalars['ID'];
  index: Scalars['Int'];
  results: Array<PlayerResult>;
  segments: Array<PeriodSegment>;
};

export type PeriodFactsInput = {
  name?: InputMaybe<Scalars['String']>;
  name2?: InputMaybe<Scalars['String']>;
};

export type PeriodSegment = {
  __typename?: 'PeriodSegment';
  actions: Array<PlayerAction>;
  facts: Scalars['JSONObject'];
  id: Scalars['ID'];
  index: Scalars['Int'];
  learningElements: Array<LearningElement>;
  periodIx: Scalars['Int'];
  results: Array<PlayerResult>;
  storyElements: Array<StoryElement>;
};

export type PeriodSegmentFactsInput = {
  bankPercentage?: InputMaybe<Scalars['Float']>;
  bondsPercentage?: InputMaybe<Scalars['Float']>;
  stockPercentage?: InputMaybe<Scalars['Float']>;
};

export type Player = {
  __typename?: 'Player';
  achievementIds: Array<Scalars['String']>;
  achievementKeys: Array<Scalars['String']>;
  achievements: Array<AchievementInstance>;
  avatar: Scalars['String'];
  color: Scalars['String'];
  completedLearningElementIds: Array<Scalars['Int']>;
  completedLearningElements: Array<LearningElement>;
  experience: Scalars['Int'];
  experienceToNext: Scalars['Int'];
  facts: Scalars['JSONObject'];
  id: Scalars['ID'];
  isReady: Scalars['Boolean'];
  level: PlayerLevel;
  levelIx: Scalars['Int'];
  location: Scalars['String'];
  name: Scalars['String'];
  role?: Maybe<Scalars['String']>;
  token: Scalars['String'];
  tutorialCompleted: Scalars['Boolean'];
  visitedStoryElementIds: Array<Scalars['Int']>;
  visitedStoryElements: Array<StoryElement>;
};

export type PlayerAction = {
  __typename?: 'PlayerAction';
  facts?: Maybe<Scalars['JSONObject']>;
  id: Scalars['ID'];
  period: Period;
  periodIx: Scalars['Int'];
  player: Player;
  segment?: Maybe<PeriodSegment>;
  segmentIx?: Maybe<Scalars['Int']>;
  type: Scalars['String'];
};

export type PlayerDecision = {
  __typename?: 'PlayerDecision';
  facts: Scalars['JSONObject'];
  id: Scalars['ID'];
  period: Period;
  periodIx: Scalars['Int'];
  player: Player;
  type: PlayerDecisionType;
};

export enum PlayerDecisionType {
  Consolidation = 'CONSOLIDATION',
  Preparation = 'PREPARATION'
}

export type PlayerLevel = {
  __typename?: 'PlayerLevel';
  description: Scalars['String'];
  id: Scalars['ID'];
  index: Scalars['Int'];
  requiredXP: Scalars['Int'];
};

export type PlayerResult = {
  __typename?: 'PlayerResult';
  facts?: Maybe<Scalars['JSONObject']>;
  id: Scalars['ID'];
  period: Period;
  player: Player;
  segment?: Maybe<PeriodSegment>;
  type?: Maybe<PlayerResultType>;
};

export enum PlayerResultType {
  PeriodEnd = 'PERIOD_END',
  PeriodStart = 'PERIOD_START',
  SegmentEnd = 'SEGMENT_END',
  SegmentStart = 'SEGMENT_START'
}

export type PlayerState = {
  __typename?: 'PlayerState';
  currentGame?: Maybe<Game>;
  playerResult?: Maybe<PlayerResult>;
  previousResults?: Maybe<Array<PlayerResult>>;
  transactions?: Maybe<Array<PlayerAction>>;
};

export type Query = {
  __typename?: 'Query';
  game?: Maybe<Game>;
  games?: Maybe<Array<Game>>;
  learningElement?: Maybe<LearningElementState>;
  learningElements?: Maybe<Array<LearningElement>>;
  pastResults?: Maybe<Array<PlayerResult>>;
  result?: Maybe<PlayerState>;
  results?: Maybe<Array<PlayerResult>>;
  self: Player;
};


export type QueryGameArgs = {
  id?: InputMaybe<Scalars['Int']>;
};


export type QueryLearningElementArgs = {
  id: Scalars['ID'];
};

export type StoryElement = {
  __typename?: 'StoryElement';
  content?: Maybe<Scalars['String']>;
  contentRole?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  reward?: Maybe<Scalars['JSONObject']>;
  title: Scalars['String'];
  type: StoryElementType;
};

export enum StoryElementType {
  Generic = 'GENERIC',
  RoleBased = 'ROLE_BASED'
}

export type Subscription = {
  __typename?: 'Subscription';
  eventsGlobal?: Maybe<Array<Event>>;
  eventsUser?: Maybe<Array<Event>>;
};

export enum UserRole {
  Admin = 'ADMIN',
  Master = 'MASTER'
}



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Achievement: ResolverTypeWrapper<Achievement>;
  AchievementFrequency: AchievementFrequency;
  AchievementInstance: ResolverTypeWrapper<AchievementInstance>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']>;
  Event: ResolverTypeWrapper<Event>;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  Game: ResolverTypeWrapper<Game>;
  GameStatus: GameStatus;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  JSONObject: ResolverTypeWrapper<Scalars['JSONObject']>;
  LearningAnswerOption: ResolverTypeWrapper<LearningAnswerOption>;
  LearningElement: ResolverTypeWrapper<LearningElement>;
  LearningElementAttempt: ResolverTypeWrapper<LearningElementAttempt>;
  LearningElementState: ResolverTypeWrapper<LearningElementState>;
  Mutation: ResolverTypeWrapper<{}>;
  Period: ResolverTypeWrapper<Period>;
  PeriodFactsInput: PeriodFactsInput;
  PeriodSegment: ResolverTypeWrapper<PeriodSegment>;
  PeriodSegmentFactsInput: PeriodSegmentFactsInput;
  Player: ResolverTypeWrapper<Player>;
  PlayerAction: ResolverTypeWrapper<PlayerAction>;
  PlayerDecision: ResolverTypeWrapper<PlayerDecision>;
  PlayerDecisionType: PlayerDecisionType;
  PlayerLevel: ResolverTypeWrapper<PlayerLevel>;
  PlayerResult: ResolverTypeWrapper<PlayerResult>;
  PlayerResultType: PlayerResultType;
  PlayerState: ResolverTypeWrapper<PlayerState>;
  Query: ResolverTypeWrapper<{}>;
  StoryElement: ResolverTypeWrapper<StoryElement>;
  StoryElementType: StoryElementType;
  String: ResolverTypeWrapper<Scalars['String']>;
  Subscription: ResolverTypeWrapper<{}>;
  UserRole: UserRole;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Achievement: Achievement;
  AchievementInstance: AchievementInstance;
  Boolean: Scalars['Boolean'];
  DateTime: Scalars['DateTime'];
  Event: Event;
  Float: Scalars['Float'];
  Game: Game;
  ID: Scalars['ID'];
  Int: Scalars['Int'];
  JSONObject: Scalars['JSONObject'];
  LearningAnswerOption: LearningAnswerOption;
  LearningElement: LearningElement;
  LearningElementAttempt: LearningElementAttempt;
  LearningElementState: LearningElementState;
  Mutation: {};
  Period: Period;
  PeriodFactsInput: PeriodFactsInput;
  PeriodSegment: PeriodSegment;
  PeriodSegmentFactsInput: PeriodSegmentFactsInput;
  Player: Player;
  PlayerAction: PlayerAction;
  PlayerDecision: PlayerDecision;
  PlayerLevel: PlayerLevel;
  PlayerResult: PlayerResult;
  PlayerState: PlayerState;
  Query: {};
  StoryElement: StoryElement;
  String: Scalars['String'];
  Subscription: {};
};

export type AchievementResolvers<ContextType = any, ParentType extends ResolversParentTypes['Achievement'] = ResolversParentTypes['Achievement']> = {
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  image?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  reward?: Resolver<Maybe<ResolversTypes['JSONObject']>, ParentType, ContextType>;
  when?: Resolver<ResolversTypes['AchievementFrequency'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AchievementInstanceResolvers<ContextType = any, ParentType extends ResolversParentTypes['AchievementInstance'] = ResolversParentTypes['AchievementInstance']> = {
  achievement?: Resolver<ResolversTypes['Achievement'], ParentType, ContextType>;
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type EventResolvers<ContextType = any, ParentType extends ResolversParentTypes['Event'] = ResolversParentTypes['Event']> = {
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GameResolvers<ContextType = any, ParentType extends ResolversParentTypes['Game'] = ResolversParentTypes['Game']> = {
  activePeriod?: Resolver<Maybe<ResolversTypes['Period']>, ParentType, ContextType>;
  activePeriodIx?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  periods?: Resolver<Array<ResolversTypes['Period']>, ParentType, ContextType>;
  players?: Resolver<Array<ResolversTypes['Player']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['GameStatus'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface JsonObjectScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSONObject'], any> {
  name: 'JSONObject';
}

export type LearningAnswerOptionResolvers<ContextType = any, ParentType extends ResolversParentTypes['LearningAnswerOption'] = ResolversParentTypes['LearningAnswerOption']> = {
  content?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  correct?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LearningElementResolvers<ContextType = any, ParentType extends ResolversParentTypes['LearningElement'] = ResolversParentTypes['LearningElement']> = {
  feedback?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  motivation?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  options?: Resolver<Array<ResolversTypes['LearningAnswerOption']>, ParentType, ContextType>;
  question?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  reward?: Resolver<Maybe<ResolversTypes['JSONObject']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LearningElementAttemptResolvers<ContextType = any, ParentType extends ResolversParentTypes['LearningElementAttempt'] = ResolversParentTypes['LearningElementAttempt']> = {
  element?: Resolver<Maybe<ResolversTypes['LearningElement']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  player?: Resolver<Maybe<ResolversTypes['Player']>, ParentType, ContextType>;
  pointsAchieved?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  pointsMax?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LearningElementStateResolvers<ContextType = any, ParentType extends ResolversParentTypes['LearningElementState'] = ResolversParentTypes['LearningElementState']> = {
  element?: Resolver<Maybe<ResolversTypes['LearningElement']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  solution?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  state?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  activateNextPeriod?: Resolver<Maybe<ResolversTypes['Game']>, ParentType, ContextType, RequireFields<MutationActivateNextPeriodArgs, 'gameId'>>;
  activateNextSegment?: Resolver<Maybe<ResolversTypes['Game']>, ParentType, ContextType, RequireFields<MutationActivateNextSegmentArgs, 'gameId'>>;
  addGamePeriod?: Resolver<Maybe<ResolversTypes['Period']>, ParentType, ContextType, RequireFields<MutationAddGamePeriodArgs, 'facts' | 'gameId'>>;
  addPeriodSegment?: Resolver<Maybe<ResolversTypes['PeriodSegment']>, ParentType, ContextType, RequireFields<MutationAddPeriodSegmentArgs, 'facts' | 'gameId' | 'periodIx'>>;
  attemptLearningElement?: Resolver<Maybe<ResolversTypes['LearningElementAttempt']>, ParentType, ContextType, RequireFields<MutationAttemptLearningElementArgs, 'elementId' | 'selection'>>;
  createGame?: Resolver<Maybe<ResolversTypes['Game']>, ParentType, ContextType, RequireFields<MutationCreateGameArgs, 'name' | 'playerCount'>>;
  loginAsTeam?: Resolver<Maybe<ResolversTypes['Player']>, ParentType, ContextType, RequireFields<MutationLoginAsTeamArgs, 'token'>>;
  markStoryElement?: Resolver<Maybe<ResolversTypes['Player']>, ParentType, ContextType, RequireFields<MutationMarkStoryElementArgs, 'elementId'>>;
  performAction?: Resolver<Maybe<ResolversTypes['PlayerResult']>, ParentType, ContextType, RequireFields<MutationPerformActionArgs, 'payload' | 'type'>>;
  saveConsolidationDecision?: Resolver<Maybe<ResolversTypes['PlayerDecision']>, ParentType, ContextType, RequireFields<MutationSaveConsolidationDecisionArgs, 'payload'>>;
  updatePlayerData?: Resolver<Maybe<ResolversTypes['Player']>, ParentType, ContextType, Partial<MutationUpdatePlayerDataArgs>>;
  updateReadyState?: Resolver<Maybe<ResolversTypes['Player']>, ParentType, ContextType, RequireFields<MutationUpdateReadyStateArgs, 'isReady'>>;
};

export type PeriodResolvers<ContextType = any, ParentType extends ResolversParentTypes['Period'] = ResolversParentTypes['Period']> = {
  actions?: Resolver<Array<ResolversTypes['PlayerAction']>, ParentType, ContextType>;
  activeSegment?: Resolver<Maybe<ResolversTypes['PeriodSegment']>, ParentType, ContextType>;
  activeSegmentIx?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  facts?: Resolver<ResolversTypes['JSONObject'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  index?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  results?: Resolver<Array<ResolversTypes['PlayerResult']>, ParentType, ContextType>;
  segments?: Resolver<Array<ResolversTypes['PeriodSegment']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PeriodSegmentResolvers<ContextType = any, ParentType extends ResolversParentTypes['PeriodSegment'] = ResolversParentTypes['PeriodSegment']> = {
  actions?: Resolver<Array<ResolversTypes['PlayerAction']>, ParentType, ContextType>;
  facts?: Resolver<ResolversTypes['JSONObject'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  index?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  learningElements?: Resolver<Array<ResolversTypes['LearningElement']>, ParentType, ContextType>;
  periodIx?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  results?: Resolver<Array<ResolversTypes['PlayerResult']>, ParentType, ContextType>;
  storyElements?: Resolver<Array<ResolversTypes['StoryElement']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlayerResolvers<ContextType = any, ParentType extends ResolversParentTypes['Player'] = ResolversParentTypes['Player']> = {
  achievementIds?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  achievementKeys?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  achievements?: Resolver<Array<ResolversTypes['AchievementInstance']>, ParentType, ContextType>;
  avatar?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  color?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  completedLearningElementIds?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  completedLearningElements?: Resolver<Array<ResolversTypes['LearningElement']>, ParentType, ContextType>;
  experience?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  experienceToNext?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  facts?: Resolver<ResolversTypes['JSONObject'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isReady?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  level?: Resolver<ResolversTypes['PlayerLevel'], ParentType, ContextType>;
  levelIx?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  location?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  role?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tutorialCompleted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  visitedStoryElementIds?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  visitedStoryElements?: Resolver<Array<ResolversTypes['StoryElement']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlayerActionResolvers<ContextType = any, ParentType extends ResolversParentTypes['PlayerAction'] = ResolversParentTypes['PlayerAction']> = {
  facts?: Resolver<Maybe<ResolversTypes['JSONObject']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  period?: Resolver<ResolversTypes['Period'], ParentType, ContextType>;
  periodIx?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  player?: Resolver<ResolversTypes['Player'], ParentType, ContextType>;
  segment?: Resolver<Maybe<ResolversTypes['PeriodSegment']>, ParentType, ContextType>;
  segmentIx?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlayerDecisionResolvers<ContextType = any, ParentType extends ResolversParentTypes['PlayerDecision'] = ResolversParentTypes['PlayerDecision']> = {
  facts?: Resolver<ResolversTypes['JSONObject'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  period?: Resolver<ResolversTypes['Period'], ParentType, ContextType>;
  periodIx?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  player?: Resolver<ResolversTypes['Player'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['PlayerDecisionType'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlayerLevelResolvers<ContextType = any, ParentType extends ResolversParentTypes['PlayerLevel'] = ResolversParentTypes['PlayerLevel']> = {
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  index?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  requiredXP?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlayerResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['PlayerResult'] = ResolversParentTypes['PlayerResult']> = {
  facts?: Resolver<Maybe<ResolversTypes['JSONObject']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  period?: Resolver<ResolversTypes['Period'], ParentType, ContextType>;
  player?: Resolver<ResolversTypes['Player'], ParentType, ContextType>;
  segment?: Resolver<Maybe<ResolversTypes['PeriodSegment']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['PlayerResultType']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlayerStateResolvers<ContextType = any, ParentType extends ResolversParentTypes['PlayerState'] = ResolversParentTypes['PlayerState']> = {
  currentGame?: Resolver<Maybe<ResolversTypes['Game']>, ParentType, ContextType>;
  playerResult?: Resolver<Maybe<ResolversTypes['PlayerResult']>, ParentType, ContextType>;
  previousResults?: Resolver<Maybe<Array<ResolversTypes['PlayerResult']>>, ParentType, ContextType>;
  transactions?: Resolver<Maybe<Array<ResolversTypes['PlayerAction']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  game?: Resolver<Maybe<ResolversTypes['Game']>, ParentType, ContextType, Partial<QueryGameArgs>>;
  games?: Resolver<Maybe<Array<ResolversTypes['Game']>>, ParentType, ContextType>;
  learningElement?: Resolver<Maybe<ResolversTypes['LearningElementState']>, ParentType, ContextType, RequireFields<QueryLearningElementArgs, 'id'>>;
  learningElements?: Resolver<Maybe<Array<ResolversTypes['LearningElement']>>, ParentType, ContextType>;
  pastResults?: Resolver<Maybe<Array<ResolversTypes['PlayerResult']>>, ParentType, ContextType>;
  result?: Resolver<Maybe<ResolversTypes['PlayerState']>, ParentType, ContextType>;
  results?: Resolver<Maybe<Array<ResolversTypes['PlayerResult']>>, ParentType, ContextType>;
  self?: Resolver<ResolversTypes['Player'], ParentType, ContextType>;
};

export type StoryElementResolvers<ContextType = any, ParentType extends ResolversParentTypes['StoryElement'] = ResolversParentTypes['StoryElement']> = {
  content?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contentRole?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  reward?: Resolver<Maybe<ResolversTypes['JSONObject']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['StoryElementType'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SubscriptionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
  eventsGlobal?: SubscriptionResolver<Maybe<Array<ResolversTypes['Event']>>, "eventsGlobal", ParentType, ContextType>;
  eventsUser?: SubscriptionResolver<Maybe<Array<ResolversTypes['Event']>>, "eventsUser", ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  Achievement?: AchievementResolvers<ContextType>;
  AchievementInstance?: AchievementInstanceResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  Event?: EventResolvers<ContextType>;
  Game?: GameResolvers<ContextType>;
  JSONObject?: GraphQLScalarType;
  LearningAnswerOption?: LearningAnswerOptionResolvers<ContextType>;
  LearningElement?: LearningElementResolvers<ContextType>;
  LearningElementAttempt?: LearningElementAttemptResolvers<ContextType>;
  LearningElementState?: LearningElementStateResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Period?: PeriodResolvers<ContextType>;
  PeriodSegment?: PeriodSegmentResolvers<ContextType>;
  Player?: PlayerResolvers<ContextType>;
  PlayerAction?: PlayerActionResolvers<ContextType>;
  PlayerDecision?: PlayerDecisionResolvers<ContextType>;
  PlayerLevel?: PlayerLevelResolvers<ContextType>;
  PlayerResult?: PlayerResultResolvers<ContextType>;
  PlayerState?: PlayerStateResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  StoryElement?: StoryElementResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
};



      export interface PossibleTypesResultData {
        possibleTypes: {
          [key: string]: string[]
        }
      }
      const result: PossibleTypesResultData = {
  "possibleTypes": {}
};
      export default result;
    