// Fresh calc.ts (cashflow-based, depreciation-limited charts, LCFS)
// - Year 0 capex (down payment + infra capex net grants)
// - Years 1..N operating + loan payments
// - Residual proceeds in final depreciation year
// - Series ends at min(horizonYears, depreciationYears)
// - Cumulative series is a true running-sum
// - LCFS uses grid CI table (year-based) and your existing input keys
// - WAIRE supports: override toggle + “actual calc” toggle (falls back to best-available keys)

import type { Inputs } from "../types/schema";

export type Powertrain = "diesel" | "cng" | "ev";

export type CalcSummary = {
  startYear: number;
  horizonYears: number;
  annualMilesPerTruck: number;
  fleetMilesPerYear: number;

  costPerMile: Record<Powertrain, number>;
  costPerYear: Record<Powertrain, number>;

  fiveYearTco: Record<Powertrain, number>;
  fiveYearSavingsVsDiesel: { ev: number; cng: number };
  paybackYears: { ev: number | null; cng: number | null };

  year0Breakdown: Record<Powertrain, { label: string; value: number }[]>; // <-- ADD THIS

  series: {
    years: number[];
    cumulativeCost: Record<Powertrain, number[]>;
    annualCost: Record<Powertrain, number[]>;
    cashflow: Record<Powertrain, number[]>;
  };
};

// ----------------- tiny helpers -----------------
function n(inputs: Inputs, key: string, fallback = 0): number {
  const v = (inputs as any)[key];
  const num = typeof v === "number" ? v : Number(v);
  return Number.isFinite(num) ? num : fallback;
}
function addReplacementAssetSchedule(params: {
  cashflow: number[];          // the array we add costs to
  years: number[];             // [0..N]
  analysisYears: number;       // depYears
  assetLifeYears: number;      // chargerLifeYears or infraLifeYears
  baseCostYear0: number;       // total cost at year 0 (already includes qty)
  costEscalationRate: number;  // optional, 0 if you want
}) {
  const { cashflow, years, analysisYears, assetLifeYears, baseCostYear0, costEscalationRate } = params;

  const life = Math.max(1, Math.round(assetLifeYears));
  const esc = Number.isFinite(costEscalationRate) ? costEscalationRate : 0;

  // track purchases so we can compute residual of the last purchase
  let lastPurchaseYear = 0;
  let lastPurchaseCost = 0;

  for (let y = 0; y < years.length; y++) {
    // purchases happen at 0, life, 2*life, ... while < analysisYears
    if (y % life === 0 && y < analysisYears) {
      const costAtY = baseCostYear0 * Math.pow(1 + esc, y);
      cashflow[y] = (cashflow[y] ?? 0) + costAtY; // cost is positive outflow
      lastPurchaseYear = y;
      lastPurchaseCost = costAtY;
    }
  }

  // Residual at end of analysis (analysisYears)
  // Remaining life of the LAST purchased asset at year analysisYears
  const ageAtEnd = analysisYears - lastPurchaseYear;
  const remaining = life - ageAtEnd;

  if (remaining > 0 && analysisYears < years.length) {
    const residual = lastPurchaseCost * (remaining / life);
    cashflow[analysisYears] = (cashflow[analysisYears] ?? 0) - residual; // proceeds reduce cost
  }
}
function b(inputs: Inputs, key: string, fallback = false): boolean {
  const v = (inputs as any)[key];
  return typeof v === "boolean" ? v : Boolean(v ?? fallback);
}
function clampInt(x: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(x)));
}
function inflationFactor(inflationRate: number, yearIndex: number): number {
  // Year 1 is “base year” for op-ex inflation in this model
  return Math.pow(1 + inflationRate, Math.max(0, yearIndex - 1));
}
function pmtMonthly(rate: number, nper: number, pv: number, fv = 0, type: 0 | 1 = 0): number {
  if (nper <= 0) return 0;
  if (Math.abs(rate) < 1e-10) return (pv + fv) / nper;
  const r = rate;
  const pow = Math.pow(1 + r, nper);
  let pmt = (r * (pv * pow + fv)) / (pow - 1);
  if (type === 1) pmt = pmt / (1 + r);
  return pmt;
}
function horizonYears(inputs: Inputs): number {
  return clampInt(n(inputs, "general.horizonYears", 10), 1, 30);
}
function normalize3(a: number, b: number, c: number) {
  const aa = Math.max(0, a);
  const bb = Math.max(0, b);
  const cc = Math.max(0, c);
  const sum = aa + bb + cc;
  if (sum <= 1e-9) return { a: 1 / 3, b: 1 / 3, c: 1 / 3 };
  return { a: aa / sum, b: bb / sum, c: cc / sum };
}

