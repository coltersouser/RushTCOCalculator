import type { Inputs } from "../types/schema";
export type ValidationIssue = { key: string; message: string };

export function validateInputs(inputs: Inputs): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const tou = Boolean(inputs["utility.isTouSchedule"]);
  if (tou) {
    const keys = [
      "chargingSplit.summerOnPeakPct",
      "chargingSplit.summerMidPeakPct",
      "chargingSplit.summerOffPeakPct",
      "chargingSplit.winterMidPeakPct",
      "chargingSplit.winterOffPeakPct",
      "chargingSplit.winterSuperOffPeakPct"
    ];
    const sum = keys.reduce((acc, k) => acc + (Number(inputs[k] ?? 0) || 0), 0);
    if (Math.abs(sum - 1) > 0.001) {
      issues.push({
        key: "chargingSplit.summerOnPeakPct",
        message: `Charging split must sum to 100% (currently ${(sum * 100).toFixed(1)}%).`
      });
    }
  }
  return issues;
}
