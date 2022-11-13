import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
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
  segments: Array<PeriodSegment>;
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
  addGamePeriod: Period;
  addPeriodSegment: PeriodSegment;
  attemptLearningElement?: Maybe<LearningElementAttempt>;
  createGame: Game;
  loginAsTeam: Player;
  markStoryElement?: Maybe<Player>;
  performAction: PlayerResult;
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
  convenienceYield?: InputMaybe<Scalars['Float']>;
  futuresTradingEnabled?: InputMaybe<Scalars['Boolean']>;
  initialSpotPrice?: InputMaybe<Scalars['Int']>;
  interestRate?: InputMaybe<Scalars['Float']>;
  optionsTradingEnabled?: InputMaybe<Scalars['Boolean']>;
  randomSeed?: InputMaybe<Scalars['Int']>;
  spotTradingEnabled?: InputMaybe<Scalars['Boolean']>;
  storageCostPerItem?: InputMaybe<Scalars['Int']>;
  trendE?: InputMaybe<Scalars['Float']>;
  trendGap?: InputMaybe<Scalars['Float']>;
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
  trendE?: InputMaybe<Scalars['Float']>;
  trendGap?: InputMaybe<Scalars['Float']>;
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
  role: Scalars['String'];
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
  previousResults?: Maybe<Array<Maybe<PlayerResult>>>;
  transactions?: Maybe<Array<Maybe<PlayerAction>>>;
};

export type Query = {
  __typename?: 'Query';
  game?: Maybe<Game>;
  games: Array<Maybe<Game>>;
  learningElement?: Maybe<LearningElementState>;
  learningElements: Array<Maybe<LearningElement>>;
  pastResults?: Maybe<Array<Maybe<PlayerResult>>>;
  result?: Maybe<PlayerState>;
  results?: Maybe<Array<Maybe<PlayerResult>>>;
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
  eventsGlobal?: Maybe<Array<Maybe<Event>>>;
  eventsUser?: Maybe<Array<Maybe<Event>>>;
};

export enum UserRole {
  Admin = 'ADMIN',
  Master = 'MASTER'
}

export type GameDataFragment = { __typename?: 'Game', id: string, status: GameStatus, name: string, activePeriodIx?: number | null };

export type LearningElementDataFragment = { __typename?: 'LearningElement', id: string, title: string, question: string, reward?: any | null, motivation?: string | null, feedback?: string | null };

export type PeriodDataFragment = { __typename?: 'Period', id: string, index: number, activeSegmentIx?: number | null, facts: any, segments: Array<{ __typename?: 'PeriodSegment', id: string, index: number, facts: any, learningElements: Array<{ __typename?: 'LearningElement', id: string }>, storyElements: Array<{ __typename?: 'StoryElement', id: string }> }> };

export type PlayerActionDataFragment = { __typename?: 'PlayerAction', id: string, periodIx: number, segmentIx?: number | null, type: string, facts?: any | null };

export type PlayerDataFragment = { __typename?: 'Player', id: string, isReady: boolean, role: string, name: string, avatar: string, location: string, color: string, facts: any, experience: number, experienceToNext: number, achievementKeys: Array<string>, achievements: Array<{ __typename?: 'AchievementInstance', id: number, count: number, achievement: { __typename?: 'Achievement', id: string, name: string, description: string, image?: string | null, reward?: any | null } }>, level: { __typename?: 'PlayerLevel', id: string, index: number } };

export type ResultDataFragment = { __typename?: 'PlayerResult', id: string, type?: PlayerResultType | null, facts?: any | null, period: { __typename?: 'Period', id: string, index: number }, segment?: { __typename?: 'PeriodSegment', id: string, index: number } | null };

export type SegmentDataFragment = { __typename?: 'PeriodSegment', id: string, index: number, facts: any, learningElements: Array<{ __typename?: 'LearningElement', id: string }>, storyElements: Array<{ __typename?: 'StoryElement', id: string }> };

export type ActivateNextPeriodMutationVariables = Exact<{
  gameId: Scalars['Int'];
}>;


