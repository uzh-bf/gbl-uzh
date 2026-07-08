import { OutputFacts, PayloadSegmentResult } from "@gbl-uzh/platform";
import { debugLog } from "@gbl-uzh/platform/dist/lib/util";
import { produce } from "immer";
import { DEFAULT_RATE, NEUTRAL_RATE, PlayerRole } from "../settings/Constants";
import { GameFacts } from "../types/Game";
import type { PeriodFacts, PeriodSegmentFacts } from "../types/Period";
import { OutputResultFacts, ResultFacts } from "../types/facts";

type SegmentResultFactsInit = ResultFacts;

type OutputSegmentResultFactsInit = OutputFacts<
  SegmentResultFactsInit,
  any,
  any
>;

export function initialize(
  facts: SegmentResultFactsInit,
  payload: PayloadSegmentResult<
    GameFacts,
    PeriodFacts,
    PeriodSegmentFacts,
    PlayerRole
  >
): OutputSegmentResultFactsInit {
  const basefacts: OutputSegmentResultFactsInit = {
    resultFacts: facts,
  };

  const resultFacts: OutputSegmentResultFactsInit = produce(
    basefacts,
    (draft: OutputSegmentResultFactsInit) => {}
  );

  debugLog("SegmentResultInitialize", facts, payload, resultFacts);
  return resultFacts;
}

export function start(
  facts: ResultFacts,
  payload: PayloadSegmentResult<
    GameFacts,
    PeriodFacts,
    PeriodSegmentFacts,
    PlayerRole
  >
): OutputResultFacts {
  const basefacts: OutputResultFacts = {
    resultFacts: facts,
  };

  const resultFacts: OutputResultFacts = produce(
    basefacts,
    (draft: OutputResultFacts) => {}
  );

  debugLog("SegmentResultStart", facts, payload, resultFacts);
  return resultFacts;
}

export function end(
  facts: ResultFacts,
  payload: PayloadSegmentResult<
    GameFacts,
    PeriodFacts,
    PeriodSegmentFacts,
    PlayerRole
  >
): OutputResultFacts {
  const basefacts: OutputResultFacts = {
    resultFacts: facts,
  };

  const resultFacts: OutputResultFacts = produce(
    basefacts,
    (draft: OutputResultFacts) => {
      const segmentFacts = payload.segmentFacts;
      const scenario = payload.periodFacts.scenario;
      const segmentIx = payload.segmentIx;

      // Fetch the interest rate decision set by the player (defaulting to DEFAULT_RATE if not set)
      const R =
        facts.decisions?.rate !== undefined
          ? facts.decisions.rate
          : DEFAULT_RATE;

      const supplyShock =
        segmentFacts.supplyShock !== undefined ? segmentFacts.supplyShock : 0.0;
      const demandShock =
        segmentFacts.demandShock !== undefined ? segmentFacts.demandShock : 0.0;
      const eventName = segmentFacts.eventName || "Calm markets";

      // Economic model formulas using separate supply and demand shocks
      let growth = 3.0 - 0.5 * (R - NEUTRAL_RATE) + demandShock;
      let inflation = facts.inflation - 0.4 * (R - NEUTRAL_RATE) + supplyShock;
      let unemployment =
        facts.unemployment + 0.3 * (R - NEUTRAL_RATE) - 0.2 * demandShock;

      // Clamping values to keep them in realistic boundaries
      growth = parseFloat(Math.min(10, Math.max(-10, growth)).toFixed(2));
      inflation = parseFloat(Math.min(20, Math.max(-5, inflation)).toFixed(2));
      unemployment = parseFloat(
        Math.min(20, Math.max(1, unemployment)).toFixed(2)
      );

      // Loss / penalty calculation
      let penalty =
        Math.pow(inflation - scenario.targetInflation, 2) +
        scenario.lambda *
          Math.pow(unemployment - scenario.naturalUnemployment, 2);
      penalty = parseFloat(penalty.toFixed(2));

      let cumulativePenalty = facts.cumulativePenalty + penalty;
      cumulativePenalty = parseFloat(cumulativePenalty.toFixed(2));

      // Create history entry with event name and shocks
      const historyEntry = {
        segmentIx,
        rate: R,
        inflation,
        unemployment,
        growth,
        penalty,
        cumulativePenalty,
        supplyShock,
        demandShock,
        eventName,
      };

      draft.resultFacts.growth = growth;
      draft.resultFacts.inflation = inflation;
      draft.resultFacts.unemployment = unemployment;
      draft.resultFacts.penalty = penalty;
      draft.resultFacts.cumulativePenalty = cumulativePenalty;
      draft.resultFacts.history = [...(facts.history || []), historyEntry];
    }
  );

  debugLog("SegmentResultEnd", facts, payload, resultFacts);
  return resultFacts;
}
