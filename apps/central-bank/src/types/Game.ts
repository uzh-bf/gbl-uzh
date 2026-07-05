import { inputObjectType } from "nexus";
import * as yup from "yup";

export const GameFactsSchema = yup.object({
  myInt: yup.number().integer().required().default(0),
  actionCounter: yup.number().integer().optional(),
});

export interface GameFacts extends yup.InferType<typeof GameFactsSchema> {}

export const GameFactsInput = inputObjectType({
  name: "GameFactsInput",
  definition(t) {
    t.int("myInt", { default: 0 });
    t.nullable.int("actionCounter", { default: 0 });
    // t.field('scenario', {
    //   type: GameFactsScenarioInput,
    //   default: {
    //     seed: DEFAULT_SEED,
    //     trendStocks: TREND_STOCKS,
    //     trendBonds: TREND_BONDS,
    //     gapStocks: GAP_STOCKS,
    //     gapBonds: GAP_BONDS,
    //     interestBank: INTEREST_BANK,
    //   },
    // })
  },
});
