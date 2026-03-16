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

    const reportDate = new Date().toLocaleDateString();
      const reportTimestamp = new Date().toLocaleString();
      const reportVersion = "Internal v1.0";

      const scenarioName =
        typeof inputs["report.scenarioName"] === "string" && inputs["report.scenarioName"]
          ? String(inputs["report.scenarioName"])
          : "Current Scenario";

      const customerName =
        typeof inputs["report.customerName"] === "string" && inputs["report.customerName"]
          ? String(inputs["report.customerName"])
          : "________________";


  function setInput(key: string, value: number | boolean | string | null) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {issues.length > 0 && (
        <a
          href="#model-warnings"
          className="fixed right-6 top-6 z-50 flex items-center gap-2 rounded-full border-2 border-amber-500 bg-amber-100 px-4 py-2 shadow-lg print:hidden"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-2xl font-bold text-white">
            !
          </div>
          <div className="text-sm font-bold text-amber-900">
            {issues.length} warning{issues.length === 1 ? "" : "s"}
          </div>
        </a>
      )}

      <header className="sticky top-0 z-20 border-b border-[rgba(0,0,0,0.10)] bg-white print:hidden">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <img src={rushLogo} alt="Rush Truck Centers" className="h-25 w-auto object-contain md:h-30 lg:h-" />
            <div className="leading-tight">
              <div className="text-[28px] font-bold uppercase tracking-wide text-rush-black">
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
              className="rounded-lg border border-rush-gold bg-rush-gold px-3 py-2 text-sm font-bold uppercase tracking-wide text-rush-black transition hover:brightness-95"
              onClick={() => window.print()}
              title="Print / Save as PDF"
            >
              Generate Report
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-4 p-4 lg:grid-cols-[420px_1fr] print:max-w-none print:grid-cols-1 print:p-0">
          <section className="h-[calc(100vh-120px)] overflow-hidden rounded-xl2 border border-[rgba(0,0,0,0.05)] bg-white shadow-card print:hidden">
            <div className="border-b border-[rgba(0,0,0,0.06)] px-4 py-3">
              <div className="mb-2 text-xs font-bold uppercase tracking-wide text-grayrush-medium">
                Comparison Set
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled
                  className="cursor-default rounded-lg border border-rush-black bg-rush-red px-3 py-2 text-sm font-bold uppercase tracking-wide text-white opacity-90"
                >
                  Diesel (Baseline)
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTech((prev) => ({ ...prev, cng: !prev.cng }))}
                  className={`rounded-lg border px-3 py-2 text-sm font-bold uppercase tracking-wide transition ${
                    activeTech.cng
                      ? "border-rush-black bg-rush-black text-white"
                      : "border-[rgba(0,0,0,0.15)] bg-white text-rush-black hover:bg-gray-50"
                  }`}
                >
                  COMPARE CNG
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTech((prev) => ({ ...prev, ev: !prev.ev }))}
                  className={`rounded-lg border px-3 py-2 text-sm font-bold uppercase tracking-wide transition ${
                    activeTech.ev
                      ? "border-rush-black bg-rush-gold text-rush-black"
                      : "border-[rgba(0,0,0,0.15)] bg-white text-rush-black hover:bg-gray-50"
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

          <section className="space-y-4 print:space-y-3">
            <div className="hidden border-b border-[rgba(0,0,0,0.12)] pb-5 print:block">
              <div className="flex items-start justify-between gap-6">
                <div className="flex items-center gap-4">
                  <img src={rushLogo} alt="Rush Truck Centers" className="h-25 w-auto object-contain" />
                  <div>
                    <div className="text-3xl font-bold uppercase tracking-wide text-rush-black">
                      Alternative Fuel ROI Report
                    </div>
                    <div className="mt-1 text-sm text-grayrush-medium">
                      Rush Truck Centers
                    </div>
                  </div>
                </div>

                <div className="min-w-[260px] rounded-xl border border-[rgba(0,0,0,0.08)] bg-[rgba(0,0,0,0.02)] px-4 py-3 text-sm">
                  <div className="grid grid-cols-[110px_1fr] gap-y-1 text-rush-black">
                    <div className="font-semibold">Customer:</div>
                    <div>{customerName}</div>

                    <div className="font-semibold">Date:</div>
                    <div>{reportDate}</div>

                    <div className="font-semibold">Scenario:</div>
                    <div>{scenarioName}</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-xs text-grayrush-medium">
                <div>Generated: {reportTimestamp}</div>
                <div className="text-center">{reportVersion}</div>
                <div className="text-right">
                  Model horizon: {summary.horizonYears} years • Start year: {summary.startYear}
                </div>
              </div>
            </div>

            {issues.length > 0 && (
              <div
                id="model-warnings"
                className="rounded-2xl border-2 border-amber-400 bg-amber-50 px-5 py-4 shadow-sm print:break-inside-avoid"
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
                      {issues.slice(0, 8).map((issue) => (
                        <li key={`${issue.key}-${issue.message}`}>{issue.message}</li>
                      ))}
                    </ul>

                    {issues.length > 8 && (
                      <div className="mt-2 text-sm font-medium text-amber-900">
                        + {issues.length - 8} more warning{issues.length - 8 === 1 ? "" : "s"}
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

            <div className="print-avoid-break">
              <ChartsPanel summary={summary} activeTech={activeTech} />
            </div>

            <div className="print-avoid-break">
              <Year0DivergingBar summary={summary} activeTech={activeTech} />
            </div>

            <div className="print-avoid-break">
              <Year0WaterfallSwitcher summary={summary} activeTech={activeTech} />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}