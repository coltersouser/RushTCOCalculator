import { useMemo, useState } from "react";
import type { Inputs, Mode } from "../types/schema";
import { buildDefaultInputs } from "../engine/defaultInputs";
import { calculate } from "../engine/calc";
import { validateInputs } from "../engine/validate";
import { InputPanel } from "./components/InputPanel";
import { ResultsDashboard } from "./components/ResultsDashboard";
import { ChartsPanel } from "./components/ChartsPanel";
import { ModeToggle } from "./components/ModeToggle";
import { ScenarioManager } from "./components/ScenarioManager";
import rushLogo from "../assets/rush-logo.png";
import { TcoBreakdownChart } from "./components/TcoBreakdownChart";
import { Year0DivergingBar } from "./components/Year0DivergingBar";
import { Year0Waterfall } from "./components/Year0Waterfall";



export function App() {
  const [mode, setMode] = useState<Mode>("engineer");
  const [inputs, setInputs] = useState<Inputs>(() => buildDefaultInputs());

  const issues = validateInputs(inputs);
  const errorsByKey = useMemo(() => {
    const map: Record<string, string> = {};
    for (const i of issues) map[i.key] = i.message;
    return map;
  }, [issues]);

  const summary = useMemo(() => calculate(inputs), [inputs]);

  function setInput(key: string, value: number | boolean | null) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-20 bg-white border-b border-[rgba(0,0,0,0.10)]">
  <div className="mx-auto max-w-[1400px] px-4 py-3 flex items-center justify-between gap-3">
    <div className="flex items-center gap-3">
      <img src={rushLogo} alt="Rush Truck Centers" className="h-15 md:h-20 object-contain w-auto" />
      <div className="leading-tight">
        <div className="text-[28px] font-bold text-rush-black uppercase tracking-wide">Alternative Fuel ROI Calculator</div>
        <div className="text-xs text-grayrush-medium">Hybrid: Sales ↔ Engineer</div>
      </div>
    </div>

    <div className="flex items-center gap-2">
      <ScenarioManager inputs={inputs} onLoad={(loaded) => setInputs(loaded)} />
      <ModeToggle mode={mode} onChange={setMode} />
      <button
        type="button"
        className="rounded-lg bg-rush-gold px-3 py-2 text-sm font-bold text-rush-black uppercase tracking-wide hover:brightness-95 transition border border-rush-gold"
        onClick={() => window.print()}
        title="Print / Save as PDF"
      >
        Generate Report
      </button>
    </div>
  </div>
</header>

      <main className="flex-1">
        <div className="mx-auto max-w-[1400px] p-4 grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-4">
          <section className="h-[calc(100vh-120px)] rounded-xl2 overflow-hidden border border-[rgba(0,0,0,0.05)] shadow-card bg-white">
            <InputPanel mode={mode} inputs={inputs} setInput={setInput} errorsByKey={errorsByKey} />
          </section>

          <section className="space-y-4">
            

            <ResultsDashboard summary={summary} mode={mode} />
            <ChartsPanel summary={summary} />
            <TcoBreakdownChart summary={summary} />

             {/* Year 0 visuals */}
            <Year0DivergingBar summary={summary} />
            <Year0Waterfall summary={summary} powertrain="ev" />

            
            
          </section>
        </div>
      </main>
    </div>
  );
}
