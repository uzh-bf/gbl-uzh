/**
 * This file was generated by Nexus Schema
 * Do not make changes to this file directly
 */


import type { core } from "nexus"
declare global {
  interface NexusGenCustomInputMethods<TypeName extends string> {
    /**
     * A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar.
     */
    date<FieldName extends string>(fieldName: FieldName, opts?: core.CommonInputFieldConfig<TypeName, FieldName>): void // "DateTime";
    /**
     * The `JSONObject` scalar type represents JSON objects as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf).
     */
    json<FieldName extends string>(fieldName: FieldName, opts?: core.CommonInputFieldConfig<TypeName, FieldName>): void // "JSONObject";
  }
}
declare global {
  interface NexusGenCustomOutputMethods<TypeName extends string> {
    /**
     * A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar.
     */
    date<FieldName extends string>(fieldName: FieldName, ...opts: core.ScalarOutSpread<TypeName, FieldName>): void // "DateTime";
    /**
     * The `JSONObject` scalar type represents JSON objects as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf).
     */
    json<FieldName extends string>(fieldName: FieldName, ...opts: core.ScalarOutSpread<TypeName, FieldName>): void // "JSONObject";
  }
}


declare global {
  interface NexusGen extends NexusGenTypes {}
}

export interface NexusGenInputs {
  PeriodFactsInput: { // input type
    rollsPerSegment: number | null; // Int
    scenario: NexusGenInputs['PeriodFactsScenarioInput'] | null; // PeriodFactsScenarioInput
  }
  PeriodFactsScenarioInput: { // input type
    bankReturn: number | null; // Float
    gapBonds: number | null; // Float
    gapStocks: number | null; // Float
    seed?: number | null; // Int
    trendBonds: number | null; // Float
    trendStocks: number | null; // Float
  }
  PeriodSegmentFactsInput: { // input type
    bankPercentage?: number | null; // Float
    bondsPercentage?: number | null; // Float
    stockPercentage?: number | null; // Float
  }
}

export interface NexusGenEnums {
  AchievementFrequency: "EACH" | "FIRST"
  GameStatus: "COMPLETED" | "CONSOLIDATION" | "PAUSED" | "PREPARATION" | "RESULTS" | "RUNNING" | "SCHEDULED"
  PlayerDecisionType: "CONSOLIDATION" | "PREPARATION"
  PlayerResultType: "PERIOD_END" | "PERIOD_START" | "SEGMENT_END" | "SEGMENT_START"
  StoryElementType: "GENERIC" | "ROLE_BASED"
  UserRole: "ADMIN" | "MASTER"
}

export interface NexusGenScalars {
  String: string
  Int: number
  Float: number
  Boolean: boolean
  ID: string
  DateTime: any
  JSONObject: any
}

