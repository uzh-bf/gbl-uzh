import * as DB from '@prisma/client'
import { gameMachine } from '../src/machines/gameMachine.js'

/**
 * Emit a Mermaid stateDiagram-v2 of the game lifecycle, generated from the
 * XState machine config so the diagram tracks the running lifecycle model.
 *
 * Usage:  pnpm -F @gbl-uzh/platform lifecycle:diagram
 * then paste the output into any Mermaid renderer (e.g. mermaid.live).
 */
const lines: string[] = ['stateDiagram-v2', '  [*] --> SCHEDULED']

type TransitionConfig =
  | string
  | { target?: string; guard?: unknown }
  | Array<{ target?: string; guard?: unknown }>

type StateConfig = {
  on?: Record<string, TransitionConfig>
}

for (const [from, state] of Object.entries(
  gameMachine.config.states as Record<string, StateConfig>
)) {
  for (const [event, transition] of Object.entries(state.on ?? {})) {
    const transitions = Array.isArray(transition) ? transition : [transition]
    for (const entry of transitions) {
      const target = typeof entry === 'string' ? entry : entry.target
      if (!target) continue
      const guard = typeof entry === 'string' || !entry.guard ? '' : ' (guarded)'
      lines.push(`  ${from} --> ${target}: ${event}${guard}`)
    }
  }
}

lines.push(`  ${DB.GameStatus.COMPLETED} --> [*]`)

console.log(lines.join('\n'))
