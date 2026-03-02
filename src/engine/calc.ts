import type { Inputs } from "../types/schema";

export type Powertrain = "diesel" | "cng" | "ev";

export type YearSeries = {
  yearIndex: number; // 1..N
  calendarYear?: number;
  diesel: number;
  cng: number;
  ev: number;
};

export type CalcSummary = {
  startYear: number;
  horizonYears: number;
  annualMilesPerTruck: number;
  fleetMilesPerYear: number;

  // headline
  costPerMile: Record<Powertrain, number>;
  costPerYear: Record<Powertrain, number>;
  fiveYearTco: Record<Powertrain, number>;
  fiveYearSavingsVsDiesel: { ev: number; cng: number };
  paybackYears: { ev: number | null; cng: number | null };

  // for charts
  series: {
    years: number[];
    cumulativeCost: Record<Powertrain, number[]>;
    annualCost: Record<Powertrain, number[]>;
  };
};

function n(inputs: Inputs, key: string, fallback = 0): number {
  const v = inputs[key];
  const num = typeof v === "number" ? v : Number(v);
  return Number.isFinite(num) ? num : fallback;
}
function b(inputs: Inputs, key: string, fallback = false): boolean {
  const v = inputs[key];
  return typeof v === "boolean" ? v : Boolean(v ?? fallback);
}

function clampInt(x: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(x)));
}

/**
 * Excel PMT(rate, nper, pv, fv, type)
 * Here:
 * - rate is monthly rate (APR/12)
 * - nper is months
 * - pv is negative for "borrowed" in Excel formulas, but we accept positive pv and return a positive payment.
 */
export function pmtMonthly(rate: number, nper: number, pv: number, fv = 0, type: 0 | 1 = 0): number {
  if (nper <= 0) return 0;
  if (Math.abs(rate) < 1e-10) return (pv + fv) / nper;
  const r = rate;
  const pow = Math.pow(1 + r, nper);
  let pmt = (r * (pv * pow + fv)) / (pow - 1);
  if (type === 1) pmt = pmt / (1 + r);
  return pmt;
}

function annualPaymentIfWithinTerm(annualRate: number, termYears: number, financedAmount: number, yearIndex: number): number {
  const t = clampInt(termYears, 0, 60);
  if (t <= 0) return 0;
  if (yearIndex > t) return 0;
  const m = pmtMonthly(annualRate / 12, t * 12, financedAmount, 0, 0);
  return m * 12;
}

function horizonYears(inputs: Inputs): number {
  return clampInt(n(inputs, "general.depreciationYears", 7), 3, 15);
}

function inflationFactor(inflationRate: number, yearIndex: number): number {
  // yearIndex 1 => base year (no inflation)
  return Math.pow(1 + inflationRate, Math.max(0, yearIndex - 1));
}

type TouRates = {
  summerOn: number;
  summerMid: number;
  summerOff: number;
  winterMid: number;
  winterOff: number;
  winterSuperOff: number;
};

function blendedElectricityRate(inputs: Inputs, yearIndex: number): number {
  const tou = b(inputs, "utility.isTouSchedule", true);
  const infl = n(inputs, "financial.inflationRate", 0.03);
  if (!tou) return n(inputs, "utility.flatRateKwh", 0.18) * inflationFactor(infl, yearIndex);

  const rates0: TouRates = {
    summerOn: n(inputs, "utility.rateSummerOnPeak", 0.08),
    summerMid: n(inputs, "utility.rateSummerMidPeak", 0.33723),
    summerOff: n(inputs, "utility.rateSummerOffPeak", 0.14926),
    winterMid: n(inputs, "utility.rateWinterMidPeak", 0.37882),
    winterOff: n(inputs, "utility.rateWinterOffPeak", 0.15603),
    winterSuperOff: n(inputs, "utility.rateWinterSuperOffPeak", 0.09709),
  };

  const f = inflationFactor(infl, yearIndex);
  const r: TouRates = {
    summerOn: rates0.summerOn * f,
    summerMid: rates0.summerMid * f,
    summerOff: rates0.summerOff * f,
    winterMid: rates0.winterMid * f,
    winterOff: rates0.winterOff * f,
    winterSuperOff: rates0.winterSuperOff * f,
  };

  const pct = {
    summerOn: n(inputs, "chargingSplit.summerOnPeakPct", 1),
    summerMid: n(inputs, "chargingSplit.summerMidPeakPct", 0),
    summerOff: n(inputs, "chargingSplit.summerOffPeakPct", 0),
    winterMid: n(inputs, "chargingSplit.winterMidPeakPct", 0),
    winterOff: n(inputs, "chargingSplit.winterOffPeakPct", 0),
    winterSuperOff: n(inputs, "chargingSplit.winterSuperOffPeakPct", 0),
  };

  const wsum = pct.summerOn + pct.summerMid + pct.summerOff + pct.winterMid + pct.winterOff + pct.winterSuperOff;
  if (wsum <= 0) return n(inputs, "utility.flatRateKwh", 0.18) * f;

  return (
    r.summerOn * pct.summerOn +
    r.summerMid * pct.summerMid +
    r.summerOff * pct.summerOff +
    r.winterMid * pct.winterMid +
    r.winterOff * pct.winterOff +
    r.winterSuperOff * pct.winterSuperOff
  ) / wsum;
}