export interface NexusGenObjects {
  Achievement: { // root type
    description: string; // String!
    id: string; // ID!
    image?: string | null; // String
    name: string; // String!
    reward?: NexusGenScalars['JSONObject'] | null; // JSONObject
    when: NexusGenEnums['AchievementFrequency']; // AchievementFrequency!
  }
  AchievementInstance: { // root type
    achievement: NexusGenRootTypes['Achievement']; // Achievement!
    count: number; // Int!
    id: number; // Int!
  }
  Event: { // root type
    type?: string | null; // String
  }
  Game: { // root type
    activePeriod?: NexusGenRootTypes['Period'] | null; // Period
    activePeriodIx?: number | null; // Int
    activeSegmentIx?: number | null; // Int
    id: string; // ID!
    name: string; // String!
    periods: NexusGenRootTypes['Period'][]; // [Period!]!
    playerCount?: number | null; // Int
    players: NexusGenRootTypes['Player'][]; // [Player!]!
    status: NexusGenEnums['GameStatus']; // GameStatus!
  }
  LearningAnswerOption: { // root type
    content: string; // String!
    correct: boolean; // Boolean!
    id: string; // ID!
  }
  LearningElement: { // root type
    feedback?: string | null; // String
    id: string; // ID!
    motivation?: string | null; // String
    options: NexusGenRootTypes['LearningAnswerOption'][]; // [LearningAnswerOption!]!
    question: string; // String!
    reward?: NexusGenScalars['JSONObject'] | null; // JSONObject
    title: string; // String!
  }
  LearningElementAttempt: { // root type
    element?: NexusGenRootTypes['LearningElement'] | null; // LearningElement
    id?: string | null; // ID
    player?: NexusGenRootTypes['Player'] | null; // Player
    pointsAchieved?: number | null; // Int
    pointsMax?: number | null; // Int
  }
  LearningElementState: { // root type
    element?: NexusGenRootTypes['LearningElement'] | null; // LearningElement
    id?: string | null; // ID
    solution?: string | null; // String
    state?: string | null; // String
  }
  Mutation: {};
  Period: { // root type
    actions: NexusGenRootTypes['PlayerAction'][]; // [PlayerAction!]!
    activeSegment?: NexusGenRootTypes['PeriodSegment'] | null; // PeriodSegment
    activeSegmentIx?: number | null; // Int
    facts: NexusGenScalars['JSONObject']; // JSONObject!
    id: string; // ID!
    index: number; // Int!
    results: NexusGenRootTypes['PlayerResult'][]; // [PlayerResult!]!
    segmentCount?: number | null; // Int
    segments: NexusGenRootTypes['PeriodSegment'][]; // [PeriodSegment!]!
  }
  PeriodSegment: { // root type
    actions: NexusGenRootTypes['PlayerAction'][]; // [PlayerAction!]!
    countdownDurationMs?: number | null; // Int
    countdownExpiresAt?: NexusGenScalars['DateTime'] | null; // DateTime
    facts: NexusGenScalars['JSONObject']; // JSONObject!
    id: string; // ID!
    index: number; // Int!
    learningElements: NexusGenRootTypes['LearningElement'][]; // [LearningElement!]!
    periodIx: number; // Int!
    results: NexusGenRootTypes['PlayerResult'][]; // [PlayerResult!]!
    storyElements: NexusGenRootTypes['StoryElement'][]; // [StoryElement!]!
  }
  Player: { // root type
    achievementIds: string[]; // [String!]!
    achievementKeys: string[]; // [String!]!
    achievements: NexusGenRootTypes['AchievementInstance'][]; // [AchievementInstance!]!
    completedLearningElementIds: string[]; // [String!]!
    completedLearningElements: NexusGenRootTypes['LearningElement'][]; // [LearningElement!]!
    experience: number; // Int!
    experienceToNext: number; // Int!
    facts: NexusGenScalars['JSONObject']; // JSONObject!
    id: string; // ID!
    isReady: boolean; // Boolean!
    level: NexusGenRootTypes['PlayerLevel']; // PlayerLevel!
    levelIx: number; // Int!
    name: string; // String!
    number: number; // Int!
    role?: string | null; // String
    token: string; // String!
    tutorialCompleted: boolean; // Boolean!
    visitedStoryElementIds: string[]; // [String!]!
    visitedStoryElements: NexusGenRootTypes['StoryElement'][]; // [StoryElement!]!
  }
  PlayerAction: { // root type
    facts?: NexusGenScalars['JSONObject'] | null; // JSONObject
    id: string; // ID!
    period: NexusGenRootTypes['Period']; // Period!
    periodIx: number; // Int!
    player: NexusGenRootTypes['Player']; // Player!
    segment?: NexusGenRootTypes['PeriodSegment'] | null; // PeriodSegment
    segmentIx?: number | null; // Int
    type: string; // String!
  }
  PlayerDecision: { // root type
    facts: NexusGenScalars['JSONObject']; // JSONObject!
    id: string; // ID!
    period: NexusGenRootTypes['Period']; // Period!
    periodIx: number; // Int!
    player: NexusGenRootTypes['Player']; // Player!
    type: NexusGenEnums['PlayerDecisionType']; // PlayerDecisionType!
  }
  PlayerLevel: { // root type
    description: string; // String!
    id: string; // ID!
    index: number; // Int!
    requiredXP: number; // Int!
  }
  PlayerResult: { // root type
    facts?: NexusGenScalars['JSONObject'] | null; // JSONObject
    id: string; // ID!
    period: NexusGenRootTypes['Period']; // Period!
    player: NexusGenRootTypes['Player']; // Player!
    segment?: NexusGenRootTypes['PeriodSegment'] | null; // PeriodSegment
    type?: NexusGenEnums['PlayerResultType'] | null; // PlayerResultType
  }
  PlayerState: { // root type
    currentGame?: NexusGenRootTypes['Game'] | null; // Game
    playerResult?: NexusGenRootTypes['PlayerResult'] | null; // PlayerResult
    previousResults?: NexusGenRootTypes['PlayerResult'][] | null; // [PlayerResult!]
    transactions?: NexusGenRootTypes['PlayerAction'][] | null; // [PlayerAction!]
  }
  Query: {};
  StoryElement: { // root type
    content?: string | null; // String
    contentRole?: NexusGenScalars['JSONObject'] | null; // JSONObject
    id: string; // ID!
    reward?: NexusGenScalars['JSONObject'] | null; // JSONObject
    title: string; // String!
    type: NexusGenEnums['StoryElementType']; // StoryElementType!
  }
  Subscription: {};
}