export type ActivateNextPeriodMutation = { __typename?: 'Mutation', activateNextPeriod?: { __typename?: 'Game', id: string, status: GameStatus, name: string, activePeriodIx?: number | null, periods: Array<{ __typename?: 'Period', id: string, index: number, activeSegmentIx?: number | null, facts: any, segments: Array<{ __typename?: 'PeriodSegment', id: string, index: number, facts: any, learningElements: Array<{ __typename?: 'LearningElement', id: string }>, storyElements: Array<{ __typename?: 'StoryElement', id: string }> }> }> } | null };

export type ActivateNextSegmentMutationVariables = Exact<{
  gameId: Scalars['Int'];
}>;


export type ActivateNextSegmentMutation = { __typename?: 'Mutation', activateNextSegment?: { __typename?: 'Game', id: string, status: GameStatus, name: string, activePeriodIx?: number | null, periods: Array<{ __typename?: 'Period', id: string, index: number, activeSegmentIx?: number | null, facts: any, segments: Array<{ __typename?: 'PeriodSegment', id: string, index: number, facts: any, learningElements: Array<{ __typename?: 'LearningElement', id: string }>, storyElements: Array<{ __typename?: 'StoryElement', id: string }> }> }>, players: Array<{ __typename?: 'Player', id: string, isReady: boolean, role: string, name: string, avatar: string, location: string, color: string, facts: any, experience: number, experienceToNext: number, achievementKeys: Array<string>, achievements: Array<{ __typename?: 'AchievementInstance', id: number, count: number, achievement: { __typename?: 'Achievement', id: string, name: string, description: string, image?: string | null, reward?: any | null } }>, level: { __typename?: 'PlayerLevel', id: string, index: number } }> } | null };

export type AddGamePeriodMutationVariables = Exact<{
  gameId: Scalars['Int'];
  facts: PeriodFactsInput;
}>;


export type AddGamePeriodMutation = { __typename?: 'Mutation', addGamePeriod: { __typename?: 'Period', id: string, index: number, activeSegmentIx?: number | null, facts: any, segments: Array<{ __typename?: 'PeriodSegment', id: string, index: number, facts: any, learningElements: Array<{ __typename?: 'LearningElement', id: string }>, storyElements: Array<{ __typename?: 'StoryElement', id: string }> }> } };

export type AddPeriodSegmentMutationVariables = Exact<{
  gameId: Scalars['Int'];
  periodIx: Scalars['Int'];
  facts: PeriodSegmentFactsInput;
  storyElements?: InputMaybe<Array<InputMaybe<Scalars['String']>> | InputMaybe<Scalars['String']>>;
  learningElements?: InputMaybe<Array<InputMaybe<Scalars['String']>> | InputMaybe<Scalars['String']>>;
}>;


export type AddPeriodSegmentMutation = { __typename?: 'Mutation', addPeriodSegment: { __typename?: 'PeriodSegment', id: string, index: number, facts: any, learningElements: Array<{ __typename?: 'LearningElement', id: string }>, storyElements: Array<{ __typename?: 'StoryElement', id: string }> } };

export type AttemptLearningElementMutationVariables = Exact<{
  elementId: Scalars['ID'];
  selection: Scalars['String'];
}>;


export type AttemptLearningElementMutation = { __typename?: 'Mutation', attemptLearningElement?: { __typename?: 'LearningElementAttempt', id?: string | null, pointsAchieved?: number | null, pointsMax?: number | null, element?: { __typename?: 'LearningElement', id: string, feedback?: string | null } | null, player?: { __typename?: 'Player', id: string, completedLearningElementIds: Array<number> } | null } | null };

export type CreateGameMutationVariables = Exact<{
  name: Scalars['String'];
  playerCount: Scalars['Int'];
}>;


export type CreateGameMutation = { __typename?: 'Mutation', createGame: { __typename?: 'Game', id: string, status: GameStatus, name: string, activePeriodIx?: number | null } };

export type LoginAsTeamMutationVariables = Exact<{
  token: Scalars['String'];
}>;


export type LoginAsTeamMutation = { __typename?: 'Mutation', loginAsTeam: { __typename?: 'Player', id: string, isReady: boolean, role: string, name: string, avatar: string, location: string, color: string, facts: any, experience: number, experienceToNext: number, achievementKeys: Array<string>, achievements: Array<{ __typename?: 'AchievementInstance', id: number, count: number, achievement: { __typename?: 'Achievement', id: string, name: string, description: string, image?: string | null, reward?: any | null } }>, level: { __typename?: 'PlayerLevel', id: string, index: number } } };

