import type { Inputs } from "../types/schema";

export type ValidationIssue = { key: string; message: string };

function num(inputs: Inputs, key: string): number {
  const raw = inputs[key];
  return typeof raw === "number" && Number.isFinite(raw) ? raw : 0;
}

function bool(inputs: Inputs, key: string): boolean {
  return Boolean(inputs[key]);
}

export function validateInputs(inputs: Inputs): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const requireNonNegative = (key: string, label: string) => {
    if (num(inputs, key) < 0) {
      issues.push({ key, message: `${label} cannot be negative.` });
    }
  };

  const requirePct01 = (key: string, label: string) => {
    const value = num(inputs, key);
    if (value < 0 || value > 1) {
      issues.push({ key, message: `${label} must be between 0% and 100%.` });
    }
  };

  const warnIfPositiveWhileToggleOff = (
    valueKey: string,
    label: string,
    toggleKey: string,
    toggleLabel: string,
  ) => {
    if (num(inputs, valueKey) > 0 && !bool(inputs, toggleKey)) {
      issues.push({
        key: valueKey,
        message: `${label} is above $0, but ${toggleLabel} is turned off.`,
      });
    }
  };

  const tou = bool(inputs, "utility.isTouSchedule");
  if (tou) {
    const keys = [
      "chargingSplit.summerOnPeakPct",
      "chargingSplit.summerMidPeakPct",
      "chargingSplit.summerOffPeakPct",
      "chargingSplit.winterMidPeakPct",
      "chargingSplit.winterOffPeakPct",
      "chargingSplit.winterSuperOffPeakPct",
    ];

    for (const key of keys) {
      requirePct01(key, key);
    }

    const sum = keys.reduce((acc, key) => acc + num(inputs, key), 0);
    if (Math.abs(sum - 1) > 0.001) {
      issues.push({
        key: "chargingSplit.summerOnPeakPct",
        message: `Charging split must sum to 100% (currently ${(sum * 100).toFixed(1)}%).`,
      });
    }
  }

  requireNonNegative("general.vehicleCount", "Vehicle count");
  requireNonNegative("general.milesPerDayPerTruck", "Miles per day per truck");
  requireNonNegative("general.workDaysPerYear", "Work days per year");
  requireNonNegative("general.depreciationYears", "Vehicle lifespan");
  requireNonNegative("general.portTripsPerDay", "Port trips per day");

  requireNonNegative("diesel.truckCost", "Diesel truck cost");
  requireNonNegative("cng.truckCost", "CNG truck cost");
  requireNonNegative("ev.vehicleCost", "EV truck cost");

  requireNonNegative("diesel.financingRateApr", "Diesel APR");
  requireNonNegative("cng.financingRateApr", "CNG APR");
  requireNonNegative("ev.financingRateApr", "EV APR");
  requireNonNegative("evInfra.financingRateApr", "Infrastructure APR");
  requireNonNegative("cngStation.financingRateApr", "CNG station APR");
  requireNonNegative("financial.inflationRate", "Inflation rate");

  requirePct01("diesel.downPaymentPct", "Diesel down payment");
  requirePct01("cng.downPaymentPct", "CNG down payment");
  requirePct01("ev.downPaymentPct", "EV down payment");
  requirePct01("evInfra.downPaymentPct", "Infrastructure down payment");
  requirePct01("cngStation.downPaymentPct", "CNG station down payment");

  if (num(inputs, "diesel.truckCost") <= 0) {
    issues.push({
      key: "diesel.truckCost",
      message: "Diesel truck cost must be greater than $0.",
    });
  }

  if (num(inputs, "ev.vehicleCost") <= 0) {
    issues.push({
      key: "ev.vehicleCost",
      message: "EV truck cost must be greater than $0.",
    });
  }

  if (num(inputs, "cng.truckCost") <= 0) {
    issues.push({
      key: "cng.truckCost",
      message: "CNG truck cost must be greater than $0.",
    });
  }

  if (bool(inputs, "cngStation.installingStation") && num(inputs, "cngStation.installationCost") <= 0) {
    issues.push({
      key: "cngStation.installationCost",
      message: "CNG station installation cost must be greater than $0 when station install is turned on.",
    });
  }

  if (num(inputs, "evInfra.chargerQuantity") > 0 && num(inputs, "evInfra.chargerCost") <= 0) {
    issues.push({
      key: "evInfra.chargerCost",
      message: "EV charger cost must be greater than $0 when charger quantity is above 0.",
    });
  }

  if (num(inputs, "evInfra.chargerCost") > 0 && num(inputs, "evInfra.chargerQuantity") <= 0) {
    issues.push({
      key: "evInfra.chargerQuantity",
      message: "Charger quantity should be greater than 0 when charger cost is entered.",
    });
  }

  warnIfPositiveWhileToggleOff(
    "diesel.grantValue",
    "Diesel grant value",
    "grant.used",
    "the grant toggle",
  );
  warnIfPositiveWhileToggleOff(
    "cng.grantValue",
    "CNG grant value",
    "grant.used",
    "the grant toggle",
  );
  warnIfPositiveWhileToggleOff(
    "ev.grantValue",
    "EV grant value",
    "grant.used",
    "the grant toggle",
  );

  warnIfPositiveWhileToggleOff(
    "diesel.scrapValue",
    "Diesel scrap value",
    "scrap.required",
    "the scrap toggle",
  );
  warnIfPositiveWhileToggleOff(
    "cng.scrapValue",
    "CNG scrap value",
    "scrap.required",
    "the scrap toggle",
  );
  warnIfPositiveWhileToggleOff(
    "ev.scrapValue",
    "EV scrap value",
    "scrap.required",
    "the scrap toggle",
  );

  if (num(inputs, "evInfra.chargerFunding") > 0 && !bool(inputs, "grant.used")) {
    issues.push({
      key: "evInfra.chargerFunding",
      message: "EV infrastructure grant funding is above $0, but the grant toggle is turned off.",
    });
  }

  return issues;
}