export interface NexusGenInterfaces {
}

export interface NexusGenUnions {
}

export type NexusGenRootTypes = NexusGenObjects

export type NexusGenAllTypes = NexusGenRootTypes & NexusGenScalars & NexusGenEnums

export interface NexusGenFieldTypes {
  Achievement: { // field return type
    description: string; // String!
    id: string; // ID!
    image: string | null; // String
    name: string; // String!
    reward: NexusGenScalars['JSONObject'] | null; // JSONObject
    when: NexusGenEnums['AchievementFrequency']; // AchievementFrequency!
  }
  AchievementInstance: { // field return type
    achievement: NexusGenRootTypes['Achievement']; // Achievement!
    count: number; // Int!
    id: number; // Int!
  }
  Event: { // field return type
    type: string | null; // String
  }
  Game: { // field return type
    activePeriod: NexusGenRootTypes['Period'] | null; // Period
    activePeriodIx: number | null; // Int
    activeSegmentIx: number | null; // Int
    id: string; // ID!
    name: string; // String!
    periods: NexusGenRootTypes['Period'][]; // [Period!]!
    playerCount: number | null; // Int
    players: NexusGenRootTypes['Player'][]; // [Player!]!
    status: NexusGenEnums['GameStatus']; // GameStatus!
  }
  LearningAnswerOption: { // field return type
    content: string; // String!
    correct: boolean; // Boolean!
    id: string; // ID!
  }
  LearningElement: { // field return type
    feedback: string | null; // String
    id: string; // ID!
    motivation: string | null; // String
    options: NexusGenRootTypes['LearningAnswerOption'][]; // [LearningAnswerOption!]!
    question: string; // String!
    reward: NexusGenScalars['JSONObject'] | null; // JSONObject
    title: string; // String!
  }
  LearningElementAttempt: { // field return type
    element: NexusGenRootTypes['LearningElement'] | null; // LearningElement
    id: string | null; // ID
    player: NexusGenRootTypes['Player'] | null; // Player
    pointsAchieved: number | null; // Int
    pointsMax: number | null; // Int
  }
  LearningElementState: { // field return type
    element: NexusGenRootTypes['LearningElement'] | null; // LearningElement
    id: string | null; // ID
    solution: string | null; // String
    state: string | null; // String
  }
  Mutation: { // field return type
    activateNextPeriod: NexusGenRootTypes['Game'] | null; // Game
    activateNextSegment: NexusGenRootTypes['Game'] | null; // Game
    addCountdown: boolean | null; // Boolean
    addGamePeriod: NexusGenRootTypes['Period'] | null; // Period
    addPeriodSegment: NexusGenRootTypes['PeriodSegment'] | null; // PeriodSegment
    attemptLearningElement: NexusGenRootTypes['LearningElementAttempt'] | null; // LearningElementAttempt
    createGame: NexusGenRootTypes['Game'] | null; // Game
    loginAsTeam: NexusGenRootTypes['Player'] | null; // Player
    logoutAsTeam: boolean | null; // Boolean
    markStoryElement: NexusGenRootTypes['Player'] | null; // Player
    performAction: NexusGenRootTypes['PlayerResult'] | null; // PlayerResult
    saveConsolidationDecision: NexusGenRootTypes['PlayerDecision'] | null; // PlayerDecision
    updatePlayerData: NexusGenRootTypes['Player'] | null; // Player
    updateReadyState: NexusGenRootTypes['Player'] | null; // Player
  }
  Period: { // field return type
    actions: NexusGenRootTypes['PlayerAction'][]; // [PlayerAction!]!
    activeSegment: NexusGenRootTypes['PeriodSegment'] | null; // PeriodSegment
    activeSegmentIx: number | null; // Int
    facts: NexusGenScalars['JSONObject']; // JSONObject!
    id: string; // ID!
    index: number; // Int!
    results: NexusGenRootTypes['PlayerResult'][]; // [PlayerResult!]!
    segmentCount: number | null; // Int
    segments: NexusGenRootTypes['PeriodSegment'][]; // [PeriodSegment!]!
  }
  PeriodSegment: { // field return type
    actions: NexusGenRootTypes['PlayerAction'][]; // [PlayerAction!]!
    countdownDurationMs: number | null; // Int
    countdownExpiresAt: NexusGenScalars['DateTime'] | null; // DateTime
    facts: NexusGenScalars['JSONObject']; // JSONObject!
    id: string; // ID!
    index: number; // Int!
    learningElements: NexusGenRootTypes['LearningElement'][]; // [LearningElement!]!
    periodIx: number; // Int!
    results: NexusGenRootTypes['PlayerResult'][]; // [PlayerResult!]!
    storyElements: NexusGenRootTypes['StoryElement'][]; // [StoryElement!]!
  }
  Player: { // field return type
    achievementIds: string[]; // [String!]!
    achievementKeys: string[]; // [String!]!
    achievements: NexusGenRootTypes['AchievementInstance'][]; // [AchievementInstance!]!
    completedLearningElementIds: string[]; // [String!]!
    completedLearningElements: NexusGenRootTypes['LearningElement'][]; // [LearningElement!]!
    experience: number; // Int!
    experienceToNext: number; // Int!
    facts: NexusGenScalars['JSONObject']; // JSONObject!
    id: string; // ID!
    isReady: boolean; // Boolean!
    level: NexusGenRootTypes['PlayerLevel']; // PlayerLevel!
    levelIx: number; // Int!
    name: string; // String!
    number: number; // Int!
    role: string | null; // String
    token: string; // String!
    tutorialCompleted: boolean; // Boolean!
    visitedStoryElementIds: string[]; // [String!]!
    visitedStoryElements: NexusGenRootTypes['StoryElement'][]; // [StoryElement!]!
  }
  PlayerAction: { // field return type
    facts: NexusGenScalars['JSONObject'] | null; // JSONObject
    id: string; // ID!
    period: NexusGenRootTypes['Period']; // Period!
    periodIx: number; // Int!
    player: NexusGenRootTypes['Player']; // Player!
    segment: NexusGenRootTypes['PeriodSegment'] | null; // PeriodSegment
    segmentIx: number | null; // Int
    type: string; // String!
  }
  PlayerDecision: { // field return type
    facts: NexusGenScalars['JSONObject']; // JSONObject!
    id: string; // ID!
    period: NexusGenRootTypes['Period']; // Period!
    periodIx: number; // Int!
    player: NexusGenRootTypes['Player']; // Player!
    type: NexusGenEnums['PlayerDecisionType']; // PlayerDecisionType!
  }
  PlayerLevel: { // field return type
    description: string; // String!
    id: string; // ID!
    index: number; // Int!
    requiredXP: number; // Int!
  }
  PlayerResult: { // field return type
    facts: NexusGenScalars['JSONObject'] | null; // JSONObject
    id: string; // ID!
    period: NexusGenRootTypes['Period']; // Period!
    player: NexusGenRootTypes['Player']; // Player!
    segment: NexusGenRootTypes['PeriodSegment'] | null; // PeriodSegment
    type: NexusGenEnums['PlayerResultType'] | null; // PlayerResultType
  }
  PlayerState: { // field return type
    currentGame: NexusGenRootTypes['Game'] | null; // Game
    playerResult: NexusGenRootTypes['PlayerResult'] | null; // PlayerResult
    previousResults: NexusGenRootTypes['PlayerResult'][] | null; // [PlayerResult!]
    transactions: NexusGenRootTypes['PlayerAction'][] | null; // [PlayerAction!]
  }
  Query: { // field return type
    game: NexusGenRootTypes['Game'] | null; // Game
    games: NexusGenRootTypes['Game'][] | null; // [Game!]
    learningElement: NexusGenRootTypes['LearningElementState'] | null; // LearningElementState
    learningElements: NexusGenRootTypes['LearningElement'][] | null; // [LearningElement!]
    pastResults: NexusGenRootTypes['PlayerResult'][] | null; // [PlayerResult!]
    result: NexusGenRootTypes['PlayerState'] | null; // PlayerState
    results: NexusGenRootTypes['PlayerResult'][] | null; // [PlayerResult!]
    self: NexusGenRootTypes['Player'] | null; // Player
  }
  StoryElement: { // field return type
    content: string | null; // String
    contentRole: NexusGenScalars['JSONObject'] | null; // JSONObject
    id: string; // ID!
    reward: NexusGenScalars['JSONObject'] | null; // JSONObject
    title: string; // String!
    type: NexusGenEnums['StoryElementType']; // StoryElementType!
  }
  Subscription: { // field return type
    eventsGlobal: NexusGenRootTypes['Event'][] | null; // [Event!]
    eventsUser: NexusGenRootTypes['Event'][] | null; // [Event!]
  }
}

