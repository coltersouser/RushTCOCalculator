import { useState } from "react";
import type { CalcSummary, Powertrain } from "../../engine/calc";
import { Year0Waterfall } from "./Year0Waterfall";

export function Year0WaterfallSwitcher({ summary }: { summary: CalcSummary }) {
  const [selectedPowertrain, setSelectedPowertrain] = useState<Powertrain>("ev");

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSelectedPowertrain("diesel")}
          className={`px-3 py-2 rounded-lg text-sm font-bold uppercase tracking-wide border transition ${
            selectedPowertrain === "diesel"
              ? "bg-rush-red text-white border-rush-red"
              : "bg-white text-rush-black border-[rgba(0,0,0,0.15)] hover:bg-gray-50"
          }`}
        >
          Diesel
        </button>

        <button
          type="button"
          onClick={() => setSelectedPowertrain("cng")}
          className={`px-3 py-2 rounded-lg text-sm font-bold uppercase tracking-wide border transition ${
            selectedPowertrain === "cng"
              ? "bg-rush-gold text-rush-black border-rush-gold"
              : "bg-white text-rush-black border-[rgba(0,0,0,0.15)] hover:bg-gray-50"
          }`}
        >
          CNG
        </button>

        <button
          type="button"
          onClick={() => setSelectedPowertrain("ev")}
          className={`px-3 py-2 rounded-lg text-sm font-bold uppercase tracking-wide border transition ${
            selectedPowertrain === "ev"
              ? "bg-rush-black text-white border-rush-black"
              : "bg-white text-rush-black border-[rgba(0,0,0,0.15)] hover:bg-gray-50"
          }`}
        >
          EV
        </button>
      </div>

      <Year0Waterfall summary={summary} powertrain={selectedPowertrain} />
    </div>
  );
}
