import { OutputFactsGame, PayloadGame } from "@gbl-uzh/platform";
import { debugLog } from "@gbl-uzh/platform/dist/lib/util";
import { GameFacts } from "../types/Game";

type OutputGameFacts = OutputFactsGame<GameFacts, any, any>;

export function update(
  facts: GameFacts,
  payload: PayloadGame,
): OutputGameFacts {
  const baseFacts: OutputGameFacts = {
    updatedGameFacts: facts,
  };

  debugLog("GameFactsUpdate", facts, payload, baseFacts);
  return baseFacts;
}
