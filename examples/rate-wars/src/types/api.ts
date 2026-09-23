import type { RouterOutputs } from '~/server/trpc/router'

export type PlayerResult = NonNullable<RouterOutputs['play']['result']>
export type SelfPlayer = NonNullable<RouterOutputs['play']['self']>
export type GameDetail = NonNullable<RouterOutputs['game']['byId']>

type ActiveSegment = NonNullable<
  NonNullable<PlayerResult['currentGame']['activePeriod']>['activeSegment']
>

export type LearningElementRef = NonNullable<
  ActiveSegment['learningElements']
>[number]

export type StoryElementRef = NonNullable<
  ActiveSegment['storyElements']
>[number]
