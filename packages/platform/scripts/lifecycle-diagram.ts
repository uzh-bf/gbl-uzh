import * as DB from '@prisma/client'
import { GAME_TRANSITIONS } from '../src/services/GameTransitions.js'

/**
 * Emit a Mermaid stateDiagram-v2 of the game lifecycle, generated from the
 * GAME_TRANSITIONS table — the single source of truth, so the diagram can never
 * drift from the running code. This replaces the old XState/Stately model as the
 * way to visualize the lifecycle.
 *
 * Usage:  pnpm -F @gbl-uzh/platform lifecycle:diagram
 * then paste the output into any Mermaid renderer (e.g. mermaid.live).
 */
const lines: string[] = ['stateDiagram-v2', '  [*] --> SCHEDULED']

for (const [from, byEvent] of Object.entries(GAME_TRANSITIONS)) {
  for (const [event, transition] of Object.entries(byEvent)) {
    if (!transition) continue
    const guard = transition.guard ? ' (guarded)' : ''
    lines.push(`  ${from} --> ${transition.to}: ${event}${guard}`)
  }
}

lines.push(`  ${DB.GameStatus.COMPLETED} --> [*]`)

console.log(lines.join('\n'))
