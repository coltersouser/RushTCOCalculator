import { inputSchema } from "../schema/inputs.schema";
import type { Inputs } from "../types/schema";

export function buildDefaultInputs(): Inputs {
  const inputs: Inputs = {};
  for (const f of inputSchema.fields) inputs[f.key] = f.default ?? null;
  return inputs;
}
