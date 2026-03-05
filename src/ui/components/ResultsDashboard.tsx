import type { CalcSummary } from "../../engine/calc";
import { Card } from "./Card";
import { formatCurrencyPrecise, formatCurrency } from "../../utils/format";

export function ResultsDashboard({ summary, mode }: { summary: CalcSummary; mode: "sales" | "engineer" }) {
  const lastIdx = summary.series.years.length - 1;

  const lifetimeSavingsEvVsDiesel =
    (summary.series.cumulativeCost.diesel[lastIdx] ?? 0) -
    (summary.series.cumulativeCost.ev[lastIdx] ?? 0);

  const lifetimeSavingsCngVsDiesel =
    (summary.series.cumulativeCost.diesel[lastIdx] ?? 0) -
    (summary.series.cumulativeCost.cng[lastIdx] ?? 0);

  const evWinsLifetime = lifetimeSavingsEvVsDiesel > 0;

  const paybackCng = summary.paybackYears.cng; // number | null

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card title="Cost / Mile (EV)">
          <div className="text-2xl font-bold text-rush-black">{formatCurrencyPrecise(summary.costPerMile.ev)}</div>
          <div className="text-xs text-grayrush-medium mt-1">All-in model (Year 1)</div>
        </Card>

        <Card title="Cost / Mile (Diesel)">
          <div className="text-2xl font-bold text-rush-black">{formatCurrencyPrecise(summary.costPerMile.diesel)}</div>
          <div className="text-xs text-grayrush-medium mt-1">All-in model (Year 1)</div>
        </Card>

        <Card title="Cost / Mile (CNG)">
          <div className="text-2xl font-bold text-rush-black">{formatCurrencyPrecise(summary.costPerMile.cng)}</div>
          <div className="text-xs text-grayrush-medium mt-1">All-in model (Year 1)</div>
        </Card>

        <Card title="Lifetime Savings EV over Diesel">
          <div className={`text-2xl font-bold ${evWinsLifetime ? "text-rush-black" : "text-rush-red"}`}>
            {formatCurrency(lifetimeSavingsEvVsDiesel)}
          </div>
          <div className="text-xs text-grayrush-medium mt-1">EV vs Diesel</div>
        </Card>

        <Card title="Payback (EV)">
          <div className="text-2xl font-bold text-rush-black">
            {summary.paybackYears.ev === null ? "—" : `${summary.paybackYears.ev.toFixed(1)} yrs`}
          </div>
          <div className="text-xs text-grayrush-medium mt-1">Simple payback</div>
        </Card>

        <Card title="Lifetime Savings CNG over Diesel">
          <div className={`text-2xl font-bold ${lifetimeSavingsCngVsDiesel > 0 ? "text-rush-black" : "text-rush-red"}`}>
            {formatCurrency(lifetimeSavingsCngVsDiesel)}
          </div>
          <div className="text-xs text-grayrush-medium mt-1">CNG vs Diesel</div>
        </Card>

        <Card title="Payback (CNG)">
          <div className="text-2xl font-bold text-rush-black">
            {paybackCng === null ? "—" : `${paybackCng.toFixed(1)} yrs`}
          </div>
          <div className="text-xs text-grayrush-medium mt-1">Simple payback</div>
        </Card>

        <Card title="Annual Miles / Truck">
          <div className="text-2xl font-bold text-rush-black">{summary.annualMilesPerTruck.toLocaleString()}</div>
          <div className="text-xs text-grayrush-medium mt-1">Miles/day × work days</div>
        </Card>
      </div>

      <Card
        title="Total Cost of Ownership (Lifetime)"
        right={<div className="text-xs text-grayrush-medium">Model horizon: {summary.horizonYears} yrs (Year 0: {summary.startYear})</div>}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-xl2 border border-[rgba(0,0,0,0.05)] p-3">
            <div className="text-xs font-semibold text-grayrush-medium">Diesel</div>
            <div className="text-xl font-bold text-rush-black">{formatCurrency(summary.fiveYearTco.diesel)}</div>
          </div>
          <div className="rounded-xl2 border border-[rgba(0,0,0,0.05)] p-3">
            <div className="text-xs font-semibold text-grayrush-medium">CNG</div>
            <div className="text-xl font-bold text-rush-black">{formatCurrency(summary.fiveYearTco.cng)}</div>
          </div>
          <div className={`rounded-xl2 border p-3 ${summary.fiveYearSavingsVsDiesel.ev > 0 ? "border-[rgba(238,177,17,0.60)]" : "border-[rgba(0,0,0,0.05)]"}`}>
            <div className="text-xs font-semibold text-grayrush-medium">Electric</div>
            <div className="text-xl font-bold text-rush-black">{formatCurrency(summary.fiveYearTco.ev)}</div>
          </div>
        </div>

        {mode === "engineer" && (
          <div className="mt-4 text-xs text-grayrush-medium">
            This shows all in cost for vehicle operation only. Doesnt include Registrations, Insurance, Driver, Tolls, etc.
          </div>
        )}
      </Card>
    </div>
  );
}