export interface NexusGenFieldTypeNames {
  Achievement: { // field return type name
    description: 'String'
    id: 'ID'
    image: 'String'
    name: 'String'
    reward: 'JSONObject'
    when: 'AchievementFrequency'
  }
  AchievementInstance: { // field return type name
    achievement: 'Achievement'
    count: 'Int'
    id: 'Int'
  }
  Event: { // field return type name
    type: 'String'
  }
  Game: { // field return type name
    activePeriod: 'Period'
    activePeriodIx: 'Int'
    activeSegmentIx: 'Int'
    id: 'ID'
    name: 'String'
    periods: 'Period'
    playerCount: 'Int'
    players: 'Player'
    status: 'GameStatus'
  }
  LearningAnswerOption: { // field return type name
    content: 'String'
    correct: 'Boolean'
    id: 'ID'
  }
  LearningElement: { // field return type name
    feedback: 'String'
    id: 'ID'
    motivation: 'String'
    options: 'LearningAnswerOption'
    question: 'String'
    reward: 'JSONObject'
    title: 'String'
  }
  LearningElementAttempt: { // field return type name
    element: 'LearningElement'
    id: 'ID'
    player: 'Player'
    pointsAchieved: 'Int'
    pointsMax: 'Int'
  }
  LearningElementState: { // field return type name
    element: 'LearningElement'
    id: 'ID'
    solution: 'String'
    state: 'String'
  }
  Mutation: { // field return type name
    activateNextPeriod: 'Game'
    activateNextSegment: 'Game'
    addCountdown: 'Boolean'
    addGamePeriod: 'Period'
    addPeriodSegment: 'PeriodSegment'
    attemptLearningElement: 'LearningElementAttempt'
    createGame: 'Game'
    loginAsTeam: 'Player'
    logoutAsTeam: 'Boolean'
    markStoryElement: 'Player'
    performAction: 'PlayerResult'
    saveConsolidationDecision: 'PlayerDecision'
    updatePlayerData: 'Player'
    updateReadyState: 'Player'
  }
  Period: { // field return type name
    actions: 'PlayerAction'
    activeSegment: 'PeriodSegment'
    activeSegmentIx: 'Int'
    facts: 'JSONObject'
    id: 'ID'
    index: 'Int'
    results: 'PlayerResult'
    segmentCount: 'Int'
    segments: 'PeriodSegment'
  }
  PeriodSegment: { // field return type name
    actions: 'PlayerAction'
    countdownDurationMs: 'Int'
    countdownExpiresAt: 'DateTime'
    facts: 'JSONObject'
    id: 'ID'
    index: 'Int'
    learningElements: 'LearningElement'
    periodIx: 'Int'
    results: 'PlayerResult'
    storyElements: 'StoryElement'
  }
  Player: { // field return type name
    achievementIds: 'String'
    achievementKeys: 'String'
    achievements: 'AchievementInstance'
    completedLearningElementIds: 'String'
    completedLearningElements: 'LearningElement'
    experience: 'Int'
    experienceToNext: 'Int'
    facts: 'JSONObject'
    id: 'ID'
    isReady: 'Boolean'
    level: 'PlayerLevel'
    levelIx: 'Int'
    name: 'String'
    number: 'Int'
    role: 'String'
    token: 'String'
    tutorialCompleted: 'Boolean'
    visitedStoryElementIds: 'String'
    visitedStoryElements: 'StoryElement'
  }
  PlayerAction: { // field return type name
    facts: 'JSONObject'
    id: 'ID'
    period: 'Period'
    periodIx: 'Int'
    player: 'Player'
    segment: 'PeriodSegment'
    segmentIx: 'Int'
    type: 'String'
  }
  PlayerDecision: { // field return type name
    facts: 'JSONObject'
    id: 'ID'
    period: 'Period'
    periodIx: 'Int'
    player: 'Player'
    type: 'PlayerDecisionType'
  }
  PlayerLevel: { // field return type name
    description: 'String'
    id: 'ID'
    index: 'Int'
    requiredXP: 'Int'
  }
  PlayerResult: { // field return type name
    facts: 'JSONObject'
    id: 'ID'
    period: 'Period'
    player: 'Player'
    segment: 'PeriodSegment'
    type: 'PlayerResultType'
  }
  PlayerState: { // field return type name
    currentGame: 'Game'
    playerResult: 'PlayerResult'
    previousResults: 'PlayerResult'
    transactions: 'PlayerAction'
  }
  Query: { // field return type name
    game: 'Game'
    games: 'Game'
    learningElement: 'LearningElementState'
    learningElements: 'LearningElement'
    pastResults: 'PlayerResult'
    result: 'PlayerState'
    results: 'PlayerResult'
    self: 'Player'
  }
  StoryElement: { // field return type name
    content: 'String'
    contentRole: 'JSONObject'
    id: 'ID'
    reward: 'JSONObject'
    title: 'String'
    type: 'StoryElementType'
  }
  Subscription: { // field return type name
    eventsGlobal: 'Event'
    eventsUser: 'Event'
  }
}

