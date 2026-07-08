import { OutputFacts, PayloadSegment } from "@gbl-uzh/platform";
import { debugLog, diceRoll } from "@gbl-uzh/platform/dist/lib/util";
import { produce } from "immer";
import { GameFacts } from "../types/Game";
import { PeriodFacts, PeriodSegmentFacts } from "../types/Period";

type InputSegmentFacts = {};
type OutputSegmentFacts = OutputFacts<
  InputSegmentFacts & PeriodSegmentFacts,
  any,
  any
>;

export function initialize(
  facts: InputSegmentFacts,
  payload: PayloadSegment<GameFacts, PeriodFacts, PeriodSegmentFacts>
): OutputSegmentFacts {
  const baseFacts: OutputSegmentFacts = {
    resultFacts: {
      ...facts,
      shock: 0,
      roll: 0,
      supplyShock: 0,
      demandShock: 0,
      eventName: "Calm markets",
    },
  };

  const resultFacts: OutputSegmentFacts = produce(
    baseFacts,
    (draft: OutputSegmentFacts) => {
      const periodFacts = payload.periodFacts;
      const segmentIx = payload.segmentIx;
      const seed = periodFacts.scenario.seed;

      // Deterministic dice roll from 1 to 6
      const roll = diceRoll([seed, segmentIx, 0]);

      const events = [
        { name: "Oil price spike", supplyShock: 0.8, demandShock: -0.4 },
        {
          name: "Supply chain disruption",
          supplyShock: 0.4,
          demandShock: -0.2,
        },
        { name: "Calm markets", supplyShock: 0.1, demandShock: 0.0 },
        { name: "Tech productivity boom", supplyShock: -0.2, demandShock: 0.3 },
        {
          name: "Consumer confidence surge",
          supplyShock: 0.0,
          demandShock: 0.5,
        },
        {
          name: "Global stimulus package",
          supplyShock: -0.3,
          demandShock: 0.8,
        },
      ];

      const event = events[roll - 1] || events[2]; // fallback to calm markets

      draft.resultFacts.roll = roll;
      draft.resultFacts.supplyShock = event.supplyShock;
      draft.resultFacts.demandShock = event.demandShock;
      draft.resultFacts.eventName = event.name;
      draft.resultFacts.shock = parseFloat(
        (event.supplyShock + event.demandShock).toFixed(2)
      );
    }
  );

  debugLog("SegmentInitialize", facts, payload, resultFacts);
  return resultFacts;
}