function demandChargePhaseInCumulative(inputs: Inputs, yearIndex: number): number {
  const phased = b(inputs, "utility.scePhasedDemandCharge", true);
  if (!phased) return 1;

  // Matches spreadsheet: Y1=0.33, Y2..Y5=0.167 cumulative until 1
  const phase = yearIndex === 1 ? 0.33 : 0.167;
  const cum = 0.33 + 0.167 * Math.max(0, yearIndex - 2);
  return Math.min(1, yearIndex === 1 ? 0.33 : yearIndex === 2 ? 0.167 : cum);
}

function demandChargeEffectiveRate(inputs: Inputs, yearIndex: number): number {
  const base = n(inputs, "utility.demandChargeRate", 0);
  return base * demandChargePhaseInCumulative(inputs, yearIndex);
}

// Hidden-sheet constants extracted from workbook (grid CI by year)
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
const years = Object.keys(GRID_CI_BY_YEAR).map((x) => Number(x)).sort((a, b) => a - b);
if (years.length === 0) return 0;
if (year <= years[0]) return GRID_CI_BY_YEAR[years[0]]!;
if (year >= years[years.length - 1]) return GRID_CI_BY_YEAR[years[years.length - 1]]!;
// find nearest lower year (table is annual)
for (let i = years.length - 1; i >= 0; i--) {
  if (year >= years[i]) return GRID_CI_BY_YEAR[years[i]]!;
}
return GRID_CI_BY_YEAR[years[0]]!;

}

function evLcfsCreditPerYear(inputs: Inputs, calendarYear: number, kwhFleetPerYear: number): number {
  const applicable = b(inputs, "general.lcfsApplicable", true);
  if (!applicable) return 0;
  const share = n(inputs, "evInfra.lcfsCreditShare", 0.8);
  const creditValue = n(inputs, "general.lcfsCreditValuePerUnit", 80);
  const electricityCI = n(inputs, "general.electricityCarbonIntensity", 0);
  const gridCI = gridCiForYear(calendarYear);

  // From hidden sheet: (gridCI - electricityCI) * 5 * 3.6 * kWhFleet * 1e-6
  const credits = (gridCI - electricityCI) * 5 * 3.6 * kwhFleetPerYear * 0.000001;
  return -credits * creditValue * share;
}

function cngLcfsCreditPerYear(inputs: Inputs, calendarYear: number, thermsPerYear: number): number {
  const applicable = b(inputs, "general.lcfsApplicable", true);
  if (!applicable) return 0;
  const share = n(inputs, "cng.lcfsCreditShare", 0);
  const creditValue = n(inputs, "general.lcfsCreditValuePerUnit", 80);
  const ngCI = n(inputs, "general.ngCarbonIntensity", 43);
  const gridCI = gridCiForYear(calendarYear);

  // From hidden sheet: (B - ngCI) * 0.9 * 105.5 * thermsPerYear * 1e-6
  const credits = (gridCI - ngCI) * 0.9 * 105.5 * thermsPerYear * 0.000001;
  return -creditValue * share * credits;
}

function cleanTruckFeePerTruckPerYear(inputs: Inputs): number {
  const isDrayage = b(inputs, "general.isDrayageTruck", false);
  if (!isDrayage) return 0;
  const fee = n(inputs, "diesel.cleanTruckPortFee", 20);
  const tripsPerDay = n(inputs, "general.portTripsPerDay", 2);
  const workDays = n(inputs, "general.workDaysPerYear", 280);
  return fee * tripsPerDay * workDays;
}

function wairePerYearFleet(inputs: Inputs): number {
  // Temporary: allow override until we port WAIRE tab fully.
  if (b(inputs, "waire.useOverride", false)) return n(inputs, "waire.overrideAnnualValue", 0);
  return 0;
}