// ----------------- Grid CI + LCFS -----------------
const GRID_CI_BY_YEAR: Record<number, number> = {
  2022: 90.41,
  2023: 89.15,
  2024: 87.89,
  2025: 81.7,
  2026: 80.17,
  2027: 78.63,
  2028: 77.1,
  2029: 75.57,
  2030: 74.03,
  2031: 69.27,
  2032: 64.51,
  2033: 59.75,
  2034: 54.99,
  2035: 50.23,
  2036: 45.47,
  2037: 40.71,
  2038: 35.95,
  2039: 31.19,
  2040: 26.44,
  2041: 23.26,
  2042: 20.09,
  2043: 16.92,
  2044: 13.74,
  2045: 10.57,
};

function gridCiForYear(year: number): number {
  const years = Object.keys(GRID_CI_BY_YEAR).map(Number).sort((a, b) => a - b);
  if (years.length === 0) return 0;
  if (year <= years[0]) return GRID_CI_BY_YEAR[years[0]]!;
  if (year >= years[years.length - 1]) return GRID_CI_BY_YEAR[years[years.length - 1]]!;
  for (let i = years.length - 1; i >= 0; i--) {
    if (year >= years[i]) return GRID_CI_BY_YEAR[years[i]]!;
  }
  return GRID_CI_BY_YEAR[years[0]]!;
}

function evLcfsCreditPerYear(inputs: Inputs, calendarYear: number, kwhFleetPerYear: number): number {
  if (!b(inputs, "general.lcfsApplicable", true)) return 0;

  const share = n(inputs, "evInfra.lcfsCreditShare", 0.8);
  const creditValue = n(inputs, "general.lcfsCreditValuePerUnit", 80);
  const electricityCI = n(inputs, "general.electricityCarbonIntensity", 0);
  const gridCI = gridCiForYear(calendarYear);

  // Credit units formula (as used in your earlier builds)
  const credits = (gridCI - electricityCI) * 5 * 3.6 * kwhFleetPerYear * 0.000001;

  // Return NEGATIVE dollars to reduce cost
  return -credits * creditValue * share;
}

function cngLcfsCreditPerYear(inputs: Inputs, calendarYear: number, thermsPerYearFleet: number): number {
  if (!b(inputs, "general.lcfsApplicable", true)) return 0;

  const share = n(inputs, "cng.lcfsCreditShare", 0);
  const creditValue = n(inputs, "general.lcfsCreditValuePerUnit", 80);
  const ngCI = n(inputs, "general.ngCarbonIntensity", 43);
  const gridCI = gridCiForYear(calendarYear);

  const credits = (gridCI - ngCI) * 0.9 * 105.5 * thermsPerYearFleet * 0.000001;

  return -creditValue * share * credits;
}

// ----------------- Utility rate logic (matches your schema keys) -----------------
function blendedElectricityRate(inputs: Inputs, yearIndex: number): number {
  const f = inflationFactor(n(inputs, "financial.inflationRate", 0.03), yearIndex);
  const isTou = b(inputs, "utility.isTouSchedule", true);

  if (!isTou) {
    return n(inputs, "utility.flatRateKwh", 0.18) * f;
  }

  // Existing tariff rates (inflate here)
  const sOn = n(inputs, "utility.rateSummerOnPeak", 0.08) * f;
  const sMid = n(inputs, "utility.rateSummerMidPeak", 0.12) * f;
  const sOff = n(inputs, "utility.rateSummerOffPeak", 0.14926) * f;

  const wMid = n(inputs, "utility.rateWinterMidPeak", 0.11) * f;
  const wOff = n(inputs, "utility.rateWinterOffPeak", 0.10) * f;
  const wSuper = n(inputs, "utility.rateWinterSuperOffPeak", 0.09709) * f;

  // Bucket the tariff into 3 “charge windows”
  const superOffRate = wSuper; // assume super-off aligns best to overnight charging
  const offRate = (sOff + wOff) / 2;
  const midOnRate = (sOn + sMid + wMid) / 3;

  // Charging distribution (%). User can enter as 0–100 or 0–1; we’ll support both.
  const rawSuper = n(inputs, "ev.pctChargeSuperOffPeak", 70);
  const rawOff = n(inputs, "ev.pctChargeOffPeak", 25);
  const rawMidOn = n(inputs, "ev.pctChargeMidOnPeak", 5);

  // If they entered 0–1 fractions, convert to 0–100-ish for normalization
  const scale = rawSuper <= 1 && rawOff <= 1 && rawMidOn <= 1 ? 100 : 1;

  const { a: pSuper, b: pOff, c: pMidOn } = normalize3(rawSuper * scale, rawOff * scale, rawMidOn * scale);

  return superOffRate * pSuper + offRate * pOff + midOnRate * pMidOn;
}

