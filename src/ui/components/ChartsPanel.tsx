import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";
import type { CalcSummary } from "../../engine/calc";
import { Card } from "./Card";

export function ChartsPanel({ summary }: { summary: CalcSummary }) {
  const data = summary.series.years.map((y, idx) => ({
    year: summary.startYear + y,
    diesel: summary.series.cumulativeCost.diesel[idx],
    cng: summary.series.cumulativeCost.cng[idx],
    ev: summary.series.cumulativeCost.ev[idx]
  }));

  return (
    <Card title="Cumulative Cost (Placeholder Cashflow)">
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="year" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={90} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="diesel" stroke="#ed1c24" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="cng" stroke="#4b4c4c" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="ev" stroke="#eeb111" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 text-xs text-grayrush-medium">
        Next: swap this to your detailed yearly cashflows (capex, fuel, maint, infra, credits, etc.).
      </div>
    </Card>
  );
}
