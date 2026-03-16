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
import { Year0DivergingBar } from "./components/Year0DivergingBar";
import { Year0WaterfallSwitcher } from "./components/Year0WaterfallSwitcher";

export function App() {
  const [mode, setMode] = useState<Mode>("engineer");
  const [inputs, setInputs] = useState<Inputs>(() => buildDefaultInputs());
  const [activeTech, setActiveTech] = useState({
    diesel: true,
    cng: true,
    ev: true,
  });

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
      {issues.length > 0 && (
        <a
          href="#model-warnings"
          className="fixed right-6 top-6 z-50 flex items-center gap-2 rounded-full border-2 border-amber-500 bg-amber-100 px-4 py-2 shadow-lg"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-2xl font-bold text-white">
            !
          </div>
          <div className="text-sm font-bold text-amber-900">
            {issues.length} warning{issues.length === 1 ? "" : "s"}
          </div>
        </a>
      )}

      <header className="sticky top-0 z-20 bg-white border-b border-[rgba(0,0,0,0.10)]">
        <div className="mx-auto max-w-[1400px] px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src={rushLogo} alt="Rush Truck Centers" className="h-15 md:h-20 object-contain w-auto" />
            <div className="leading-tight">
              <div className="text-[28px] font-bold text-rush-black uppercase tracking-wide">
                Alternative Fuel ROI Calculator
              </div>
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
            <div className="border-b border-[rgba(0,0,0,0.06)] px-4 py-3">
              <div className="text-xs font-bold uppercase tracking-wide text-grayrush-medium mb-2">
                Comparison Set
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled
                  className="px-3 py-2 rounded-lg text-sm font-bold uppercase tracking-wide border bg-rush-red text-white border-rush-black opacity-90 cursor-default"
                >
                  Diesel (Baseline)
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTech((prev) => ({ ...prev, cng: !prev.cng }))}
                  className={`px-3 py-2 rounded-lg text-sm font-bold uppercase tracking-wide border transition ${
                    activeTech.cng
                      ? "bg-rush-black text-white border-rush-black"
                      : "bg-white text-rush-black border-[rgba(0,0,0,0.15)] hover:bg-gray-50"
                  }`}
                >
                  COMPARE CNG
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTech((prev) => ({ ...prev, ev: !prev.ev }))}
                  className={`px-3 py-2 rounded-lg text-sm font-bold uppercase tracking-wide border transition ${
                    activeTech.ev
                      ? "bg-rush-gold text-rush-black border-rush-black"
                      : "bg-white text-rush-black border-[rgba(0,0,0,0.15)] hover:bg-gray-50"
                  }`}
                >
                  COMPARE EV
                </button>
              </div>
            </div>

            <InputPanel
              mode={mode}
              inputs={inputs}
              setInput={setInput}
              errorsByKey={errorsByKey}
              activeTech={activeTech}
            />
          </section>

          <section className="space-y-4">
            {issues.length > 0 && (
              <div
                id="model-warnings"
                className="rounded-2xl border-2 border-amber-400 bg-amber-50 px-5 py-4 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber-400 text-3xl font-bold text-white">
                    !
                  </div>

                  <div className="min-w-0">
                    <div className="text-lg font-bold text-amber-900">
                      Warning: model inputs need attention
                    </div>
                    <div className="mt-1 text-sm text-amber-900">
                      {issues.length} warning{issues.length === 1 ? "" : "s"} detected. Results may still calculate,
                      but one or more assumptions may be incomplete or inconsistent.
                    </div>

                    <ul className="mt-3 list-disc pl-5 text-sm text-amber-900">
                      {issues.slice(0, 5).map((issue) => (
                        <li key={`${issue.key}-${issue.message}`}>{issue.message}</li>
                      ))}
                    </ul>

                    {issues.length > 5 && (
                      <div className="mt-2 text-sm font-medium text-amber-900">
                        + {issues.length - 5} more warning{issues.length - 5 === 1 ? "" : "s"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <ResultsDashboard
              summary={summary}
              mode={mode}
              activeTech={activeTech}
              inputs={inputs}
/>
            <ChartsPanel summary={summary} activeTech={activeTech} />
            <Year0DivergingBar summary={summary} activeTech={activeTech} />
            <Year0WaterfallSwitcher summary={summary} activeTech={activeTech} />
          </section>
        </div>
      </main>
    </div>
  );
}