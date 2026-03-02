import type { Inputs } from "../../types/schema";

type SavedScenario = { name: string; inputs: Inputs; savedAt: string };
const KEY = "rush-roi:scenarios:v1";

function loadAll(): SavedScenario[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedScenario[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
function saveAll(items: SavedScenario[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function ScenarioManager({ inputs, onLoad }: { inputs: Inputs; onLoad: (inputs: Inputs) => void }) {
  const scenarios = loadAll();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-rush-black border border-[rgba(0,0,0,0.10)] hover:bg-grayrush-light transition"
        onClick={() => {
          const name = prompt("Scenario name:");
          if (!name) return;
          const updated = [{ name, inputs, savedAt: new Date().toISOString() }, ...scenarios].slice(0, 25);
          saveAll(updated);
          alert("Scenario saved.");
        }}
      >
        Save
      </button>

      <select
        className="rounded-lg bg-white px-3 py-2 text-sm text-rush-black border border-[rgba(0,0,0,0.10)] outline-none"
        defaultValue=""
        onChange={(e) => {
          const val = e.target.value;
          if (!val) return;
          const sc = scenarios.find((s) => s.savedAt === val);
          if (!sc) return;
          onLoad(sc.inputs);
          e.currentTarget.value = "";
        }}
      >
        <option value="" disabled>
          Load…
        </option>
        {scenarios.map((s) => (
          <option key={s.savedAt} value={s.savedAt}>
            {s.name} ({new Date(s.savedAt).toLocaleDateString()})
          </option>
        ))}
      </select>

      <button
        type="button"
        className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-rush-black border border-[rgba(0,0,0,0.10)] hover:bg-grayrush-light transition"
        onClick={() => {
          if (!scenarios.length) return alert("No saved scenarios.");
          if (!confirm("Delete all saved scenarios on this computer?")) return;
          saveAll([]);
          alert("Deleted.");
        }}
      >
        Clear
      </button>
    </div>
  );
}
