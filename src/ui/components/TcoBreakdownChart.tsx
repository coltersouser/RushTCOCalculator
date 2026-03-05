import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

import type { CalcSummary } from "../../engine/calc";
import { Card } from "./Card";

function fmtCurrency(v: number) {
  const n = Math.round(v || 0);
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function TcoBreakdownChart({ summary }: { summary: CalcSummary }) {

  const data = [
    {
      name: "Diesel",
      Fuel: summary.costPerYear.diesel * 0.55,
      Maintenance: summary.costPerYear.diesel * 0.25,
      Financing: summary.costPerYear.diesel * 0.20,
    },
    {
      name: "CNG",
      Fuel: summary.costPerYear.cng * 0.45,
      Maintenance: summary.costPerYear.cng * 0.25,
      Infrastructure: summary.costPerYear.cng * 0.10,
      Financing: summary.costPerYear.cng * 0.20,
    },
    {
      name: "EV",
      Energy: summary.costPerYear.ev * 0.35,
      Maintenance: summary.costPerYear.ev * 0.15,
      Demand: summary.costPerYear.ev * 0.20,
      Infrastructure: summary.costPerYear.ev * 0.10,
      Financing: summary.costPerYear.ev * 0.20,
    },
  ];

  return (
    <Card title="Total Cost Breakdown">
      <div className="h-80">

        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} stackOffset="none">

            <XAxis dataKey="name" />
            <YAxis tickFormatter={(v) => fmtCurrency(v)} width={110} />

            <Tooltip formatter={(v) => fmtCurrency(Number(v))} />

            <Legend />

            <Bar dataKey="Fuel" stackId="a" fill="#ed1c24" />
            <Bar dataKey="Energy" stackId="a" fill="#eeb111" />

            <Bar dataKey="Maintenance" stackId="a" fill="#939598" />

            <Bar dataKey="Demand" stackId="a" fill="#4b4c4c" />

            <Bar dataKey="Infrastructure" stackId="a" fill="#6b7280" />

            <Bar dataKey="Financing" stackId="a" fill="#111111" />

          </BarChart>
        </ResponsiveContainer>

      </div>
    </Card>
  );
}