import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  Label,
} from "recharts";
import type { CalcSummary } from "../../engine/calc";
import { Card } from "./Card";

function fmtCurrency(v: number) {
  const n = Number.isFinite(v) ? Math.round(v) : 0;
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function findPaybackYear(data: Array<{ year: number; value: number }>): number | null {
  // Finds first crossing from negative -> >= 0 and linearly interpolates
  for (let i = 1; i < data.length; i++) {
    const prev = data[i - 1].value;
    const cur = data[i].value;
    if (prev < 0 && cur >= 0) {
      const delta = cur - prev;
      if (Math.abs(delta) < 1e-9) return data[i].year;
      const frac = (0 - prev) / delta; // 0..1
      const yearPrev = data[i - 1].year;
      return yearPrev + frac * (data[i].year - yearPrev);
    }
  }
  return null;
}

export function ChartsPanel({ summary }: { summary: CalcSummary }) {
  const data = summary.series.years.map((y, idx) => {
    const dieselCum = summary.series.cumulativeCost.diesel[idx] ?? 0;
    const cngCum = summary.series.cumulativeCost.cng[idx] ?? 0;
    const evCum = summary.series.cumulativeCost.ev[idx] ?? 0;

    return {
      year: summary.startYear + y,
      diesel: dieselCum,
      cng: cngCum,
      ev: evCum,
      cngSavings: dieselCum - cngCum,
      evSavings: dieselCum - evCum,
    };
  });

  const evPayback = findPaybackYear(data.map((d) => ({ year: d.year, value: d.evSavings })));
  const cngPayback = findPaybackYear(data.map((d) => ({ year: d.year, value: d.cngSavings })));

  // Put labels near the last point (keeps it simple & readable)
  const last = data[data.length - 1];
  const paybackLabel =
    evPayback || cngPayback
      ? [
          evPayback ? `EV Payback: ${evPayback.toFixed(1)} yrs` : null,
          cngPayback ? `CNG Payback: ${cngPayback.toFixed(1)} yrs` : null,
        ]
          .filter(Boolean)
          .join(" • ")
      : "Payback: N/A";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Cumulative Cost (Cashflow-Based)">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="year" tickLine={false} axisLine={false} />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={110}
                tickFormatter={(v) => fmtCurrency(v).replace("$", "$")}
              />
              <Tooltip
                formatter={(value) => fmtCurrency(Number(value))}
                labelFormatter={(label) => `Year ${label}`}
              />
              <Legend />
              <Line type="monotone" dataKey="diesel" stroke="#ed1c24" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="cng" stroke="#4b4c4c" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="ev" stroke="#eeb111" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 text-xs text-grayrush-medium">
          Includes Year 0 capex, annual operating costs, financing payments, and residual value timing. (Chargers and Infrastructure show a residual based on lifespan differences between those and the Truck)
        </div>
      </Card>

      <Card title="Cumulative Savings vs Diesel (ROI Curve)">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="year" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} width={110} tickFormatter={(v) => fmtCurrency(v)} />
              <Tooltip formatter={(value) => fmtCurrency(Number(value))} labelFormatter={(label) => `Year ${label}`} />
              <Legend />

              {/* $0 reference line */}
              <ReferenceLine y={0} stroke="#939598" strokeDasharray="4 4">
                <Label value="Payback Line ($0)" position="insideTopLeft" fill="#939598" fontSize={12} />
              </ReferenceLine>

              <Line type="monotone" dataKey="cngSavings" name="CNG Savings" stroke="#4b4c4c" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="evSavings" name="EV Savings" stroke="#eeb111" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 text-xs text-grayrush-medium">
          {paybackLabel}. Positive values mean the alternative has saved money vs diesel.
        </div>
      </Card>
    </div>
  );
}