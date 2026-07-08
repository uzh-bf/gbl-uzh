import {
  OutputFacts,
  PayloadPeriodResult,
  PayloadPeriodResultEnd,
} from "@gbl-uzh/platform";
import { debugLog } from "@gbl-uzh/platform/dist/lib/util";
import { produce } from "immer";
import { PlayerResult } from "src/graphql/generated/ops";
import { PlayerRole } from "../settings/Constants";
import { GameFacts } from "../types/Game";
import { PeriodFacts, PeriodSegmentFacts } from "../types/Period";
import { OutputResultFacts, ResultFacts } from "../types/facts";

type InputPeriodResultFactsInit = {};
type OutputPeriodResultFactsInit = OutputFacts<
  InputPeriodResultFactsInit & ResultFacts,
  any,
  any
>;

export function initialize(
  facts: InputPeriodResultFactsInit,
  payload: PayloadPeriodResult<GameFacts, PeriodFacts, PlayerRole>
): OutputPeriodResultFactsInit {
  const scenario = payload.periodFacts.scenario;
  const baseFacts: OutputPeriodResultFactsInit = {
    resultFacts: {
      ...facts,
      decisions: { rate: 4.0 },
      inflation: scenario.initialInflation,
      unemployment: scenario.initialUnemployment,
      growth: scenario.initialGrowth,
      penalty: 0,
      cumulativePenalty: 0,
      history: [],
    },
  };

  const resultFacts: OutputPeriodResultFactsInit = produce(
    baseFacts,
    (draft: OutputPeriodResultFactsInit) => {}
  );

  debugLog("PeriodResultInitialize", facts, payload, resultFacts);
  return resultFacts;
}

export function start(
  facts: ResultFacts,
  payload: PayloadPeriodResult<GameFacts, PeriodFacts, PlayerRole>
): OutputResultFacts {
  const baseFacts: OutputResultFacts = {
    resultFacts: facts,
  };
  const resultFacts = produce(baseFacts, (draft: OutputResultFacts) => {});

  debugLog("PeriodResultStart", facts, payload, resultFacts);
  return resultFacts;
}

export function end(
  facts: ResultFacts,
  payload: PayloadPeriodResultEnd<
    any[],
    GameFacts,
    PeriodFacts,
    PeriodSegmentFacts,
    PlayerRole
  >
): OutputResultFacts {
  const baseFacts: OutputResultFacts = {
    resultFacts: facts,
    events: [],
  };

  const resultFacts: OutputResultFacts = produce(
    baseFacts,
    (draft: OutputResultFacts) => {
      const ownRate =
        facts.decisions?.rate !== undefined ? facts.decisions.rate : 4.0;
      const periodIx = payload.periodIx;
      const segmentIx = payload.segmentIx;

      // Filter other players' results for the final segment of this period
      const otherFinalResults = (
        payload.otherPlayersSegmentEndResults || []
      ).filter((res: any) => {
        return (
          res.type === "SEGMENT_END" &&
          res.periodIx === periodIx &&
          res.segmentIx === segmentIx
        );
      });

      let averageOtherRate = ownRate;
      if (otherFinalResults.length > 0) {
        const rates = otherFinalResults.map((res: any) => {
          let f = res.facts;
          if (typeof f === "string") {
            try {
              f = JSON.parse(f);
            } catch (e) {
              f = {};
            }
          }
          return f?.decisions?.rate !== undefined ? f.decisions.rate : 4.0;
        });
        averageOtherRate = rates.reduce((sum, r) => sum + r, 0) / rates.length;
      }

      const deltaR = averageOtherRate - ownRate;

      // Spillover coefficients
      const spilloverInflation = parseFloat((0.15 * deltaR).toFixed(2));
      const spilloverUnemployment = parseFloat((-0.1 * deltaR).toFixed(2));
      const spilloverGrowth = parseFloat((-0.08 * deltaR).toFixed(2));

      // Apply spillovers
      let inflation = facts.inflation + spilloverInflation;
      let unemployment = facts.unemployment + spilloverUnemployment;
      let growth = facts.growth + spilloverGrowth;

      // Clamp values
      growth = parseFloat(Math.min(10, Math.max(-10, growth)).toFixed(2));
      inflation = parseFloat(Math.min(20, Math.max(-5, inflation)).toFixed(2));
      unemployment = parseFloat(
        Math.min(20, Math.max(1, unemployment)).toFixed(2)
      );

      // Recalculate loss penalty
      const scenario = payload.periodFacts.scenario;
      let penalty =
        Math.pow(inflation - scenario.targetInflation, 2) +
        scenario.lambda *
          Math.pow(unemployment - scenario.naturalUnemployment, 2);
      penalty = parseFloat(penalty.toFixed(2));

      // Adjust cumulative penalty by difference in last segment's penalty
      const oldPenalty = facts.penalty;
      let cumulativePenalty = facts.cumulativePenalty - oldPenalty + penalty;
      cumulativePenalty = parseFloat(cumulativePenalty.toFixed(2));

      // Update history entries to reflect spillover-adjusted values for this round
      const history = [...(facts.history || [])];
      if (history.length > 0) {
        const lastIdx = history.length - 1;
        history[lastIdx] = {
          ...history[lastIdx],
          inflation,
          unemployment,
          growth,
          penalty,
          cumulativePenalty,
        };
      }

      // Save back to draft
      draft.resultFacts.inflation = inflation;
      draft.resultFacts.unemployment = unemployment;
      draft.resultFacts.growth = growth;
      draft.resultFacts.spilloverInflation = spilloverInflation;
      draft.resultFacts.spilloverUnemployment = spilloverUnemployment;
      draft.resultFacts.spilloverGrowth = spilloverGrowth;
      draft.resultFacts.penalty = penalty;
      draft.resultFacts.cumulativePenalty = cumulativePenalty;
      draft.resultFacts.history = history;
    }
  );

  debugLog("PeriodResultEnd", facts, payload, resultFacts);
  return resultFacts;
}
