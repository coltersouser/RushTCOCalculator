import type { CalcSummary } from "../../engine/calc";
import type { Inputs } from "../../types/schema";
import { Card } from "./Card";
import { formatCurrencyPrecise, formatCurrency } from "../../utils/format";

export function ResultsDashboard({
  summary,
  mode,
  activeTech,
  inputs,
}: {
  summary: CalcSummary;
  mode: "sales" | "engineer";
  activeTech: { diesel: boolean; cng: boolean; ev: boolean };
  inputs: Inputs;
}) {
  const lastIdx = summary.series.years.length - 1;

  const dieselTotal = summary.series.cumulativeCost.diesel[lastIdx] ?? 0;
  const cngTotal = summary.series.cumulativeCost.cng[lastIdx] ?? 0;
  const evTotal = summary.series.cumulativeCost.ev[lastIdx] ?? 0;

  const lifetimeSavingsEvVsDiesel = dieselTotal - evTotal;
  const lifetimeSavingsCngVsDiesel = dieselTotal - cngTotal;

  const evWinsLifetime = lifetimeSavingsEvVsDiesel > 0;
  const cngWinsLifetime = lifetimeSavingsCngVsDiesel > 0;

  const paybackEv = summary.paybackYears.ev;
  const paybackCng = summary.paybackYears.cng;

  const touEnabled = Boolean(inputs["utility.isTouSchedule"]);
  const grantsEnabled = Boolean(inputs["grant.used"]);
  const scrapEnabled = Boolean(inputs["scrap.required"]);

  const dieselTruckCost = Number(inputs["diesel.truckCost"] ?? 0);
  const cngTruckCost = Number(inputs["cng.truckCost"] ?? 0);
  const evTruckCost = Number(inputs["ev.vehicleCost"] ?? 0);

  const dieselGrant = Number(inputs["diesel.grantValue"] ?? 0);
  const cngGrant = Number(inputs["cng.grantValue"] ?? 0);
  const evGrant = Number(inputs["ev.grantValue"] ?? 0);

  const dieselScrap = Number(inputs["diesel.scrapValue"] ?? 0);
  const cngScrap = Number(inputs["cng.scrapValue"] ?? 0);
  const evScrap = Number(inputs["ev.scrapValue"] ?? 0);

  const evChargerQty = Number(inputs["evInfra.chargerQuantity"] ?? 0);
  const evChargerCost = Number(inputs["evInfra.chargerCost"] ?? 0);
  const evInfraFunding = Number(inputs["evInfra.chargerFunding"] ?? 0);
  const evInfraInstallPerCharger = Number(
    inputs["evInfra.infrastructureCostPerCharger"] ?? 0
  );

  const cngStationInstallOn = Boolean(inputs["cngStation.installingStation"]);
  const cngStationInstallCost = Number(inputs["cngStation.installationCost"] ?? 0);

  const dieselFuelCost = Number(inputs["diesel.fuelCostPerGallon"] ?? 0);
  const cngFuelCost = Number(inputs["cng.fuelCostPerGGE"] ?? 0);
  const evEnergyCost = Number(inputs["utility.kWhPrice"] ?? 0);

  const dieselDownPaymentPct = Number(inputs["diesel.downPaymentPct"] ?? 0);
  const cngDownPaymentPct = Number(inputs["cng.downPaymentPct"] ?? 0);
  const evDownPaymentPct = Number(inputs["ev.downPaymentPct"] ?? 0);
  const evInfraDownPaymentPct = Number(inputs["evInfra.downPaymentPct"] ?? 0);
  const cngStationDownPaymentPct = Number(inputs["cngStation.downPaymentPct"] ?? 0);

  const dieselApr = Number(inputs["diesel.financingRateApr"] ?? 0);
  const cngApr = Number(inputs["cng.financingRateApr"] ?? 0);
  const evApr = Number(inputs["ev.financingRateApr"] ?? 0);
  const evInfraApr = Number(inputs["evInfra.financingRateApr"] ?? 0);
  const cngStationApr = Number(inputs["cngStation.financingRateApr"] ?? 0);

  const dieselLoanYears = Number(inputs["diesel.loanYears"] ?? 0);
  const cngLoanYears = Number(inputs["cng.loanYears"] ?? 0);
  const evLoanYears = Number(inputs["ev.loanYears"] ?? 0);
  const evInfraLoanYears = Number(inputs["evInfra.loanYears"] ?? 0);
  const cngStationLoanYears = Number(inputs["cngStation.loanYears"] ?? 0);

  const pct = (value: number) => `${(value * 100).toFixed(1)}%`;

  const inflationRate = Number(inputs["financial.inflationRate"] ?? 0);

  const dieselMaintenancePerMile = Number(inputs["diesel.maintenanceCostPerMile"] ?? 0);
  const cngMaintenancePerMile = Number(inputs["cng.maintenanceCostPerMile"] ?? 0);
  const evMaintenancePerMileBase = Number(inputs["ev.maintenanceCostPerMileBase"] ?? 0);
  const evOverrideMaintenance = Boolean(inputs["ev.overrideMaintenance"]);

  const dieselDefPerMile = Number(inputs["diesel.defCostPerMile"] ?? 0);

  const evCmsAnnual = Number(inputs["ev.cmsAnnualCost"] ?? 0);
  const cngStationMaintenanceAnnual = Number(inputs["cngStation.annualMaintenance"] ?? 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {activeTech.ev && (
          <Card title="Cost / Mile (EV)">
            <div className="text-2xl font-bold text-rush-black">
              {formatCurrencyPrecise(summary.costPerMile.ev)}
            </div>
            <div className="text-xs text-grayrush-medium mt-1">
              Based on year 1 operating cost
            </div>
          </Card>
        )}

        <Card title="Cost / Mile (Diesel)">
          <div className="text-2xl font-bold text-rush-black">
            {formatCurrencyPrecise(summary.costPerMile.diesel)}
          </div>
          <div className="text-xs text-grayrush-medium mt-1">
            Based on year 1 operating cost
          </div>
        </Card>

        {activeTech.cng && (
          <Card title="Cost / Mile (CNG)">
            <div className="text-2xl font-bold text-rush-black">
              {formatCurrencyPrecise(summary.costPerMile.cng)}
            </div>
            <div className="text-xs text-grayrush-medium mt-1">
              Based on year 1 operating cost
            </div>
          </Card>
        )}

        {activeTech.ev && (
          <Card title="Savings (EV vs Diesel)">
            <div
              className={`text-2xl font-bold ${
                evWinsLifetime ? "text-rush-black" : "text-rush-red"
              }`}
            >
              {formatCurrency(lifetimeSavingsEvVsDiesel)}
            </div>
            <div className="text-xs text-grayrush-medium mt-1">
              Cumulative through year {summary.horizonYears}
            </div>
          </Card>
        )}

        {activeTech.ev && (
          <Card title="Payback (EV)">
            <div className="text-2xl font-bold text-rush-black">
              {paybackEv === null ? "—" : `${paybackEv.toFixed(1)} yrs`}
            </div>
            <div className="text-xs text-grayrush-medium mt-1">
              Simple payback
            </div>
          </Card>
        )}

        {activeTech.cng && (
          <Card title="Savings (CNG vs Diesel)">
            <div
              className={`text-2xl font-bold ${
                cngWinsLifetime ? "text-rush-black" : "text-rush-red"
              }`}
            >
              {formatCurrency(lifetimeSavingsCngVsDiesel)}
            </div>
            <div className="text-xs text-grayrush-medium mt-1">
              Cumulative through year {summary.horizonYears}
            </div>
          </Card>
        )}

        {activeTech.cng && (
          <Card title="Payback (CNG)">
            <div className="text-2xl font-bold text-rush-black">
              {paybackCng === null ? "—" : `${paybackCng.toFixed(1)} yrs`}
            </div>
            <div className="text-xs text-grayrush-medium mt-1">
              Simple payback
            </div>
          </Card>
        )}

        <Card title="Annual Miles / Truck">
          <div className="text-2xl font-bold text-rush-black">
            {summary.annualMilesPerTruck.toLocaleString()}
          </div>
          <div className="text-xs text-grayrush-medium mt-1">
            Miles/day × work days
          </div>
        </Card>
      </div>

      <Card
        title="Analysis-Period Total Cost"
        right={
          <div className="text-xs text-grayrush-medium">
            Model horizon: {summary.horizonYears} yrs (Year 0: {summary.startYear})
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-xl2 border border-[rgba(0,0,0,0.05)] p-3">
            <div className="text-xs font-semibold text-grayrush-medium">
              Diesel
            </div>
            <div className="text-xl font-bold text-rush-black">
              {formatCurrency(dieselTotal)}
            </div>
          </div>

          {activeTech.cng && (
            <div className="rounded-xl2 border border-[rgba(0,0,0,0.05)] p-3">
              <div className="text-xs font-semibold text-grayrush-medium">
                CNG
              </div>
              <div className="text-xl font-bold text-rush-black">
                {formatCurrency(cngTotal)}
              </div>
            </div>
          )}

          {activeTech.ev && (
            <div
              className={`rounded-xl2 border p-3 ${
                evWinsLifetime
                  ? "border-[rgba(238,177,17,0.60)]"
                  : "border-[rgba(0,0,0,0.05)]"
              }`}
            >
              <div className="text-xs font-semibold text-grayrush-medium">
                Electric
              </div>
              <div className="text-xl font-bold text-rush-black">
                {formatCurrency(evTotal)}
              </div>
            </div>
          )}
        </div>

        {mode === "engineer" && (
          <div className="mt-4 text-xs text-grayrush-medium">
            This reflects modeled vehicle ownership and operation only. It does not
            include registrations, insurance, driver wages, tolls, or other
            non-modeled operating expenses.
          </div>
        )}
      </Card>

      <Card title="Assumptions Snapshot">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 print:grid-cols-3 gap-3 text-sm">
          <div className="rounded-xl2 border border-[rgba(0,0,0,0.05)] p-3 print:break-inside-avoid">
            <div className="text-xs font-semibold uppercase tracking-wide text-grayrush-medium">
              Analysis Window
            </div>
            <div className="mt-2 space-y-1 text-rush-black">
              <div>Horizon: {summary.horizonYears} years</div>
              <div>Start year: {summary.startYear}</div>
              <div>Annual miles / truck: {summary.annualMilesPerTruck.toLocaleString()}</div>
              <div>Fleet miles / year: {summary.fleetMilesPerYear.toLocaleString()}</div>
            </div>
          </div>
                    <div className="rounded-xl2 border border-[rgba(0,0,0,0.05)] p-3 print:break-inside-avoid">
            <div className="text-xs font-semibold uppercase tracking-wide text-grayrush-medium">
              Financial Assumptions
            </div>
            <div className="mt-2 space-y-1 text-rush-black">
              <div>Inflation rate: {pct(inflationRate)}</div>
            </div>
          </div>

         <div className="rounded-xl2 border border-[rgba(0,0,0,0.05)] p-3 print:break-inside-avoid">
            <div className="text-xs font-semibold uppercase tracking-wide text-grayrush-medium">
              Maintenance Assumptions
            </div>
            <div className="mt-2 space-y-1 text-rush-black">
              <div>Diesel maintenance: {formatCurrencyPrecise(dieselMaintenancePerMile)} / mile</div>

              {activeTech.cng && (
                <div>CNG maintenance: {formatCurrencyPrecise(cngMaintenancePerMile)} / mile</div>
              )}

              {activeTech.ev && (
                <>
                  <div>EV maintenance override: {evOverrideMaintenance ? "On" : "Off"}</div>
                  <div>EV maintenance base: {formatCurrencyPrecise(evMaintenancePerMileBase)} / mile</div>
                  {!evOverrideMaintenance && (
                    <div className="text-xs text-grayrush-medium pt-1">
                      When override is off, EV maintenance uses the built-in model rule.
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="rounded-xl2 border border-[rgba(0,0,0,0.05)] p-3 print:break-inside-avoid">
            <div className="text-xs font-semibold uppercase tracking-wide text-grayrush-medium">
              Vehicle Costs
            </div>
            <div className="mt-2 space-y-1 text-rush-black">
              <div>Diesel truck: {formatCurrency(dieselTruckCost)}</div>
              {activeTech.cng && <div>CNG truck: {formatCurrency(cngTruckCost)}</div>}
              {activeTech.ev && <div>EV truck: {formatCurrency(evTruckCost)}</div>}
            </div>
          </div>

          <div className="rounded-xl2 border border-[rgba(0,0,0,0.05)] p-3 print:break-inside-avoid">
            <div className="text-xs font-semibold uppercase tracking-wide text-grayrush-medium">
              Fuel / Energy Basis
            </div>
            <div className="mt-2 space-y-1 text-rush-black">
              <div>Diesel fuel: {formatCurrencyPrecise(dieselFuelCost)} / gal</div>
              {activeTech.cng && <div>CNG fuel: {formatCurrencyPrecise(cngFuelCost)} / GGE</div>}
              {activeTech.ev && (
                <>
                  <div>Electricity pricing: {touEnabled ? "Time-of-use" : "Flat rate"}</div>
                  <div>Electricity rate: {formatCurrencyPrecise(evEnergyCost)} / kWh</div>
                </>
              )}
            </div>
          </div>

          <div className="rounded-xl2 border border-[rgba(0,0,0,0.05)] p-3 print:break-inside-avoid">
            <div className="text-xs font-semibold uppercase tracking-wide text-grayrush-medium">
              Diesel Financing
            </div>
            <div className="mt-2 space-y-1 text-rush-black">
              <div>Down payment: {pct(dieselDownPaymentPct)}</div>
              <div>APR: {pct(dieselApr)}</div>
              <div>Loan term: {dieselLoanYears} yrs</div>
            </div>
          </div>

          {activeTech.cng && (
            <div className="rounded-xl2 border border-[rgba(0,0,0,0.05)] p-3 print:break-inside-avoid">
              <div className="text-xs font-semibold uppercase tracking-wide text-grayrush-medium">
                CNG Financing
              </div>
              <div className="mt-2 space-y-1 text-rush-black">
                <div>Truck down payment: {pct(cngDownPaymentPct)}</div>
                <div>Truck APR: {pct(cngApr)}</div>
                <div>Truck loan term: {cngLoanYears} yrs</div>
                <div>Station down payment: {pct(cngStationDownPaymentPct)}</div>
                <div>Station APR: {pct(cngStationApr)}</div>
                <div>Station loan term: {cngStationLoanYears} yrs</div>
              </div>
            </div>
          )}

          {activeTech.ev && (
            <div className="rounded-xl2 border border-[rgba(0,0,0,0.05)] p-3 print:break-inside-avoid">
              <div className="text-xs font-semibold uppercase tracking-wide text-grayrush-medium">
                EV Financing
              </div>
              <div className="mt-2 space-y-1 text-rush-black">
                <div>Truck down payment: {pct(evDownPaymentPct)}</div>
                <div>Truck APR: {pct(evApr)}</div>
                <div>Truck loan term: {evLoanYears} yrs</div>
                <div>Infrastructure down payment: {pct(evInfraDownPaymentPct)}</div>
                <div>Infrastructure APR: {pct(evInfraApr)}</div>
                <div>Infrastructure loan term: {evInfraLoanYears} yrs</div>
              </div>
            </div>
          )}

          {activeTech.ev && (
            <div className="rounded-xl2 border border-[rgba(0,0,0,0.05)] p-3 print:break-inside-avoid">
              <div className="text-xs font-semibold uppercase tracking-wide text-grayrush-medium">
                EV Infrastructure
              </div>
              <div className="mt-2 space-y-1 text-rush-black">
                <div>Chargers: {evChargerQty.toLocaleString()}</div>
                <div>Charger cost: {formatCurrency(evChargerCost)}</div>
                <div>
                  Installation / charger: {formatCurrency(evInfraInstallPerCharger)}
                </div>
                <div>Infrastructure funding: {formatCurrency(evInfraFunding)}</div>
              </div>
            </div>
          )}

          {activeTech.cng && (
            <div className="rounded-xl2 border border-[rgba(0,0,0,0.05)] p-3 print:break-inside-avoid">
              <div className="text-xs font-semibold uppercase tracking-wide text-grayrush-medium">
                CNG Station
              </div>
              <div className="mt-2 space-y-1 text-rush-black">
                <div>Station install: {cngStationInstallOn ? "On" : "Off"}</div>
                <div>Installation cost: {formatCurrency(cngStationInstallCost)}</div>
              </div>
            </div>
          )}

          <div className="rounded-xl2 border border-[rgba(0,0,0,0.05)] p-3 print:break-inside-avoid">
            <div className="text-xs font-semibold uppercase tracking-wide text-grayrush-medium">
              Incentives / Scrap
            </div>
            <div className="mt-2 space-y-1 text-rush-black">
              <div>Grant toggle: {grantsEnabled ? "On" : "Off"}</div>
              <div>Scrap toggle: {scrapEnabled ? "On" : "Off"}</div>
              <div>Diesel grant: {formatCurrency(dieselGrant)}</div>
              {activeTech.cng && <div>CNG grant: {formatCurrency(cngGrant)}</div>}
              {activeTech.ev && <div>EV grant: {formatCurrency(evGrant)}</div>}
              <div>Diesel scrap: {formatCurrency(dieselScrap)}</div>
              {activeTech.cng && <div>CNG scrap: {formatCurrency(cngScrap)}</div>}
              {activeTech.ev && <div>EV scrap: {formatCurrency(evScrap)}</div>}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}