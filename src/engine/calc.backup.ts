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

  year0Breakdown: Record<Powertrain, { label: string; value: number }[]>;
  lifetimeBreakdown: Record<Powertrain, { label: string; value: number }[]>;

  series: {
    years: number[];
    cumulativeCost: Record<Powertrain, number[]>;
    annualCost: Record<Powertrain, number[]>;
    cashflow: Record<Powertrain, number[]>;
  };
};

// ----------------- helpers -----------------
function n(inputs: Inputs, key: string, fallback = 0): number {
  const v = (inputs as any)[key];
  const num = typeof v === "number" ? v : Number(v);
  return Number.isFinite(num) ? num : fallback;
}

function b(inputs: Inputs, key: string, fallback = false): boolean {
  const v = (inputs as any)[key];
  return typeof v === "boolean" ? v : Boolean(v ?? fallback);
}

function clampInt(x: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(x)));
}

function inflationFactor(inflationRate: number, yearIndex: number): number {
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

function remainingLoanBalance(
  annualApr: number,
  termYears: number,
  principal: number,
  yearsPaid: number
): number {
  const t = Math.max(0, Math.round(termYears));
  if (principal <= 0 || t <= 0) return 0;

  const monthlyRate = annualApr / 12;
  const totalMonths = t * 12;
  const paidMonths = Math.max(0, Math.min(totalMonths, Math.round(yearsPaid * 12)));

  if (paidMonths >= totalMonths) return 0;

  if (Math.abs(monthlyRate) < 1e-10) {
    const monthlyPrincipal = principal / totalMonths;
    return Math.max(0, principal - monthlyPrincipal * paidMonths);
  }

  const payment = pmtMonthly(monthlyRate, totalMonths, principal, 0, 0);
  const remainingMonths = totalMonths - paidMonths;

  return payment * ((1 - Math.pow(1 + monthlyRate, -remainingMonths)) / monthlyRate);
}

function sumRange(arr: number[], start = 0, endExclusive?: number): number {
  return arr.slice(start, endExclusive).reduce((a, v) => a + (v ?? 0), 0);
}

function compactBreakdown(items: { label: string; value: number }[]) {
  return items.filter((x) => Math.abs(x.value) > 0.01);
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

function addFinancedReplacementAssetSchedule(params: {
  cashflow: number[];
  years: number[];
  analysisYears: number;
  assetLifeYears: number;
  baseCostYear0: number;
  costEscalationRate: number;
  downPaymentPct: number;
  annualApr: number;
  financingTermYears: number;
  downPaymentSeries?: number[];
  financingSeries?: number[];
  residualSeries?: number[];
}) {
  const {
    cashflow,
    years,
    analysisYears,
    assetLifeYears,
    baseCostYear0,
    costEscalationRate,
    downPaymentPct,
    annualApr,
    financingTermYears,
    downPaymentSeries,
    financingSeries,
    residualSeries,
  } = params;

  const life = Math.max(1, Math.round(assetLifeYears));
  const esc = Number.isFinite(costEscalationRate) ? costEscalationRate : 0;
  const downPct = Math.max(0, Math.min(1, downPaymentPct));
  const term = Math.max(0, Math.round(financingTermYears));

  let lastPurchaseYear = 0;
  let lastPurchaseCost = 0;

  for (let purchaseYear = 0; purchaseYear < analysisYears; purchaseYear += life) {
    const purchaseCost = baseCostYear0 * Math.pow(1 + esc, purchaseYear);

    const down = purchaseCost * downPct;
    const financedPrincipal = Math.max(0, purchaseCost - down);

    if (purchaseYear < years.length) {
      cashflow[purchaseYear] = (cashflow[purchaseYear] ?? 0) + down;
      if (downPaymentSeries) downPaymentSeries[purchaseYear] = (downPaymentSeries[purchaseYear] ?? 0) + down;
    }

    if (financedPrincipal > 0 && term > 0) {
      const annualPayment = pmtMonthly(annualApr / 12, term * 12, financedPrincipal, 0, 0) * 12;

      for (let y = purchaseYear + 1; y <= purchaseYear + term && y < years.length; y++) {
        cashflow[y] = (cashflow[y] ?? 0) + annualPayment;
        if (financingSeries) financingSeries[y] = (financingSeries[y] ?? 0) + annualPayment;
      }
    }

    lastPurchaseYear = purchaseYear;
    lastPurchaseCost = purchaseCost;
  }

  const ageAtEnd = analysisYears - lastPurchaseYear;
  const remainingLife = life - ageAtEnd;

  if (remainingLife > 0 && analysisYears < years.length) {
    const residual = lastPurchaseCost * (remainingLife / life);
    const financedPrincipalLast = lastPurchaseCost * (1 - downPct);
    const outstandingDebt = remainingLoanBalance(annualApr, term, financedPrincipalLast, ageAtEnd);
    const netResidual = residual - outstandingDebt;

    cashflow[analysisYears] = (cashflow[analysisYears] ?? 0) - netResidual;
    if (residualSeries) residualSeries[analysisYears] = (residualSeries[analysisYears] ?? 0) - netResidual;
  }
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

  const credits = (gridCI - electricityCI) * 5 * 3.6 * kwhFleetPerYear * 0.000001;
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

// ----------------- Utility rate logic -----------------
function blendedElectricityRate(inputs: Inputs, yearIndex: number): number {
  const f = inflationFactor(n(inputs, "financial.inflationRate", 0.03), yearIndex);
  const isTou = b(inputs, "utility.isTouSchedule", true);

  if (!isTou) return n(inputs, "utility.flatRateKwh", 0.18) * f;

  const sOn = n(inputs, "utility.rateSummerOnPeak", 0.08) * f;
  const sMid = n(inputs, "utility.rateSummerMidPeak", 0.12) * f;
  const sOff = n(inputs, "utility.rateSummerOffPeak", 0.14926) * f;

  const wMid = n(inputs, "utility.rateWinterMidPeak", 0.11) * f;
  const wOff = n(inputs, "utility.rateWinterOffPeak", 0.10) * f;
  const wSuper = n(inputs, "utility.rateWinterSuperOffPeak", 0.09709) * f;

  const superOffRate = wSuper;
  const offRate = (sOff + wOff) / 2;
  const midOnRate = (sOn + sMid + wMid) / 3;

  const rawSuper = n(inputs, "ev.pctChargeSuperOffPeak", 70);
  const rawOff = n(inputs, "ev.pctChargeOffPeak", 25);
  const rawMidOn = n(inputs, "ev.pctChargeMidOnPeak", 5);

  const scale = rawSuper <= 1 && rawOff <= 1 && rawMidOn <= 1 ? 100 : 1;
  const { a: pSuper, b: pOff, c: pMidOn } = normalize3(rawSuper * scale, rawOff * scale, rawMidOn * scale);

  return superOffRate * pSuper + offRate * pOff + midOnRate * pMidOn;
}

function demandChargeEffectiveRate(inputs: Inputs, yearIndex: number): number {
  const f = inflationFactor(n(inputs, "financial.inflationRate", 0.03), yearIndex);
  const base = n(inputs, "utility.demandChargeRate", 0) * f;

  const usePhaseIn = b(inputs, "utility.scePhasedDemandCharge", true);
  if (!usePhaseIn) return base;

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

  const depYears = Math.max(1, n(inputs, "general.depreciationYears", 7));
  const seriesYears = Math.min(horizon, depYears);
  const years = Array.from({ length: seriesYears + 1 }, (_, i) => i);

  function annualLoanPayment(annualApr: number, termYears: number, principal: number, yearIndex: number): number {
    const t = clampInt(termYears, 0, 60);
    if (t <= 0) return 0;
    if (yearIndex < 1 || yearIndex > t) return 0;
    const m = pmtMonthly(annualApr / 12, t * 12, principal, 0, 0);
    return m * 12;
  }

  type CapexPlan = {
    year0Outflow: number;
    grantYear0: number;
    financedPrincipal: number;
    annualApr: number;
    termYears: number;
    residualInFinalYear: number;
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

    const grantYear0 = -grant;

    // Explicit grant as Year 0 negative; financing still based on gross cost
    const netCostForFinance = grossCost;

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

  function cleanTruckFeePerTruckPerYear(): number {
    const isDrayage = b(inputs, "general.isDrayageTruck", false);
    if (!isDrayage) return 0;
    const fee = n(inputs, "diesel.cleanTruckPortFee", 20);
    const tripsPerDay = n(inputs, "general.portTripsPerDay", 2);
    const wd = n(inputs, "general.workDaysPerYear", 280);
    return fee * tripsPerDay * wd;
  }

  const thermsPerYearFleet =
    (1.295 * (annualMilesPerTruck / Math.max(0.001, n(inputs, "cng.mpg", 6.8)))) * trucks;

  function dieselOperatingCostYear(yearIndex: number): number {
    const f = inflationFactor(infl, yearIndex);
    const mpg = Math.max(0.001, n(inputs, "diesel.mpg", 8));

    const dieselFuel = (n(inputs, "diesel.pricePerGallon", 4.97) / mpg) * f;
    const defCost = (n(inputs, "diesel.defPrice", 4.5) / mpg) * n(inputs, "diesel.defDosingPct", 0.04) * f;
    const maint = n(inputs, "diesel.maintenanceCostPerMile", 0.25) * f;
    const cleanFeePerMile = cleanTruckFeePerTruckPerYear() / Math.max(1, annualMilesPerTruck);

    return (dieselFuel + defCost + maint + cleanFeePerMile) * fleetMilesPerYear;
  }

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

    const dm = n(inputs, "diesel.maintenanceCostPerMile", 0.25) * f;
    const cm = n(inputs, "cng.maintenanceCostPerMile", 0.25) * f;
    return Math.max(dm, cm) * 0.6;
  }

  function evOperatingCostYear(yearIndex: number, calendarYear: number): number {
    const kwhPerMile = n(inputs, "ev.kwhPerMile", 2);

    const kwhPerTruckPerYear = annualMilesPerTruck * kwhPerMile;
    const kwhFleetPerYear = kwhPerTruckPerYear * trucks;

    const elecRate = blendedElectricityRate(inputs, yearIndex);
    const electricityCostPerYear = kwhFleetPerYear * elecRate;

    const dailyFleetKWh = kwhFleetPerYear / Math.max(1, workDays);
    const hoursAvail = Math.max(0.1, n(inputs, "ev.hoursAvailableForCharging", 12));
    const simultaneousFactor = n(inputs, "ev.simultaneousChargingFactor", 0.6);
    const peakDemandKw = (dailyFleetKWh / hoursAvail) * simultaneousFactor;
    const demandPerYear = peakDemandKw * demandChargeEffectiveRate(inputs, yearIndex) * 12;

    const customerChargePerYear = n(inputs, "utility.customerCharge", 0) * 12;
    const cmsPerYear =
      n(inputs, "evInfra.cmsCostPerChargerPerYear", 0) * n(inputs, "evInfra.chargerQuantity", 0);

    const lcfs = evLcfsCreditPerYear(inputs, calendarYear, kwhFleetPerYear);

    const perMile =
      electricityCostPerYear / Math.max(1, fleetMilesPerYear) +
      (demandPerYear + customerChargePerYear + cmsPerYear + lcfs) / Math.max(1, fleetMilesPerYear) +
      evMaintenancePerMile(yearIndex);

    return perMile * fleetMilesPerYear;
  }

  // ---- Build cashflow arrays ----
  const cashflow: Record<Powertrain, number[]> = {
    diesel: years.map(() => 0),
    cng: years.map(() => 0),
    ev: years.map(() => 0),
  };

  const breakdownSeries = {
    diesel: {
      truckDownAndScrap: years.map(() => 0),
      truckGrant: years.map(() => 0),
      truckFinancing: years.map(() => 0),
      truckResidual: years.map(() => 0),
      fuel: years.map(() => 0),
      def: years.map(() => 0),
      maintenance: years.map(() => 0),
      cleanTruckFees: years.map(() => 0),
    },
    cng: {
      truckDownAndScrap: years.map(() => 0),
      truckGrant: years.map(() => 0),
      truckFinancing: years.map(() => 0),
      truckResidual: years.map(() => 0),
      stationDownPayment: years.map(() => 0),
      stationFinancing: years.map(() => 0),
      stationResidual: years.map(() => 0),
      fuel: years.map(() => 0),
      maintenance: years.map(() => 0),
      stationMaintenance: years.map(() => 0),
      lcfs: years.map(() => 0),
      cleanTruckFees: years.map(() => 0),
    },
    ev: {
      truckDownAndScrap: years.map(() => 0),
      truckGrant: years.map(() => 0),
      truckFinancing: years.map(() => 0),
      truckResidual: years.map(() => 0),
      chargerDownPayment: years.map(() => 0),
      chargerFinancing: years.map(() => 0),
      chargerResidual: years.map(() => 0),
      infrastructureDownPayment: years.map(() => 0),
      infrastructureFinancing: years.map(() => 0),
      infrastructureResidual: years.map(() => 0),
      chargerFunding: years.map(() => 0),
      electricity: years.map(() => 0),
      demand: years.map(() => 0),
      customerCharges: years.map(() => 0),
      cms: years.map(() => 0),
      maintenance: years.map(() => 0),
      lcfs: years.map(() => 0),
    },
  };

  const dieselCap = vehicleCapexPlan("diesel");
  const cngCap = vehicleCapexPlan("cng");
  const evCap = vehicleCapexPlan("ev");

  // ---------------- EVSE + Infrastructure ----------------
  const chargerQty = n(inputs, "evInfra.chargerQuantity", 0);

  const chargerCost = Math.max(0, n(inputs, "evInfra.chargerCost", 0));
  const chargerFunding = Math.max(0, n(inputs, "evInfra.chargerFunding", 0));

  const chargersCapexYear0 = chargerCost * chargerQty;
  const chargerFundingYear0 = -(chargerFunding * chargerQty);

  const infraPerCharger = Math.max(0, n(inputs, "evInfra.infrastructureCostPerCharger", 0));
  const infrastructureCapexYear0 = infraPerCharger * chargerQty;

  const chargerLifeYears = n(inputs, "evInfra.chargerLifeYears", 10);
  const infrastructureLifeYears = n(inputs, "evInfra.infrastructureLifeYears", 30);
  const evseEsc = n(inputs, "evInfra.costEscalationRate", 0);

  const evInfraDownPct = n(inputs, "evInfra.downPaymentPct", 1);
  const evInfraApr = n(inputs, "evInfra.financingRateApr", 0.05);
  const evInfraTermYears = n(inputs, "evInfra.financingTermYears", 15);

  const chargersDownPaymentYear0 = chargersCapexYear0 * evInfraDownPct;
  const infrastructureDownPaymentYear0 = infrastructureCapexYear0 * evInfraDownPct;

  if (chargersCapexYear0 > 0) {
    addFinancedReplacementAssetSchedule({
      cashflow: cashflow.ev,
      years,
      analysisYears: depYears,
      assetLifeYears: chargerLifeYears,
      baseCostYear0: chargersCapexYear0,
      costEscalationRate: evseEsc,
      downPaymentPct: evInfraDownPct,
      annualApr: evInfraApr,
      financingTermYears: evInfraTermYears,
      downPaymentSeries: breakdownSeries.ev.chargerDownPayment,
      financingSeries: breakdownSeries.ev.chargerFinancing,
      residualSeries: breakdownSeries.ev.chargerResidual,
    });
  }

  if (infrastructureCapexYear0 > 0) {
    addFinancedReplacementAssetSchedule({
      cashflow: cashflow.ev,
      years,
      analysisYears: depYears,
      assetLifeYears: infrastructureLifeYears,
      baseCostYear0: infrastructureCapexYear0,
      costEscalationRate: evseEsc,
      downPaymentPct: evInfraDownPct,
      annualApr: evInfraApr,
      financingTermYears: evInfraTermYears,
      downPaymentSeries: breakdownSeries.ev.infrastructureDownPayment,
      financingSeries: breakdownSeries.ev.infrastructureFinancing,
      residualSeries: breakdownSeries.ev.infrastructureResidual,
    });
  }

  cashflow.ev[0] += chargerFundingYear0;
  breakdownSeries.ev.chargerFunding[0] += chargerFundingYear0;

  // ---------------- CNG Station ----------------
  const cngStationCapexYear0 = b(inputs, "cngStation.installingStation", true)
    ? Math.max(0, n(inputs, "cngStation.installationCost", 0))
    : 0;

  const cngStationLifeYears = n(inputs, "cngStation.stationLifeYears", 20);
  const cngStationEsc = n(inputs, "cngStation.costEscalationRate", 0);
  const cngStationDownPct = n(inputs, "cngStation.downPaymentPct", 1);
  const cngStationApr = n(inputs, "cngStation.financingRateApr", 0.05);
  const cngStationTermYears = n(inputs, "cngStation.financingTermYears", 15);

  const cngStationDownPaymentYear0 = cngStationCapexYear0 * cngStationDownPct;

  if (cngStationCapexYear0 > 0) {
    addFinancedReplacementAssetSchedule({
      cashflow: cashflow.cng,
      years,
      analysisYears: depYears,
      assetLifeYears: cngStationLifeYears,
      baseCostYear0: cngStationCapexYear0,
      costEscalationRate: cngStationEsc,
      downPaymentPct: cngStationDownPct,
      annualApr: cngStationApr,
      financingTermYears: cngStationTermYears,
      downPaymentSeries: breakdownSeries.cng.stationDownPayment,
      financingSeries: breakdownSeries.cng.stationFinancing,
      residualSeries: breakdownSeries.cng.stationResidual,
    });
  }

  const year0Breakdown: Record<Powertrain, { label: string; value: number }[]> = {
    diesel: compactBreakdown([
      { label: "Truck down payment (+ scrap)", value: dieselCap.year0Outflow * trucks },
      { label: "Truck grant", value: dieselCap.grantYear0 * trucks },
    ]),
    cng: compactBreakdown([
      { label: "Truck down payment (+ scrap)", value: cngCap.year0Outflow * trucks },
      { label: "Truck grant", value: cngCap.grantYear0 * trucks },
      { label: "CNG station down payment", value: cngStationDownPaymentYear0 },
    ]),
    ev: compactBreakdown([
      { label: "Truck down payment (+ scrap)", value: evCap.year0Outflow * trucks },
      { label: "Truck grant", value: evCap.grantYear0 * trucks },
      { label: "Chargers down payment", value: chargersDownPaymentYear0 },
      { label: "Infrastructure down payment", value: infrastructureDownPaymentYear0 },
      { label: "Charger funding", value: chargerFundingYear0 },
    ]),
  };

  for (const y of years) {
    const calYear = startYear + y;

    if (y === 0) {
      cashflow.diesel[y] += dieselCap.year0Outflow * trucks;
      cashflow.diesel[y] += dieselCap.grantYear0 * trucks;
      breakdownSeries.diesel.truckDownAndScrap[y] += dieselCap.year0Outflow * trucks;
      breakdownSeries.diesel.truckGrant[y] += dieselCap.grantYear0 * trucks;

      cashflow.cng[y] += cngCap.year0Outflow * trucks;
      cashflow.cng[y] += cngCap.grantYear0 * trucks;
      breakdownSeries.cng.truckDownAndScrap[y] += cngCap.year0Outflow * trucks;
      breakdownSeries.cng.truckGrant[y] += cngCap.grantYear0 * trucks;

      cashflow.ev[y] += evCap.year0Outflow * trucks;
      cashflow.ev[y] += evCap.grantYear0 * trucks;
      breakdownSeries.ev.truckDownAndScrap[y] += evCap.year0Outflow * trucks;
      breakdownSeries.ev.truckGrant[y] += evCap.grantYear0 * trucks;

      continue;
    }

    const dieselOp = dieselOperatingCostYear(y);
    const cngOp = cngOperatingCostYear(y, calYear);
    const evOp = evOperatingCostYear(y, calYear);

    const dieselPmt = annualLoanPayment(dieselCap.annualApr, dieselCap.termYears, dieselCap.financedPrincipal, y) * trucks;
    const cngPmt = annualLoanPayment(cngCap.annualApr, cngCap.termYears, cngCap.financedPrincipal, y) * trucks;
    const evPmt = annualLoanPayment(evCap.annualApr, evCap.termYears, evCap.financedPrincipal, y) * trucks;

    const dieselResidual = y === depYears ? dieselCap.residualInFinalYear * trucks : 0;
    const cngResidual = y === depYears ? cngCap.residualInFinalYear * trucks : 0;
    const evResidual = y === depYears ? evCap.residualInFinalYear * trucks : 0;

    // Diesel component series
    {
      const f = inflationFactor(infl, y);
      const mpg = Math.max(0.001, n(inputs, "diesel.mpg", 8));
      const fuelPerMile = (n(inputs, "diesel.pricePerGallon", 4.97) / mpg) * f;
      const defPerMile =
        (n(inputs, "diesel.defPrice", 4.5) / mpg) * n(inputs, "diesel.defDosingPct", 0.04) * f;
      const maintPerMile = n(inputs, "diesel.maintenanceCostPerMile", 0.25) * f;
      const cleanFeePerMile = cleanTruckFeePerTruckPerYear() / Math.max(1, annualMilesPerTruck);

      breakdownSeries.diesel.fuel[y] += fuelPerMile * fleetMilesPerYear;
      breakdownSeries.diesel.def[y] += defPerMile * fleetMilesPerYear;
      breakdownSeries.diesel.maintenance[y] += maintPerMile * fleetMilesPerYear;
      breakdownSeries.diesel.cleanTruckFees[y] += cleanFeePerMile * fleetMilesPerYear;
      breakdownSeries.diesel.truckFinancing[y] += dieselPmt;
      breakdownSeries.diesel.truckResidual[y] += -dieselResidual;
    }

    // CNG component series
    {
      const f = inflationFactor(infl, y);
      const mpg = Math.max(0.001, n(inputs, "cng.mpg", 6.8));
      const fuelPerMile = (n(inputs, "cng.fuelPricePerGge", 3.5) / mpg) * f;
      const maintPerMile = n(inputs, "cng.maintenanceCostPerMile", 0.25) * f;
      const cleanFeePerMile = cleanTruckFeePerTruckPerYear() / Math.max(1, annualMilesPerTruck);
      const stationMaintPerYear = b(inputs, "cngStation.installingStation", true)
        ? n(inputs, "cngStation.yearlyMaintenanceCost", 0) * f
        : 0;
      const lcfs = cngLcfsCreditPerYear(inputs, calYear, thermsPerYearFleet);

      breakdownSeries.cng.fuel[y] += fuelPerMile * fleetMilesPerYear;
      breakdownSeries.cng.maintenance[y] += maintPerMile * fleetMilesPerYear;
      breakdownSeries.cng.stationMaintenance[y] += stationMaintPerYear;
      breakdownSeries.cng.cleanTruckFees[y] += cleanFeePerMile * fleetMilesPerYear;
      breakdownSeries.cng.lcfs[y] += lcfs;
      breakdownSeries.cng.truckFinancing[y] += cngPmt;
      breakdownSeries.cng.truckResidual[y] += -cngResidual;
    }

    // EV component series
    {
      const kwhPerMile = n(inputs, "ev.kwhPerMile", 2);
      const kwhPerTruckPerYear = annualMilesPerTruck * kwhPerMile;
      const kwhFleetPerYear = kwhPerTruckPerYear * trucks;

      const elecRate = blendedElectricityRate(inputs, y);
      const electricityCostPerYear = kwhFleetPerYear * elecRate;

      const dailyFleetKWh = kwhFleetPerYear / Math.max(1, workDays);
      const hoursAvail = Math.max(0.1, n(inputs, "ev.hoursAvailableForCharging", 12));
      const simultaneousFactor = n(inputs, "ev.simultaneousChargingFactor", 0.6);
      const peakDemandKw = (dailyFleetKWh / hoursAvail) * simultaneousFactor;
      const demandPerYear = peakDemandKw * demandChargeEffectiveRate(inputs, y) * 12;

      const customerChargePerYear = n(inputs, "utility.customerCharge", 0) * 12;
      const cmsPerYear =
        n(inputs, "evInfra.cmsCostPerChargerPerYear", 0) * n(inputs, "evInfra.chargerQuantity", 0);
      const lcfs = evLcfsCreditPerYear(inputs, calYear, kwhFleetPerYear);
      const maintPerYear = evMaintenancePerMile(y) * fleetMilesPerYear;

      breakdownSeries.ev.electricity[y] += electricityCostPerYear;
      breakdownSeries.ev.demand[y] += demandPerYear;
      breakdownSeries.ev.customerCharges[y] += customerChargePerYear;
      breakdownSeries.ev.cms[y] += cmsPerYear;
      breakdownSeries.ev.maintenance[y] += maintPerYear;
      breakdownSeries.ev.lcfs[y] += lcfs;
      breakdownSeries.ev.truckFinancing[y] += evPmt;
      breakdownSeries.ev.truckResidual[y] += -evResidual;
    }

    cashflow.diesel[y] += dieselOp + dieselPmt - dieselResidual;
    cashflow.cng[y] += cngOp + cngPmt - cngResidual;
    cashflow.ev[y] += evOp + evPmt - evResidual;
  }

  const annualCost = cashflow;

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

  const periodSliceEnd = years.length;

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

  const payback = {
    ev: paybackFromCashflow("ev"),
    cng: paybackFromCashflow("cng"),
  };

  const lifetimeBreakdown: Record<Powertrain, { label: string; value: number }[]> = {
    diesel: compactBreakdown([
      { label: "Truck down payment (+ scrap)", value: sumRange(breakdownSeries.diesel.truckDownAndScrap) },
      { label: "Truck grant", value: sumRange(breakdownSeries.diesel.truckGrant) },
      { label: "Truck financing", value: sumRange(breakdownSeries.diesel.truckFinancing) },
      { label: "Truck residual", value: sumRange(breakdownSeries.diesel.truckResidual) },
      { label: "Fuel", value: sumRange(breakdownSeries.diesel.fuel) },
      { label: "DEF", value: sumRange(breakdownSeries.diesel.def) },
      { label: "Maintenance", value: sumRange(breakdownSeries.diesel.maintenance) },
      { label: "Clean Truck Fees", value: sumRange(breakdownSeries.diesel.cleanTruckFees) },
    ]),
    cng: compactBreakdown([
      { label: "Truck down payment (+ scrap)", value: sumRange(breakdownSeries.cng.truckDownAndScrap) },
      { label: "Truck grant", value: sumRange(breakdownSeries.cng.truckGrant) },
      { label: "Truck financing", value: sumRange(breakdownSeries.cng.truckFinancing) },
      { label: "Truck residual", value: sumRange(breakdownSeries.cng.truckResidual) },
      { label: "CNG station down payment", value: sumRange(breakdownSeries.cng.stationDownPayment) },
      { label: "CNG station financing", value: sumRange(breakdownSeries.cng.stationFinancing) },
      { label: "CNG station residual", value: sumRange(breakdownSeries.cng.stationResidual) },
      { label: "Fuel", value: sumRange(breakdownSeries.cng.fuel) },
      { label: "Maintenance", value: sumRange(breakdownSeries.cng.maintenance) },
      { label: "Station maintenance", value: sumRange(breakdownSeries.cng.stationMaintenance) },
      { label: "LCFS", value: sumRange(breakdownSeries.cng.lcfs) },
      { label: "Clean Truck Fees", value: sumRange(breakdownSeries.cng.cleanTruckFees) },
    ]),
    ev: compactBreakdown([
      { label: "Truck down payment (+ scrap)", value: sumRange(breakdownSeries.ev.truckDownAndScrap) },
      { label: "Truck grant", value: sumRange(breakdownSeries.ev.truckGrant) },
      { label: "Truck financing", value: sumRange(breakdownSeries.ev.truckFinancing) },
      { label: "Truck residual", value: sumRange(breakdownSeries.ev.truckResidual) },
      { label: "Chargers down payment", value: sumRange(breakdownSeries.ev.chargerDownPayment) },
      { label: "Chargers financing", value: sumRange(breakdownSeries.ev.chargerFinancing) },
      { label: "Chargers residual", value: sumRange(breakdownSeries.ev.chargerResidual) },
      { label: "Infrastructure down payment", value: sumRange(breakdownSeries.ev.infrastructureDownPayment) },
      { label: "Infrastructure financing", value: sumRange(breakdownSeries.ev.infrastructureFinancing) },
      { label: "Infrastructure residual", value: sumRange(breakdownSeries.ev.infrastructureResidual) },
      { label: "Charger funding", value: sumRange(breakdownSeries.ev.chargerFunding) },
      { label: "Electricity", value: sumRange(breakdownSeries.ev.electricity) },
      { label: "Demand charges", value: sumRange(breakdownSeries.ev.demand) },
      { label: "Customer charges", value: sumRange(breakdownSeries.ev.customerCharges) },
      { label: "CMS", value: sumRange(breakdownSeries.ev.cms) },
      { label: "Maintenance", value: sumRange(breakdownSeries.ev.maintenance) },
      { label: "LCFS", value: sumRange(breakdownSeries.ev.lcfs) },
    ]),
  };

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
    year0Breakdown,
    lifetimeBreakdown,
    series: { years, cumulativeCost, annualCost, cashflow },
  };
}