export interface NexusGenArgTypes {
  Mutation: {
    activateNextPeriod: { // args
      gameId: number; // Int!
    }
    activateNextSegment: { // args
      gameId: number; // Int!
    }
    addCountdown: { // args
      gameId: number; // Int!
      seconds: number; // Int!
    }
    addGamePeriod: { // args
      facts: NexusGenInputs['PeriodFactsInput']; // PeriodFactsInput!
      gameId: number; // Int!
      segmentCount: number; // Int!
    }
    addPeriodSegment: { // args
      facts: NexusGenInputs['PeriodSegmentFactsInput']; // PeriodSegmentFactsInput!
      gameId: number; // Int!
      learningElements?: Array<string | null> | null; // [String]
      periodIx: number; // Int!
      storyElements?: Array<string | null> | null; // [String]
    }
    attemptLearningElement: { // args
      elementId: string; // ID!
      selection: string; // String!
    }
    createGame: { // args
      name: string; // String!
      playerCount: number; // Int!
    }
    loginAsTeam: { // args
      token: string; // String!
    }
    markStoryElement: { // args
      elementId: string; // ID!
    }
    performAction: { // args
      payload: string; // String!
      type: string; // String!
    }
    saveConsolidationDecision: { // args
      payload: string; // String!
    }
    updatePlayerData: { // args
      facts?: string | null; // String
      name?: string | null; // String
    }
    updateReadyState: { // args
      isReady: boolean; // Boolean!
    }
  }
  Query: {
    game: { // args
      id?: number | null; // Int
    }
    learningElement: { // args
      id: string; // ID!
    }
  }
}