export type MarkStoryElementMutationVariables = Exact<{
  elementId: Scalars['ID'];
}>;


export type MarkStoryElementMutation = { __typename?: 'Mutation', markStoryElement?: { __typename?: 'Player', id: string, visitedStoryElementIds: Array<number> } | null };

export type PerformActionMutationVariables = Exact<{
  type: Scalars['String'];
  payload: Scalars['String'];
}>;


export type PerformActionMutation = { __typename?: 'Mutation', performAction: { __typename?: 'PlayerResult', id: string, type?: PlayerResultType | null, facts?: any | null, period: { __typename?: 'Period', id: string, index: number }, segment?: { __typename?: 'PeriodSegment', id: string, index: number } | null } };

export type SaveConsolidationDecisionMutationVariables = Exact<{
  payload: Scalars['String'];
}>;


export type SaveConsolidationDecisionMutation = { __typename?: 'Mutation', saveConsolidationDecision?: { __typename?: 'PlayerDecision', id: string, type: PlayerDecisionType, facts: any } | null };

export type UpdatePlayerDataMutationVariables = Exact<{
  name?: InputMaybe<Scalars['String']>;
  avatar?: InputMaybe<Scalars['String']>;
  color?: InputMaybe<Scalars['String']>;
  facts?: InputMaybe<Scalars['String']>;
}>;


export type UpdatePlayerDataMutation = { __typename?: 'Mutation', updatePlayerData?: { __typename?: 'Player', id: string, isReady: boolean, role: string, name: string, avatar: string, location: string, color: string, facts: any, experience: number, experienceToNext: number, achievementKeys: Array<string>, achievements: Array<{ __typename?: 'AchievementInstance', id: number, count: number, achievement: { __typename?: 'Achievement', id: string, name: string, description: string, image?: string | null, reward?: any | null } }>, level: { __typename?: 'PlayerLevel', id: string, index: number } } | null };

export type UpdateReadyStateMutationVariables = Exact<{
  isReady: Scalars['Boolean'];
}>;


export type UpdateReadyStateMutation = { __typename?: 'Mutation', updateReadyState?: { __typename?: 'Player', id: string, isReady: boolean } | null };

export type GameQueryVariables = Exact<{
  id?: InputMaybe<Scalars['Int']>;
}>;


export type GameQuery = { __typename?: 'Query', game?: { __typename?: 'Game', id: string, status: GameStatus, name: string, activePeriodIx?: number | null, activePeriod?: { __typename?: 'Period', id: string, activeSegmentIx?: number | null, segments: Array<{ __typename?: 'PeriodSegment', id: string }> } | null, periods: Array<{ __typename?: 'Period', id: string, index: number, activeSegmentIx?: number | null, facts: any, segments: Array<{ __typename?: 'PeriodSegment', id: string, index: number, facts: any, learningElements: Array<{ __typename?: 'LearningElement', id: string }>, storyElements: Array<{ __typename?: 'StoryElement', id: string }> }> }>, players: Array<{ __typename?: 'Player', id: string, isReady: boolean, role: string, name: string, avatar: string, location: string, color: string, facts: any, experience: number, experienceToNext: number, token: string }> } | null };

export type GamesQueryVariables = Exact<{ [key: string]: never; }>;


export type GamesQuery = { __typename?: 'Query', games: Array<{ __typename?: 'Game', id: string, status: GameStatus, name: string, activePeriodIx?: number | null } | null> };

export type LearningElementQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type LearningElementQuery = { __typename?: 'Query', learningElement?: { __typename?: 'LearningElementState', id?: string | null, state?: string | null, solution?: string | null, element?: { __typename?: 'LearningElement', id: string, title: string, question: string, reward?: any | null, motivation?: string | null, feedback?: string | null, options: Array<{ __typename?: 'LearningAnswerOption', content: string }> } | null } | null };

export type LearningElementsQueryVariables = Exact<{ [key: string]: never; }>;


