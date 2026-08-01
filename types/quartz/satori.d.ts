import type { SatoriOptions } from "satori/wasm";

export type { SatoriOptions };

declare function satori(
  element: unknown,
  options: SatoriOptions,
): Promise<string>;

export default satori;
