import { OutputFacts } from "@gbl-uzh/platform";

export type Decisions = {
  rate: number;
};

export type HistoryEntry = {
  segmentIx: number;
  rate: number;
  inflation: number;
  unemployment: number;
  growth: number;
  penalty: number;
  cumulativePenalty: number;
  supplyShock: number;
  demandShock: number;
  eventName: string;
};

export type ResultFacts = {
  decisions: Decisions;
  inflation: number;
  unemployment: number;
  growth: number;
  penalty: number;
  cumulativePenalty: number;
  history: HistoryEntry[];
  spilloverInflation?: number;
  spilloverUnemployment?: number;
  spilloverGrowth?: number;
  exchangeRateIndex?: number;
  tradeBalance?: number;
};

export type OutputResultFacts = OutputFacts<ResultFacts, any, any>;