export type LearningElementsQuery = { __typename?: 'Query', learningElements: Array<{ __typename?: 'LearningElement', id: string, title: string, question: string, reward?: any | null, motivation?: string | null, feedback?: string | null } | null> };

export type PastResultsQueryVariables = Exact<{ [key: string]: never; }>;


export type PastResultsQuery = { __typename?: 'Query', result?: { __typename?: 'PlayerState', currentGame?: { __typename?: 'Game', id: string, status: GameStatus } | null } | null, pastResults?: Array<{ __typename?: 'PlayerResult', id: string, type?: PlayerResultType | null, facts?: any | null, player: { __typename?: 'Player', id: string, role: string, name: string, avatar: string, color: string, facts: any, experience: number, experienceToNext: number, completedLearningElementIds: Array<number>, visitedStoryElementIds: Array<number>, level: { __typename?: 'PlayerLevel', id: string, index: number } }, period: { __typename?: 'Period', id: string, index: number, facts: any }, segment?: { __typename?: 'PeriodSegment', id: string, index: number } | null } | null> | null };

export type ResultQueryVariables = Exact<{ [key: string]: never; }>;


export type ResultQuery = { __typename?: 'Query', result?: { __typename?: 'PlayerState', playerResult?: { __typename?: 'PlayerResult', id: string, type?: PlayerResultType | null, facts?: any | null, player: { __typename?: 'Player', id: string, completedLearningElementIds: Array<number>, visitedStoryElementIds: Array<number> }, period: { __typename?: 'Period', id: string, index: number }, segment?: { __typename?: 'PeriodSegment', id: string, index: number } | null } | null, previousResults?: Array<{ __typename?: 'PlayerResult', id: string, type?: PlayerResultType | null, facts?: any | null, period: { __typename?: 'Period', id: string, index: number }, segment?: { __typename?: 'PeriodSegment', id: string, index: number } | null } | null> | null, currentGame?: { __typename?: 'Game', id: string, status: GameStatus, periods: Array<{ __typename?: 'Period', id: string, index: number, activeSegmentIx?: number | null, facts: any, segments: Array<{ __typename?: 'PeriodSegment', id: string, index: number, facts: any, learningElements: Array<{ __typename?: 'LearningElement', id: string }>, storyElements: Array<{ __typename?: 'StoryElement', id: string }> }> }>, activePeriod?: { __typename?: 'Period', id: string, index: number, activeSegmentIx?: number | null, facts: any, activeSegment?: { __typename?: 'PeriodSegment', id: string, index: number, facts: any, learningElements: Array<{ __typename?: 'LearningElement', id: string, title: string }>, storyElements: Array<{ __typename?: 'StoryElement', id: string, type: StoryElementType, title: string, content?: string | null, contentRole?: string | null }> } | null, segments: Array<{ __typename?: 'PeriodSegment', id: string, index: number, facts: any, learningElements: Array<{ __typename?: 'LearningElement', id: string }>, storyElements: Array<{ __typename?: 'StoryElement', id: string }> }> } | null } | null, transactions?: Array<{ __typename?: 'PlayerAction', id: string, periodIx: number, segmentIx?: number | null, type: string, facts?: any | null } | null> | null } | null, self: { __typename?: 'Player', id: string, isReady: boolean, role: string, name: string, avatar: string, location: string, color: string, facts: any, experience: number, experienceToNext: number, achievementKeys: Array<string>, achievements: Array<{ __typename?: 'AchievementInstance', id: number, count: number, achievement: { __typename?: 'Achievement', id: string, name: string, description: string, image?: string | null, reward?: any | null } }>, level: { __typename?: 'PlayerLevel', id: string, index: number } } };

export type ResultsQueryVariables = Exact<{ [key: string]: never; }>;


export type ResultsQuery = { __typename?: 'Query', results?: Array<{ __typename?: 'PlayerResult', id: string, type?: PlayerResultType | null, facts?: any | null, player: { __typename?: 'Player', id: string, name: string }, period: { __typename?: 'Period', id: string, index: number }, segment?: { __typename?: 'PeriodSegment', id: string, index: number } | null } | null> | null };

export type SelfQueryVariables = Exact<{ [key: string]: never; }>;


