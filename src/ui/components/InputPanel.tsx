import { useMemo, useState } from "react";
import type { Inputs, Mode } from "../../types/schema";
import { inputSchema } from "../../schema/inputs.schema";
import { Field } from "./Field";

function shouldShowField(inputs: Inputs, key: string): boolean {
  const f = inputSchema.fields.find((x) => x.key === key);
  if (!f) return true;
  if (!f.showWhen || f.showWhen.length === 0) return true;
  return f.showWhen.every((r) => inputs[r.key] === r.equals);
}


export function InputPanel({
  mode,
  inputs,
  setInput,
  errorsByKey,
  activeTech,
}: {
  mode: "sales" | "engineer";
  inputs: Inputs;
  setInput: (key: string, value: number | boolean | null) => void;
  errorsByKey: Record<string, string>;
  activeTech: { diesel: boolean; cng: boolean; ev: boolean };
}) 
{
  function isFieldVisible(key: string) {
    if (key.startsWith("diesel.")) return true; // diesel always on
    if (key.startsWith("cng.") || key.startsWith("cngStation.")) return activeTech.cng;
    if (key.startsWith("ev.") || key.startsWith("evInfra.") || key.startsWith("utility.")) return activeTech.ev;
    return true;
  }

  // rest of component...


  const [query, setQuery] = useState("");

  const groups = useMemo(() => [...inputSchema.groups].sort((a, b) => a.order - b.order), []);

  const fieldsByGroup = useMemo(() => {
  const map = new Map<string, typeof inputSchema.fields>();
  for (const g of groups) map.set(g.id, []);

  for (const f of inputSchema.fields) {
    if (mode === "sales" && f.advanced) continue;

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      if (!(f.label.toLowerCase().includes(q) || f.key.toLowerCase().includes(q))) continue;
    }

    if (!shouldShowField(inputs, f.key)) continue;
    if (!isFieldVisible(f.key)) continue;   // <-- ADD THIS

    (map.get(f.group) ?? []).push(f);
  }

  return map;
}, [groups, mode, query, inputs, activeTech]);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-[rgba(0,0,0,0.05)] bg-white">
        <div className="text-lg font-bold tracking-wide text-rush-black uppercase">Inputs</div>
        <div className="mt-2">
          <input
            className="w-full rounded-lg border border-[rgba(0,0,0,0.10)] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[rgba(238,177,17,0.40)]"
            placeholder="Search inputs…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="mt-2 text-xs text-grayrush-medium">
            {mode === "sales" ? "Sales Mode: essential inputs only" : "Engineer Mode: full model controls"}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-3">
        {groups.map((g) => {
          const fields = fieldsByGroup.get(g.id) ?? [];
          if (fields.length === 0) return null;

          const openByDefault =
            mode === "sales" ? ["general", "diesel", "ev", "cng"].includes(g.id) : false;

          return (
            <details key={g.id} className="rounded-xl2 bg-white shadow-card border border-[rgba(0,0,0,0.05)]" open={openByDefault}>
              <summary className="cursor-pointer select-none px-4 py-3 border-b border-[rgba(0,0,0,0.05)] flex items-center justify-between">
                <span className="text-base md:text-lg font-bold tracking-wide text-rush-black uppercase">{g.label}</span>
                <span className="text-xs text-grayrush-medium">{fields.length} fields</span>
              </summary>
              <div className="p-4 space-y-4">

              

                {fields.filter((f) => isFieldVisible(f.key)).map((f) => (
                  <Field key={f.key} field={f} value={inputs[f.key]} onChange={setInput} error={errorsByKey[f.key]} />
                ))}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