export function calculate(inputs: Inputs): CalcSummary {
  const horizon = horizonYears(inputs);
  const startYear = Math.round(n(inputs, "general.modelStartYear", 2026));

  const milesPerDay = n(inputs, "general.milesPerDayPerTruck", 300);
  const workDays = n(inputs, "general.workDaysPerYear", 280);
  const trucks = n(inputs, "general.vehicleCount", 1);
  const infl = n(inputs, "financial.inflationRate", 0.03);

  const annualMilesPerTruck = milesPerDay * workDays;
  const fleetMilesPerYear = annualMilesPerTruck * trucks;

  // ---- Vehicle financing / capex (spreadsheet-style: compute total interest once, then spread via depreciation) ----
  function vehicleInterestPerTruck(prefix: "diesel" | "cng" | "ev"): number {
    const rate = n(inputs, `${prefix}.financingRateApr`, 0.05);
    const termYears = n(inputs, `${prefix}.financingTermYears`, 6);
    const downPct = n(inputs, `${prefix}.downPaymentPct`, 0.2);
    const costKey = prefix === "ev" ? "ev.vehicleCost" : `${prefix}.truckCost`;
    const grantKey = `${prefix}.grantValue`;
    const scrapKey = `${prefix}.grantTruckScrapValue`;

    const cost = n(inputs, costKey, 0);
    const grant = n(inputs, grantKey, 0);
    const customerCost = Math.max(0, cost - grant);
    const down = customerCost * downPct;
    const financed = Math.max(0, customerCost - down);
    const totalPaid = pmtMonthly(rate / 12, clampInt(termYears, 0, 60) * 12, financed, 0, 0) * (clampInt(termYears, 0, 60) * 12);
    const interest = Math.max(0, totalPaid - financed);
    return interest;
  }

  function vehicleAnnualDepreciatedCostPerTruck(prefix: "diesel" | "cng" | "ev"): number {
    const depYears = n(inputs, "general.depreciationYears", 7);
    const costKey = prefix === "ev" ? "ev.vehicleCost" : `${prefix}.truckCost`;
    const grantKey = `${prefix}.grantValue`;
    const scrapKey = `${prefix}.grantTruckScrapValue`;
    const residualKey = `${prefix}.residualValue`;

    const cost = n(inputs, costKey, 0);
    const grant = n(inputs, grantKey, 0);
    const customerCost = prefix === "ev" ? (cost - grant) : (cost - grant);
    const scrap = n(inputs, scrapKey, 0);
    const residual = n(inputs, residualKey, 0);
    const interest = vehicleInterestPerTruck(prefix);
    return (customerCost + scrap - residual + interest) / Math.max(1, depYears);
  }

  // ---- Diesel operating costs ----
  function dieselPerMile(yearIndex: number): number {
    const f = inflationFactor(infl, yearIndex);
    const dieselFuel = (n(inputs, "diesel.pricePerGallon", 4.97) / Math.max(0.001, n(inputs, "diesel.mpg", 8))) * f;
    const defCost = (n(inputs, "diesel.defPrice", 4.5) / Math.max(0.001, n(inputs, "diesel.mpg", 8)) * n(inputs, "diesel.defDosingPct", 0.04)) * f;
    const maint = n(inputs, "diesel.maintenanceCostPerMile", 0.25) * f;
    const cleanFee = cleanTruckFeePerTruckPerYear(inputs) / Math.max(1, annualMilesPerTruck);
    const truck = vehicleAnnualDepreciatedCostPerTruck("diesel") / Math.max(1, annualMilesPerTruck);
    return dieselFuel + defCost + maint + cleanFee + truck;
  }

  // ---- CNG operating costs ----
  const thermsPerYear = (1.295 * ((annualMilesPerTruck / Math.max(0.001, n(inputs, "cng.mpg", 6.8))))) * trucks; // matches sheet (per fleet)
  function cngPerMile(yearIndex: number, calendarYear: number): number {
    const f = inflationFactor(infl, yearIndex);
    const fuel = (n(inputs, "cng.fuelPricePerGge", 3.5) / Math.max(0.001, n(inputs, "cng.mpg", 6.8))) * f;

    const stationCostPerYear = b(inputs, "cngStation.installingStation", true)
      ? (n(inputs, "cngStation.installationCost", 0) + vehicleInterestPerTruck("cng")) / Math.max(1, n(inputs, "cngStation.capitalDepreciationYears", 30))
      : 0;
    const stationMaintPerYear = b(inputs, "cngStation.installingStation", true)
      ? n(inputs, "cngStation.yearlyMaintenanceCost", 0) * f
      : 0;

    const lcfs = cngLcfsCreditPerYear(inputs, calendarYear, thermsPerYear);
    const lcfsPerMile = lcfs / Math.max(1, fleetMilesPerYear);

    const maint = n(inputs, "cng.maintenanceCostPerMile", 0.25) * f;
    const cleanFee = cleanTruckFeePerTruckPerYear(inputs) / Math.max(1, annualMilesPerTruck);
    const truck = vehicleAnnualDepreciatedCostPerTruck("cng") / Math.max(1, annualMilesPerTruck);

    return (
      fuel +
      (stationCostPerYear + stationMaintPerYear) / Math.max(1, fleetMilesPerYear) +
      lcfsPerMile +
      maint +
      cleanFee +
      truck
    );
  }

  // ---- EV operating costs ----
  function evMaintenancePerMile(yearIndex: number, dieselMaint: number, cngMaint: number): number {
    const f = inflationFactor(infl, yearIndex);
    if (b(inputs, "ev.overrideMaintenance", false)) return n(inputs, "ev.maintenanceCostPerMileBase", 0.18) * f;
    const dm = dieselMaint * f;
    const cm = cngMaint * f;
    return Math.max(dm, cm) * 0.6; // sheet uses IF and *0.6
  }

  function evPerMile(yearIndex: number, calendarYear: number): number {
    const kwhPerMile = n(inputs, "ev.kwhPerMile", 2);
    const kwhPerTruckPerDay = milesPerDay * kwhPerMile;
    const kwhFleetPerYear = kwhPerTruckPerDay * workDays * trucks;

    const elecRate = blendedElectricityRate(inputs, yearIndex);

    const elecFuelPerMile = kwhPerMile * elecRate;

    const peakDemandKw = (trucks * kwhPerTruckPerDay) / Math.max(0.1, n(inputs, "ev.hoursAvailableForCharging", 12));
    const demandPerYear = peakDemandKw * demandChargeEffectiveRate(inputs, yearIndex) * 12;
    const demandPerMile = demandPerYear / Math.max(1, fleetMilesPerYear);

    const customerChargePerYear = n(inputs, "utility.customerCharge", 0) * 12;
    const customerChargePerMile = customerChargePerYear / Math.max(1, fleetMilesPerYear);

    const cmsPerYear = n(inputs, "evInfra.cmsCostPerChargerPerYear", 0) * n(inputs, "evInfra.chargerQuantity", 0);
    const cmsPerMile = cmsPerYear / Math.max(1, fleetMilesPerYear);

    // Infrastructure annualized cost (sheet row173)
    const chargerCost = n(inputs, "evInfra.chargerCost", 0);
    const infraCostPerCharger = n(inputs, "evInfra.infrastructureCostPerCharger", 0);
    const qty = n(inputs, "evInfra.chargerQuantity", 0);
    const chargerFunding = n(inputs, "evInfra.chargerFunding", 0);
    const totalInfraCost = Math.max(0, (chargerCost - chargerFunding + infraCostPerCharger) * qty);
    const downPct = n(inputs, "evInfra.downPaymentPct", 1);
    const down = totalInfraCost * downPct;
    const financed = Math.max(0, totalInfraCost - down);
    const infraInterest = (() => {
      const term = clampInt(n(inputs, "evInfra.financingTermYears", 15), 0, 60);
      const totalPaid = pmtMonthly(n(inputs, "evInfra.financingRateApr", 0.05) / 12, term * 12, financed, 0, 0) * (term * 12);
      return Math.max(0, totalPaid - financed);
    })();

    const chargerLife = Math.max(1, n(inputs, "evInfra.chargerLifespanYears", 10));
    const infraDep = Math.max(1, n(inputs, "evInfra.infrastructureDepreciationYears", 30));

    const denom = Math.max(1e-9, chargerCost + infraCostPerCharger);
    const chargerShare = chargerCost / denom;
    const infraShare = infraCostPerCharger / denom;

    const annualizedInfraCost =
      (((chargerCost * qty) + chargerShare * infraInterest) / chargerLife) +
      (((infraCostPerCharger * qty) + infraShare * infraInterest) / infraDep);

    const annualizedInfraPerMile = annualizedInfraCost / Math.max(1, fleetMilesPerYear);

    // LCFS EV credit
    const lcfs = evLcfsCreditPerYear(inputs, calendarYear, kwhFleetPerYear);
    const lcfsPerMile = lcfs / Math.max(1, fleetMilesPerYear);

    // Maintenance and truck depreciation
    const dieselMaintBase = n(inputs, "diesel.maintenanceCostPerMile", 0.25);
    const cngMaintBase = n(inputs, "cng.maintenanceCostPerMile", 0.25);
    const maintPerMile = evMaintenancePerMile(yearIndex, dieselMaintBase, cngMaintBase);
    const truckPerMile = vehicleAnnualDepreciatedCostPerTruck("ev") / Math.max(1, annualMilesPerTruck);

    // WAIRE (fleet-level)
    const waire = wairePerYearFleet(inputs);
    const wairePerMile = waire / Math.max(1, fleetMilesPerYear);

    return (
      elecFuelPerMile +
      demandPerMile +
      customerChargePerMile +
      cmsPerMile +
      annualizedInfraPerMile +
      lcfsPerMile +
      maintPerMile +
      truckPerMile +
      wairePerMile
    );
  }

  // ---- Build series ----
  const years = Array.from({ length: horizon + 1 }, (_, i) => i);
  const annualCost: Record<Powertrain, number[]> = { diesel: [], cng: [], ev: [] };
  const cumulativeCost: Record<Powertrain, number[]> = { diesel: [], cng: [], ev: [] };

  // Choose a base calendar year for LCFS constant series. Spreadsheet uses 2025 onward in cost table.
  const baseCalendarYear = startYear;

  for (const y of years) {
    if (y === 0) {
      annualCost.diesel.push(0);
      annualCost.cng.push(0);
      annualCost.ev.push(0);
      cumulativeCost.diesel.push(0);
      cumulativeCost.cng.push(0);
      cumulativeCost.ev.push(0);
      continue;
    }
    const cal = baseCalendarYear + y;

    const dpm = dieselPerMile(y);
    const cpm = cngPerMile(y, cal);
    const epm = evPerMile(y, cal);

    const dy = dpm * fleetMilesPerYear;
    const cy = cpm * fleetMilesPerYear;
    const ey = epm * fleetMilesPerYear;

    annualCost.diesel.push(dy);
    annualCost.cng.push(cy);
    annualCost.ev.push(ey);

    cumulativeCost.diesel.push(cumulativeCost.diesel[y - 1] + dy);
    cumulativeCost.cng.push(cumulativeCost.cng[y - 1] + cy);
    cumulativeCost.ev.push(cumulativeCost.ev[y - 1] + ey);
  }

  const costPerMile = {
    diesel: dieselPerMile(1),
    cng: cngPerMile(1, baseCalendarYear + 1),
    ev: evPerMile(1, baseCalendarYear + 1),
  };

  const costPerYear = {
    diesel: costPerMile.diesel * fleetMilesPerYear,
    cng: costPerMile.cng * fleetMilesPerYear,
    ev: costPerMile.ev * fleetMilesPerYear,
  };

  // Five-year totals (use first 5 years of annual series)
  const five = Math.min(5, horizon);
  const fiveYearTco = {
    diesel: annualCost.diesel.slice(1, five + 1).reduce((a, v) => a + v, 0),
    cng: annualCost.cng.slice(1, five + 1).reduce((a, v) => a + v, 0),
    ev: annualCost.ev.slice(1, five + 1).reduce((a, v) => a + v, 0),
  };

  const fiveYearSavingsVsDiesel = {
    ev: fiveYearTco.diesel - fiveYearTco.ev,
    cng: fiveYearTco.diesel - fiveYearTco.cng,
  };

  // Simple payback vs diesel (capex delta / annual savings) using year1 operating+capex amortized proxy.
  function paybackYears(alt: Powertrain): number | null {
    const altAnnual = costPerYear[alt];
    const dieselAnnual = costPerYear.diesel;
    const annualSavings = dieselAnnual - altAnnual;
    if (annualSavings <= 0) return null;

    const depYears = Math.max(1, n(inputs, "general.depreciationYears", 7));
    const altTruckAnnual = vehicleAnnualDepreciatedCostPerTruck(alt === "ev" ? "ev" : alt) * trucks;
    const dieselTruckAnnual = vehicleAnnualDepreciatedCostPerTruck("diesel") * trucks;
    const capexDeltaApprox = (altTruckAnnual - dieselTruckAnnual) * depYears;

    if (capexDeltaApprox <= 0) return 0;
    return capexDeltaApprox / annualSavings;
  }

  const payback = { ev: paybackYears("ev"), cng: paybackYears("cng") };

  return {
    startYear,
    horizonYears: horizon,
    annualMilesPerTruck,
    fleetMilesPerYear,
    costPerMile,
    costPerYear,
    fiveYearTco,
    fiveYearSavingsVsDiesel,
    paybackYears: payback,
    series: { years, cumulativeCost, annualCost },
  };
}
