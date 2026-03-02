import type { Mode } from "../../types/schema";

export function ModeToggle({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-[rgba(0,0,0,0.10)] bg-white p-1">
      <button
        className={`px-3 py-1.5 text-sm font-semibold rounded-full transition ${
          mode === "sales" ? "bg-rush-gold text-rush-black" : "text-grayrush-dark hover:bg-grayrush-light"
        }`}
        onClick={() => onChange("sales")}
        type="button"
      >
        Sales
      </button>
      <button
        className={`px-3 py-1.5 text-sm font-semibold rounded-full transition ${
          mode === "engineer" ? "bg-rush-gold text-rush-black" : "text-grayrush-dark hover:bg-grayrush-light"
        }`}
        onClick={() => onChange("engineer")}
        type="button"
      >
        Engineer
      </button>
    </div>
  );
}