export type SelfQuery = { __typename?: 'Query', self: { __typename?: 'Player', id: string, isReady: boolean, role: string, name: string, avatar: string, location: string, color: string, facts: any, experience: number, experienceToNext: number, achievementKeys: Array<string>, achievements: Array<{ __typename?: 'AchievementInstance', id: number, count: number, achievement: { __typename?: 'Achievement', id: string, name: string, description: string, image?: string | null, reward?: any | null } }>, level: { __typename?: 'PlayerLevel', id: string, index: number } } };

export type GlobalEventsSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type GlobalEventsSubscription = { __typename?: 'Subscription', eventsGlobal?: Array<{ __typename?: 'Event', type?: string | null } | null> | null };

export type UserEventsSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type UserEventsSubscription = { __typename?: 'Subscription', eventsUser?: Array<{ __typename?: 'Event', type?: string | null } | null> | null };



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
  segments?: Resolver<Array<ResolversTypes['PeriodSegment']>, ParentType, ContextType>;
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
  addGamePeriod?: Resolver<ResolversTypes['Period'], ParentType, ContextType, RequireFields<MutationAddGamePeriodArgs, 'facts' | 'gameId'>>;
  addPeriodSegment?: Resolver<ResolversTypes['PeriodSegment'], ParentType, ContextType, RequireFields<MutationAddPeriodSegmentArgs, 'facts' | 'gameId' | 'periodIx'>>;
  attemptLearningElement?: Resolver<Maybe<ResolversTypes['LearningElementAttempt']>, ParentType, ContextType, RequireFields<MutationAttemptLearningElementArgs, 'elementId' | 'selection'>>;
  createGame?: Resolver<ResolversTypes['Game'], ParentType, ContextType, RequireFields<MutationCreateGameArgs, 'name' | 'playerCount'>>;
  loginAsTeam?: Resolver<ResolversTypes['Player'], ParentType, ContextType, RequireFields<MutationLoginAsTeamArgs, 'token'>>;
  markStoryElement?: Resolver<Maybe<ResolversTypes['Player']>, ParentType, ContextType, RequireFields<MutationMarkStoryElementArgs, 'elementId'>>;
  performAction?: Resolver<ResolversTypes['PlayerResult'], ParentType, ContextType, RequireFields<MutationPerformActionArgs, 'payload' | 'type'>>;
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
  role?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
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
  previousResults?: Resolver<Maybe<Array<Maybe<ResolversTypes['PlayerResult']>>>, ParentType, ContextType>;
  transactions?: Resolver<Maybe<Array<Maybe<ResolversTypes['PlayerAction']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  game?: Resolver<Maybe<ResolversTypes['Game']>, ParentType, ContextType, Partial<QueryGameArgs>>;
  games?: Resolver<Array<Maybe<ResolversTypes['Game']>>, ParentType, ContextType>;
  learningElement?: Resolver<Maybe<ResolversTypes['LearningElementState']>, ParentType, ContextType, RequireFields<QueryLearningElementArgs, 'id'>>;
  learningElements?: Resolver<Array<Maybe<ResolversTypes['LearningElement']>>, ParentType, ContextType>;
  pastResults?: Resolver<Maybe<Array<Maybe<ResolversTypes['PlayerResult']>>>, ParentType, ContextType>;
  result?: Resolver<Maybe<ResolversTypes['PlayerState']>, ParentType, ContextType>;
  results?: Resolver<Maybe<Array<Maybe<ResolversTypes['PlayerResult']>>>, ParentType, ContextType>;
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
  eventsGlobal?: SubscriptionResolver<Maybe<Array<Maybe<ResolversTypes['Event']>>>, "eventsGlobal", ParentType, ContextType>;
  eventsUser?: SubscriptionResolver<Maybe<Array<Maybe<ResolversTypes['Event']>>>, "eventsUser", ParentType, ContextType>;
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


