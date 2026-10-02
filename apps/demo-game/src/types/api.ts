// Central aliases for tRPC response shapes. Derive UI types from the router
// output via `RouterOutputs` instead of hand-declaring mirrors in components —
// these can never drift from the server, and are erased at build (`import type`).
import type { RouterOutputs } from '../server/trpc/router'

/** Player-facing result payload from `play.result`. */
export type PlayerResult = NonNullable<RouterOutputs['play']['result']>

/** The signed-in player from `play.self`. */
export type SelfPlayer = NonNullable<RouterOutputs['play']['self']>

/** Admin game-detail payload from `game.byId`. */
export type GameDetail = NonNullable<RouterOutputs['game']['byId']>

type ActiveSegment = NonNullable<
  NonNullable<PlayerResult['currentGame']['activePeriod']>['activeSegment']
>

/** `{ id, title }` learning-element ref carried on an active segment. */
export type LearningElementRef = NonNullable<
  ActiveSegment['learningElements']
>[number]

/** Story element carried on an active segment (content + role variants). */
export type StoryElementRef = NonNullable<
  ActiveSegment['storyElements']
>[number]

/**
 * `PlayerResult` augmented with the signed-in player's learning/story progress.
 * `play.result` does not carry it; the cockpit merges it in from `play.self`
 * before handing the result to the learning/story components.
 */
export type PlayerResultWithProgress = PlayerResult & {
  playerResult?:
    | (NonNullable<PlayerResult['playerResult']> & {
        player?: {
          completedLearningElementIds?: string[]
          visitedStoryElementIds?: string[]
        }
      })
    | null
}

/**
 * What the player screens render: the signed-in player plus the game result.
 * The cockpit loads both queries and hands this to the layout and its panels.
 */
export type GameData = {
  self: SelfPlayer
  result: PlayerResult
}

/** One segment's dice from `market.dice`, for the admin reveal workspace. */
export type MarketDice = NonNullable<RouterOutputs['market']['dice']>

/** A learning element with its questions from `learning.byId`. */
export type LearningElementDetail = NonNullable<
  RouterOutputs['learning']['byId']
>

/** One row from `results.specific`, used by the admin reports. */
export type SpecificResult = RouterOutputs['results']['specific'][number]
