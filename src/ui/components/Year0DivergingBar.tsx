import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import type { CalcSummary, Powertrain } from "../../engine/calc";
import { Card } from "./Card";
import { formatCurrency } from "../../utils/format";

function sumPos(items: { value: number }[]) {
  return items.reduce((a, x) => a + (x.value > 0 ? x.value : 0), 0);
}
function sumNeg(items: { value: number }[]) {
  return items.reduce((a, x) => a + (x.value < 0 ? x.value : 0), 0);
}

export function Year0DivergingBar({
  summary,
  activeTech,
}: {
  summary: CalcSummary;
  activeTech: { diesel: boolean; cng: boolean; ev: boolean };
}) {
  const mk = (p: Powertrain) => {
    const items = summary.year0Breakdown[p] ?? [];
    return {
      name: p.toUpperCase(),
      Costs: sumPos(items),
      Offsets: sumNeg(items), // negative number
      Net: sumPos(items) + sumNeg(items),
    };
  };

  const rawData = [mk("diesel"), mk("cng"), mk("ev")];

const data = rawData.filter((row) => {
  if (row.name === "DIESEL") return activeTech.diesel;
  if (row.name === "CNG") return activeTech.cng;
  if (row.name === "EV") return activeTech.ev;
  return true;
});

  return (
    <Card title="Year 0 Capital Stack (Costs vs Offsets)">
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} stackOffset="sign">
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(v) => formatCurrency(Number(v))} width={110} />
            <Tooltip formatter={(v) => formatCurrency(Number(v))} />
            <Legend />
            <Bar dataKey="Offsets" stackId="a" fill="#4b4c4c" />
            <Bar dataKey="Costs" stackId="a" fill="#eeb111" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 text-xs text-grayrush-medium">
        Offsets are Year 0 inflows (grants/funding). Net = costs + offsets.
      </div>
    </Card>
  );
}