export interface NexusGenAbstractTypeMembers {
}

export interface NexusGenTypeInterfaces {
}

export type NexusGenObjectNames = keyof NexusGenObjects;

export type NexusGenInputNames = keyof NexusGenInputs;

export type NexusGenEnumNames = keyof NexusGenEnums;

export type NexusGenInterfaceNames = never;

export type NexusGenScalarNames = keyof NexusGenScalars;

export type NexusGenUnionNames = never;

export type NexusGenObjectsUsingAbstractStrategyIsTypeOf = never;

export type NexusGenAbstractsUsingStrategyResolveType = never;

export type NexusGenFeaturesConfig = {
  abstractTypeStrategies: {
    isTypeOf: false
    resolveType: true
    __typename: false
  }
}

export interface NexusGenTypes {
  context: any;
  inputTypes: NexusGenInputs;
  rootTypes: NexusGenRootTypes;
  inputTypeShapes: NexusGenInputs & NexusGenEnums & NexusGenScalars;
  argTypes: NexusGenArgTypes;
  fieldTypes: NexusGenFieldTypes;
  fieldTypeNames: NexusGenFieldTypeNames;
  allTypes: NexusGenAllTypes;
  typeInterfaces: NexusGenTypeInterfaces;
  objectNames: NexusGenObjectNames;
  inputNames: NexusGenInputNames;
  enumNames: NexusGenEnumNames;
  interfaceNames: NexusGenInterfaceNames;
  scalarNames: NexusGenScalarNames;
  unionNames: NexusGenUnionNames;
  allInputTypes: NexusGenTypes['inputNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['scalarNames'];
  allOutputTypes: NexusGenTypes['objectNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['unionNames'] | NexusGenTypes['interfaceNames'] | NexusGenTypes['scalarNames'];
  allNamedTypes: NexusGenTypes['allInputTypes'] | NexusGenTypes['allOutputTypes']
  abstractTypes: NexusGenTypes['interfaceNames'] | NexusGenTypes['unionNames'];
  abstractTypeMembers: NexusGenAbstractTypeMembers;
  objectsUsingAbstractStrategyIsTypeOf: NexusGenObjectsUsingAbstractStrategyIsTypeOf;
  abstractsUsingStrategyResolveType: NexusGenAbstractsUsingStrategyResolveType;
  features: NexusGenFeaturesConfig;
}


declare global {
  interface NexusGenPluginTypeConfig<TypeName extends string> {
  }
  interface NexusGenPluginInputTypeConfig<TypeName extends string> {
  }
  interface NexusGenPluginFieldConfig<TypeName extends string, FieldName extends string> {
  }
  interface NexusGenPluginInputFieldConfig<TypeName extends string, FieldName extends string> {
  }
  interface NexusGenPluginSchemaConfig {
  }
  interface NexusGenPluginArgConfig {
  }
}