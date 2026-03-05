import { ResponsiveContainer, ComposedChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts";
import type { CalcSummary, Powertrain } from "../../engine/calc";
import { Card } from "./Card";
import { formatCurrency } from "../../utils/format";

type Row = { label: string; start: number; delta: number; end: number };

export function Year0Waterfall({ summary, powertrain }: { summary: CalcSummary; powertrain: Powertrain }) {
  const items = summary.year0Breakdown[powertrain] ?? [];

  let running = 0;
  const rows: Row[] = items.map((it) => {
    const start = running;
    const end = running + it.value;
    running = end;
    return { label: it.label, start, delta: it.value, end };
  });

  // Recharts bar needs a single value; we can use a stacked trick: invisible "start" + visible "delta"
  const data = rows.map((r) => ({
    label: r.label,
    start: Math.min(r.start, r.end),
    delta: Math.abs(r.delta),
    isNegative: r.delta < 0,
    rawDelta: r.delta,
  }));

  return (
    <Card title={`Year 0 Waterfall (${powertrain.toUpperCase()})`}>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} height={70} />
            <YAxis tickFormatter={(v) => formatCurrency(Number(v))} width={120} />
            <Tooltip
              formatter={(v, name, props) =>
                name === "delta" ? formatCurrency(Number((props as any).payload.rawDelta)) : ""
              }
            />
            <ReferenceLine y={0} stroke="#939598" strokeDasharray="4 4" />
            <Bar dataKey="start" stackId="a" fill="rgba(0,0,0,0)" />
            <Bar
              dataKey="delta"
              stackId="a"
              fill="#eeb111"
              // color negative deltas differently without hardcoding per theme is tricky;
              // keep single fill for now and rely on tooltip showing +/- values.
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 text-xs text-grayrush-medium">
        Each step shows the running net Year-0 cash outlay (grants/funding reduce the total).
      </div>
    </Card>
  );
}