export const GameDataFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GameData"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Game"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"activePeriodIx"}}]}}]} as unknown as DocumentNode<GameDataFragment, unknown>;
export const LearningElementDataFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LearningElementData"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LearningElement"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"question"}},{"kind":"Field","name":{"kind":"Name","value":"reward"}},{"kind":"Field","name":{"kind":"Name","value":"motivation"}},{"kind":"Field","name":{"kind":"Name","value":"feedback"}}]}}]} as unknown as DocumentNode<LearningElementDataFragment, unknown>;
export const SegmentDataFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SegmentData"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PeriodSegment"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"facts"}},{"kind":"Field","name":{"kind":"Name","value":"learningElements"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"storyElements"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<SegmentDataFragment, unknown>;
export const PeriodDataFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PeriodData"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Period"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"activeSegmentIx"}},{"kind":"Field","name":{"kind":"Name","value":"facts"}},{"kind":"Field","name":{"kind":"Name","value":"segments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SegmentData"}}]}}]}},...SegmentDataFragmentDoc.definitions]} as unknown as DocumentNode<PeriodDataFragment, unknown>;
export const PlayerActionDataFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PlayerActionData"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PlayerAction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"periodIx"}},{"kind":"Field","name":{"kind":"Name","value":"segmentIx"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"facts"}}]}}]} as unknown as DocumentNode<PlayerActionDataFragment, unknown>;
export const PlayerDataFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PlayerData"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Player"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isReady"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"facts"}},{"kind":"Field","name":{"kind":"Name","value":"experience"}},{"kind":"Field","name":{"kind":"Name","value":"experienceToNext"}},{"kind":"Field","name":{"kind":"Name","value":"achievementKeys"}},{"kind":"Field","name":{"kind":"Name","value":"achievements"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"achievement"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"reward"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"level"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"index"}}]}}]}}]} as unknown as DocumentNode<PlayerDataFragment, unknown>;
export const ResultDataFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ResultData"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PlayerResult"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"facts"}},{"kind":"Field","name":{"kind":"Name","value":"period"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"index"}}]}},{"kind":"Field","name":{"kind":"Name","value":"segment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"index"}}]}}]}}]} as unknown as DocumentNode<ResultDataFragment, unknown>;
export const ActivateNextPeriodDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ActivateNextPeriod"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"gameId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activateNextPeriod"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"gameId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"gameId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GameData"}},{"kind":"Field","name":{"kind":"Name","value":"periods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PeriodData"}}]}}]}}]}},...GameDataFragmentDoc.definitions,...PeriodDataFragmentDoc.definitions]} as unknown as DocumentNode<ActivateNextPeriodMutation, ActivateNextPeriodMutationVariables>;
export const ActivateNextSegmentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ActivateNextSegment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"gameId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activateNextSegment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"gameId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"gameId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GameData"}},{"kind":"Field","name":{"kind":"Name","value":"periods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PeriodData"}}]}},{"kind":"Field","name":{"kind":"Name","value":"players"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PlayerData"}}]}}]}}]}},...GameDataFragmentDoc.definitions,...PeriodDataFragmentDoc.definitions,...PlayerDataFragmentDoc.definitions]} as unknown as DocumentNode<ActivateNextSegmentMutation, ActivateNextSegmentMutationVariables>;
export const AddGamePeriodDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddGamePeriod"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"gameId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"facts"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PeriodFactsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addGamePeriod"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"gameId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"gameId"}}},{"kind":"Argument","name":{"kind":"Name","value":"facts"},"value":{"kind":"Variable","name":{"kind":"Name","value":"facts"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PeriodData"}}]}}]}},...PeriodDataFragmentDoc.definitions]} as unknown as DocumentNode<AddGamePeriodMutation, AddGamePeriodMutationVariables>;
export const AddPeriodSegmentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddPeriodSegment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"gameId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"periodIx"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"facts"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PeriodSegmentFactsInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storyElements"}},"type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"learningElements"}},"type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addPeriodSegment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"gameId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"gameId"}}},{"kind":"Argument","name":{"kind":"Name","value":"periodIx"},"value":{"kind":"Variable","name":{"kind":"Name","value":"periodIx"}}},{"kind":"Argument","name":{"kind":"Name","value":"facts"},"value":{"kind":"Variable","name":{"kind":"Name","value":"facts"}}},{"kind":"Argument","name":{"kind":"Name","value":"storyElements"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storyElements"}}},{"kind":"Argument","name":{"kind":"Name","value":"learningElements"},"value":{"kind":"Variable","name":{"kind":"Name","value":"learningElements"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SegmentData"}}]}}]}},...SegmentDataFragmentDoc.definitions]} as unknown as DocumentNode<AddPeriodSegmentMutation, AddPeriodSegmentMutationVariables>;
export const AttemptLearningElementDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AttemptLearningElement"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"elementId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"selection"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attemptLearningElement"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"elementId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"elementId"}}},{"kind":"Argument","name":{"kind":"Name","value":"selection"},"value":{"kind":"Variable","name":{"kind":"Name","value":"selection"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"pointsAchieved"}},{"kind":"Field","name":{"kind":"Name","value":"pointsMax"}},{"kind":"Field","name":{"kind":"Name","value":"element"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"feedback"}}]}},{"kind":"Field","name":{"kind":"Name","value":"player"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"completedLearningElementIds"}}]}}]}}]}}]} as unknown as DocumentNode<AttemptLearningElementMutation, AttemptLearningElementMutationVariables>;
export const CreateGameDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateGame"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"playerCount"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createGame"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}},{"kind":"Argument","name":{"kind":"Name","value":"playerCount"},"value":{"kind":"Variable","name":{"kind":"Name","value":"playerCount"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GameData"}}]}}]}},...GameDataFragmentDoc.definitions]} as unknown as DocumentNode<CreateGameMutation, CreateGameMutationVariables>;
export const LoginAsTeamDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"LoginAsTeam"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"token"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"loginAsTeam"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"token"},"value":{"kind":"Variable","name":{"kind":"Name","value":"token"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PlayerData"}}]}}]}},...PlayerDataFragmentDoc.definitions]} as unknown as DocumentNode<LoginAsTeamMutation, LoginAsTeamMutationVariables>;
export const MarkStoryElementDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkStoryElement"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"elementId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markStoryElement"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"elementId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"elementId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"visitedStoryElementIds"}}]}}]}}]} as unknown as DocumentNode<MarkStoryElementMutation, MarkStoryElementMutationVariables>;
export const PerformActionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PerformAction"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"type"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"payload"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"performAction"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"Variable","name":{"kind":"Name","value":"type"}}},{"kind":"Argument","name":{"kind":"Name","value":"payload"},"value":{"kind":"Variable","name":{"kind":"Name","value":"payload"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ResultData"}}]}}]}},...ResultDataFragmentDoc.definitions]} as unknown as DocumentNode<PerformActionMutation, PerformActionMutationVariables>;
export const SaveConsolidationDecisionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SaveConsolidationDecision"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"payload"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"saveConsolidationDecision"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"payload"},"value":{"kind":"Variable","name":{"kind":"Name","value":"payload"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"facts"}}]}}]}}]} as unknown as DocumentNode<SaveConsolidationDecisionMutation, SaveConsolidationDecisionMutationVariables>;
export const UpdatePlayerDataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdatePlayerData"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"avatar"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"color"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"facts"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updatePlayerData"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}},{"kind":"Argument","name":{"kind":"Name","value":"avatar"},"value":{"kind":"Variable","name":{"kind":"Name","value":"avatar"}}},{"kind":"Argument","name":{"kind":"Name","value":"color"},"value":{"kind":"Variable","name":{"kind":"Name","value":"color"}}},{"kind":"Argument","name":{"kind":"Name","value":"facts"},"value":{"kind":"Variable","name":{"kind":"Name","value":"facts"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PlayerData"}}]}}]}},...PlayerDataFragmentDoc.definitions]} as unknown as DocumentNode<UpdatePlayerDataMutation, UpdatePlayerDataMutationVariables>;
export const UpdateReadyStateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateReadyState"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"isReady"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateReadyState"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"isReady"},"value":{"kind":"Variable","name":{"kind":"Name","value":"isReady"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isReady"}}]}}]}}]} as unknown as DocumentNode<UpdateReadyStateMutation, UpdateReadyStateMutationVariables>;
export const GameDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Game"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"game"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GameData"}},{"kind":"Field","name":{"kind":"Name","value":"activePeriod"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"activeSegmentIx"}},{"kind":"Field","name":{"kind":"Name","value":"segments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"periods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PeriodData"}}]}},{"kind":"Field","name":{"kind":"Name","value":"players"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isReady"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"facts"}},{"kind":"Field","name":{"kind":"Name","value":"experience"}},{"kind":"Field","name":{"kind":"Name","value":"experienceToNext"}},{"kind":"Field","name":{"kind":"Name","value":"token"}}]}}]}}]}},...GameDataFragmentDoc.definitions,...PeriodDataFragmentDoc.definitions]} as unknown as DocumentNode<GameQuery, GameQueryVariables>;
export const GamesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Games"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"games"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GameData"}}]}}]}},...GameDataFragmentDoc.definitions]} as unknown as DocumentNode<GamesQuery, GamesQueryVariables>;
export const LearningElementDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LearningElement"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"learningElement"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"element"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LearningElementData"}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"content"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"solution"}}]}}]}},...LearningElementDataFragmentDoc.definitions]} as unknown as DocumentNode<LearningElementQuery, LearningElementQueryVariables>;
export const LearningElementsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LearningElements"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"learningElements"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LearningElementData"}}]}}]}},...LearningElementDataFragmentDoc.definitions]} as unknown as DocumentNode<LearningElementsQuery, LearningElementsQueryVariables>;
export const PastResultsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PastResults"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"result"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currentGame"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pastResults"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ResultData"}},{"kind":"Field","name":{"kind":"Name","value":"player"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"facts"}},{"kind":"Field","name":{"kind":"Name","value":"experience"}},{"kind":"Field","name":{"kind":"Name","value":"experienceToNext"}},{"kind":"Field","name":{"kind":"Name","value":"level"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"index"}}]}},{"kind":"Field","name":{"kind":"Name","value":"completedLearningElementIds"}},{"kind":"Field","name":{"kind":"Name","value":"visitedStoryElementIds"}}]}},{"kind":"Field","name":{"kind":"Name","value":"period"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"facts"}}]}}]}}]}},...ResultDataFragmentDoc.definitions]} as unknown as DocumentNode<PastResultsQuery, PastResultsQueryVariables>;
export const ResultDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Result"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"result"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"playerResult"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ResultData"}},{"kind":"Field","name":{"kind":"Name","value":"player"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"completedLearningElementIds"}},{"kind":"Field","name":{"kind":"Name","value":"visitedStoryElementIds"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"previousResults"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ResultData"}}]}},{"kind":"Field","name":{"kind":"Name","value":"currentGame"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"periods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PeriodData"}}]}},{"kind":"Field","name":{"kind":"Name","value":"activePeriod"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PeriodData"}},{"kind":"Field","name":{"kind":"Name","value":"activeSegment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"facts"}},{"kind":"Field","name":{"kind":"Name","value":"learningElements"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}},{"kind":"Field","name":{"kind":"Name","value":"storyElements"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"contentRole"}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"transactions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PlayerActionData"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"self"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PlayerData"}}]}}]}},...ResultDataFragmentDoc.definitions,...PeriodDataFragmentDoc.definitions,...PlayerActionDataFragmentDoc.definitions,...PlayerDataFragmentDoc.definitions]} as unknown as DocumentNode<ResultQuery, ResultQueryVariables>;
export const ResultsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Results"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"results"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ResultData"}},{"kind":"Field","name":{"kind":"Name","value":"player"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}},...ResultDataFragmentDoc.definitions]} as unknown as DocumentNode<ResultsQuery, ResultsQueryVariables>;
export const SelfDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Self"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"self"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PlayerData"}}]}}]}},...PlayerDataFragmentDoc.definitions]} as unknown as DocumentNode<SelfQuery, SelfQueryVariables>;
export const GlobalEventsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"GlobalEvents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"eventsGlobal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]} as unknown as DocumentNode<GlobalEventsSubscription, GlobalEventsSubscriptionVariables>;
export const UserEventsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"UserEvents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"eventsUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]} as unknown as DocumentNode<UserEventsSubscription, UserEventsSubscriptionVariables>;

      export interface PossibleTypesResultData {
        possibleTypes: {
          [key: string]: string[]
        }
      }
      const result: PossibleTypesResultData = {
  "possibleTypes": {}
};
      export default result;
    