function demandChargeEffectiveRate(inputs: Inputs, yearIndex: number): number {
  const f = inflationFactor(n(inputs, "financial.inflationRate", 0.03), yearIndex);
  const base = n(inputs, "utility.demandChargeRate", 0) * f;

  const usePhaseIn = b(inputs, "utility.scePhasedDemandCharge", true);
  if (!usePhaseIn) return base;

  // ramp: Year 1 partial, then full by Year 5
  const multipliers = [0, 0.33, 0.5, 0.67, 0.83, 1, 1, 1, 1, 1, 1];
  const m = multipliers[Math.min(yearIndex, multipliers.length - 1)] ?? 1;
  return base * m;
}



// ----------------- main calculate -----------------
export function calculate(inputs: Inputs): CalcSummary {
  const horizon = horizonYears(inputs);
  const startYear = Math.round(n(inputs, "general.modelStartYear", 2026));

  const milesPerDay = n(inputs, "general.milesPerDayPerTruck", 300);
  const workDays = n(inputs, "general.workDaysPerYear", 280);
  const trucks = n(inputs, "general.vehicleCount", 1);
  const infl = n(inputs, "financial.inflationRate", 0.03);

  const annualMilesPerTruck = milesPerDay * workDays;
  const fleetMilesPerYear = annualMilesPerTruck * trucks;

  // limit series to depreciation years (or horizon if smaller)
  const depYears = Math.max(1, n(inputs, "general.depreciationYears", 7));
  const seriesYears = Math.min(horizon, depYears);
  const years = Array.from({ length: seriesYears + 1 }, (_, i) => i); // 0..seriesYears

  function annualLoanPayment(annualApr: number, termYears: number, principal: number, yearIndex: number): number {
    const t = clampInt(termYears, 0, 60);
    if (t <= 0) return 0;
    if (yearIndex < 1 || yearIndex > t) return 0;
    const m = pmtMonthly(annualApr / 12, t * 12, principal, 0, 0);
    return m * 12;
  }

  type CapexPlan = {
  year0Outflow: number;        // positive cost (down + scrap)
  grantYear0: number;          // negative (inflow)
  financedPrincipal: number;
  annualApr: number;
  termYears: number;
  residualInFinalYear: number; // positive proceeds (we subtract later)
};

  function vehicleCapexPlan(prefix: "diesel" | "cng" | "ev"): CapexPlan {
  const costKey = prefix === "ev" ? "ev.vehicleCost" : `${prefix}.truckCost`;
  const grantKey = `${prefix}.grantValue`;
  const scrapKey = `${prefix}.scrapValue`;
  const residualKey = `${prefix}.residualValue`;

  const downPct = n(inputs, `${prefix}.downPaymentPct`, 0.2);
  const apr = n(inputs, `${prefix}.financingRateApr`, 0.05);
  const term = n(inputs, `${prefix}.financingTermYears`, 6);

  const grossCost = Math.max(0, n(inputs, costKey, 0));
  const grant = Math.max(0, n(inputs, grantKey, 0));
  const scrap = Math.max(0, n(inputs, scrapKey, 0));
  const residual = Math.max(0, n(inputs, residualKey, 0));

  // Grant is an explicit Year 0 inflow (negative cashflow)
  const grantYear0 = -grant;
  const netCostForFinance = grossCost; // <-- do NOT subtract grant here

  const down = netCostForFinance * downPct;
  const financed = Math.max(0, netCostForFinance - down);

  return {
    year0Outflow: down + scrap,
    grantYear0,
    financedPrincipal: financed,
    annualApr: apr,
    termYears: term,
    residualInFinalYear: residual,
  };
}


  function cngStationYear0Outflow(yearIndex: number): number {
    if (!b(inputs, "cngStation.installingStation", true)) return 0;
    return yearIndex === 0 ? Math.max(0, n(inputs, "cngStation.installationCost", 0)) : 0;
  }

  function cleanTruckFeePerTruckPerYear(): number {
    const isDrayage = b(inputs, "general.isDrayageTruck", false);
    if (!isDrayage) return 0;
    const fee = n(inputs, "diesel.cleanTruckPortFee", 20);
    const tripsPerDay = n(inputs, "general.portTripsPerDay", 2);
    const wd = n(inputs, "general.workDaysPerYear", 280);
    return fee * tripsPerDay * wd;
  }

  // ---- Operating costs ----
  function dieselOperatingCostYear(yearIndex: number): number {
    const f = inflationFactor(infl, yearIndex);
    const mpg = Math.max(0.001, n(inputs, "diesel.mpg", 8));

    const dieselFuel = (n(inputs, "diesel.pricePerGallon", 4.97) / mpg) * f;
    const defCost = (n(inputs, "diesel.defPrice", 4.5) / mpg) * n(inputs, "diesel.defDosingPct", 0.04) * f;
    const maint = n(inputs, "diesel.maintenanceCostPerMile", 0.25) * f;

    const cleanFeePerMile = cleanTruckFeePerTruckPerYear() / Math.max(1, annualMilesPerTruck);

    return (dieselFuel + defCost + maint + cleanFeePerMile) * fleetMilesPerYear;
  }

  const thermsPerYearFleet =
    (1.295 * (annualMilesPerTruck / Math.max(0.001, n(inputs, "cng.mpg", 6.8)))) * trucks;

  function cngOperatingCostYear(yearIndex: number, calendarYear: number): number {
    const f = inflationFactor(infl, yearIndex);
    const mpg = Math.max(0.001, n(inputs, "cng.mpg", 6.8));

    const fuel = (n(inputs, "cng.fuelPricePerGge", 3.5) / mpg) * f;
    const maint = n(inputs, "cng.maintenanceCostPerMile", 0.25) * f;
    const cleanFeePerMile = cleanTruckFeePerTruckPerYear() / Math.max(1, annualMilesPerTruck);

    const stationMaintPerYear = b(inputs, "cngStation.installingStation", true)
      ? n(inputs, "cngStation.yearlyMaintenanceCost", 0) * f
      : 0;

    const lcfs = cngLcfsCreditPerYear(inputs, calendarYear, thermsPerYearFleet);

    const perMile = fuel + maint + cleanFeePerMile + (stationMaintPerYear + lcfs) / Math.max(1, fleetMilesPerYear);
    return perMile * fleetMilesPerYear;
  }

  function evMaintenancePerMile(yearIndex: number): number {
    const f = inflationFactor(infl, yearIndex);
    if (b(inputs, "ev.overrideMaintenance", false)) return n(inputs, "ev.maintenanceCostPerMileBase", 0.18) * f;

    // fallback heuristic vs diesel/cng
    const dm = n(inputs, "diesel.maintenanceCostPerMile", 0.25) * f;
    const cm = n(inputs, "cng.maintenanceCostPerMile", 0.25) * f;
    return Math.max(dm, cm) * 0.6;
  }

    function evOperatingCostYear(yearIndex: number, calendarYear: number): number {
    const kwhPerMile = n(inputs, "ev.kwhPerMile", 2);

    // Annual energy
    const kwhPerTruckPerYear = annualMilesPerTruck * kwhPerMile;
    const kwhFleetPerYear = kwhPerTruckPerYear * trucks;

    // Electricity rate ($/kWh)
    const elecRate = blendedElectricityRate(inputs, yearIndex);

    // Energy cost ($/year)
    const electricityCostPerYear = kwhFleetPerYear * elecRate;

    // Demand charge ($/year) based on peak kW needed
    const dailyFleetKWh = kwhFleetPerYear / Math.max(1, workDays);
    const hoursAvail = Math.max(0.1, n(inputs, "ev.hoursAvailableForCharging", 12));
    const simultaneousFactor = n(inputs, "ev.simultaneousChargingFactor", 0.6);

const peakDemandKw =
  (dailyFleetKWh / hoursAvail) * simultaneousFactor;
    const demandPerYear = peakDemandKw * demandChargeEffectiveRate(inputs, yearIndex) * 12;

    // Fixed charges
    const customerChargePerYear = n(inputs, "utility.customerCharge", 0) * 12;
    const cmsPerYear =
    n(inputs, "evInfra.cmsCostPerChargerPerYear", 0) *
    n(inputs, "evInfra.chargerQuantity", 0);

  // Credits (negative numbers reduce cost)
  const lcfs = evLcfsCreditPerYear(inputs, calendarYear, kwhFleetPerYear);

  // Convert everything to per-mile, then add maintenance
  const perMile =
    electricityCostPerYear / Math.max(1, fleetMilesPerYear) +
    (demandPerYear + customerChargePerYear + cmsPerYear + lcfs) / Math.max(1, fleetMilesPerYear) +
    evMaintenancePerMile(yearIndex);

    return perMile * fleetMilesPerYear;
  }

  // ---- Build cashflow arrays (costs positive, proceeds negative) ----
  const cashflow: Record<Powertrain, number[]> = { diesel: [], cng: [], ev: [] };

  cashflow.diesel = years.map(() => 0);
  cashflow.cng = years.map(() => 0);
  cashflow.ev = years.map(() => 0);


  const dieselCap = vehicleCapexPlan("diesel");
  const cngCap = vehicleCapexPlan("cng");
  const evCap = vehicleCapexPlan("ev");

// ---------------- EVSE + Infrastructure (replacement + residual) ----------------
const chargerQty = n(inputs, "evInfra.chargerQuantity", 0);

const chargerCost = Math.max(0, n(inputs, "evInfra.chargerCost", 0));
const chargerFunding = Math.max(0, n(inputs, "evInfra.chargerFunding", 0));

const chargersCapexYear0 = chargerCost * chargerQty;
const chargerFundingYear0 = -(chargerFunding * chargerQty); // negative inflow

const infraPerCharger = Math.max(0, n(inputs, "evInfra.infrastructureCostPerCharger", 0));
const infrastructureCapexYear0 = infraPerCharger * chargerQty;

// Lifetimes (we can add these to schema later)
const chargerLifeYears = n(inputs, "evInfra.chargerLifeYears", 10);
const infrastructureLifeYears = n(inputs, "evInfra.infrastructureLifeYears", 30);

// Optional escalation for replacement purchases
const evseEsc = n(inputs, "evInfra.costEscalationRate", 0);

// Add schedules into EV cashflow
if (chargersCapexYear0 > 0) {
  addReplacementAssetSchedule({
    cashflow: cashflow.ev,
    years,
    analysisYears: depYears,
    assetLifeYears: chargerLifeYears,
    baseCostYear0: chargersCapexYear0,
    costEscalationRate: evseEsc,
  });
}

if (infrastructureCapexYear0 > 0) {
  addReplacementAssetSchedule({
    cashflow: cashflow.ev,
    years,
    analysisYears: depYears,
    assetLifeYears: infrastructureLifeYears,
    baseCostYear0: infrastructureCapexYear0,
    costEscalationRate: evseEsc,
  });
}

// apply funding as explicit Year 0 negative cashflow
cashflow.ev[0] += chargerFundingYear0

if (infrastructureCapexYear0 > 0) {
  addReplacementAssetSchedule({
    cashflow: cashflow.ev,
    years,
    analysisYears: depYears,
    assetLifeYears: infrastructureLifeYears,
    baseCostYear0: infrastructureCapexYear0,
    costEscalationRate: evseEsc,
  });
}

const year0Breakdown: Record<Powertrain, { label: string; value: number }[]> = {
  diesel: [
    { label: "Truck down payment (+ scrap)", value: dieselCap.year0Outflow * trucks },
    { label: "Truck grant", value: dieselCap.grantYear0 * trucks },
  ],
  cng: [
    { label: "Truck down payment (+ scrap)", value: cngCap.year0Outflow * trucks },
    { label: "Truck grant", value: cngCap.grantYear0 * trucks },
    { label: "CNG station capex", value: cngStationYear0Outflow(0) },
  ],
  ev: [
    { label: "Truck down payment (+ scrap)", value: evCap.year0Outflow * trucks },
    { label: "Truck grant", value: evCap.grantYear0 * trucks },
    { label: "Chargers capex (Year 0)", value: chargersCapexYear0 },
    { label: "Infrastructure capex (Year 0)", value: infrastructureCapexYear0 },
    { label: "Charger funding", value: chargerFundingYear0 },
  ],
};
 

 for (const y of years) {
  const calYear = startYear + y;

  if (y === 0) {
    cashflow.diesel[y] += dieselCap.year0Outflow * trucks;
    cashflow.diesel[y] += dieselCap.grantYear0 * trucks; // negative
    cashflow.cng[y] += cngCap.year0Outflow * trucks + cngStationYear0Outflow(0);
    cashflow.cng[y] += cngCap.grantYear0 * trucks; // negative

    // EV: add only TRUCK down payment here (EVSE/infra already added above via schedule)
    cashflow.ev[y] += evCap.year0Outflow * trucks;
    cashflow.ev[y] += evCap.grantYear0 * trucks; // negative

    continue;
  }

  const dieselOp = dieselOperatingCostYear(y);
  const cngOp = cngOperatingCostYear(y, calYear);
  const evOp = evOperatingCostYear(y, calYear);

  const dieselPmt =
    annualLoanPayment(dieselCap.annualApr, dieselCap.termYears, dieselCap.financedPrincipal, y) * trucks;
  const cngPmt =
    annualLoanPayment(cngCap.annualApr, cngCap.termYears, cngCap.financedPrincipal, y) * trucks;
  const evPmt =
    annualLoanPayment(evCap.annualApr, evCap.termYears, evCap.financedPrincipal, y) * trucks;

  // Residual proceeds in final depreciation year (within our series window)
  const dieselResidual = y === depYears ? dieselCap.residualInFinalYear * trucks : 0;
  const cngResidual = y === depYears ? cngCap.residualInFinalYear * trucks : 0;
  const evResidual = y === depYears ? evCap.residualInFinalYear * trucks : 0;

  // IMPORTANT: actually add year costs into the cashflow arrays
  cashflow.diesel[y] += dieselOp + dieselPmt - dieselResidual;
  cashflow.cng[y] += cngOp + cngPmt - cngResidual;
  cashflow.ev[y] += evOp + evPmt - evResidual;
}

  // Backwards-compatible naming: annualCost = cashflow
  const annualCost = cashflow;

  // True cumulative running sums
  const cumulativeCost: Record<Powertrain, number[]> = { diesel: [], cng: [], ev: [] };
  for (const p of ["diesel", "cng", "ev"] as const) {
    const out: number[] = [];
    let running = 0;
    for (let i = 0; i < years.length; i++) {
      running += annualCost[p][i] ?? 0;
      out.push(running);
    }
    cumulativeCost[p] = out;
  }

  const costPerYear = {
    diesel: annualCost.diesel[1] ?? 0,
    cng: annualCost.cng[1] ?? 0,
    ev: annualCost.ev[1] ?? 0,
  };

  const costPerMile = {
    diesel: costPerYear.diesel / Math.max(1, fleetMilesPerYear),
    cng: costPerYear.cng / Math.max(1, fleetMilesPerYear),
    ev: costPerYear.ev / Math.max(1, fleetMilesPerYear),
  };

  // 5-year TCO includes Year 0..Year 5 (or to end if shorter)
// Period TCO uses the same series window (already limited to min(horizon, depreciationYears))
// so "period" = years.length-1
const periodSliceEnd = years.length; // includes Year 0..last year in series

const periodTco = {
  diesel: annualCost.diesel.slice(0, periodSliceEnd).reduce((a, v) => a + (v ?? 0), 0),
  cng: annualCost.cng.slice(0, periodSliceEnd).reduce((a, v) => a + (v ?? 0), 0),
  ev: annualCost.ev.slice(0, periodSliceEnd).reduce((a, v) => a + (v ?? 0), 0),
};

const periodSavingsVsDiesel = {
  ev: periodTco.diesel - periodTco.ev,
  cng: periodTco.diesel - periodTco.cng,
};

  function paybackFromCashflow(alt: Powertrain): number | null {
    // incremental savings (diesel - alt). positive => alt is better
    let cum = 0;
    for (let i = 0; i < years.length; i++) {
      const inc = (annualCost.diesel[i] ?? 0) - (annualCost[alt][i] ?? 0);
      const prev = cum;
      cum += inc;

      if (i === 0) continue;
      if (cum >= 0) {
        const delta = cum - prev;
        if (Math.abs(delta) < 1e-9) return i;
        const frac = (0 - prev) / delta;
        return (i - 1) + Math.min(1, Math.max(0, frac));
      }
    }
    return null;
  }

  const payback = { ev: paybackFromCashflow("ev"), cng: paybackFromCashflow("cng") };

  return {
  startYear,
  horizonYears: horizon,
  annualMilesPerTruck,
  fleetMilesPerYear,
  costPerMile,
  costPerYear,
  fiveYearTco: periodTco,
  fiveYearSavingsVsDiesel: periodSavingsVsDiesel,
  paybackYears: payback,
  year0Breakdown, // <-- ADD THIS
  series: { years, cumulativeCost, annualCost, cashflow },
};
}