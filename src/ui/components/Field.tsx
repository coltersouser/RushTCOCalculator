import type { FieldSchema, Inputs } from "../../types/schema";
import { clamp } from "../../utils/format";

function toNumber(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function Field({
  field,
  value,
  onChange,
  error
}: {
  field: FieldSchema;
  value: Inputs[string];
  onChange: (key: string, value: number | boolean | string | null) => void;
  error?: string;
}) {
  const inputClass =
    "w-full rounded-lg border border-[rgba(0,0,0,0.10)] bg-white px-3 py-2 text-sm text-rush-black outline-none focus:ring-2 focus:ring-[rgba(238,177,17,0.40)]";

  if (field.type === "toggle") {
    const checked = Boolean(value);
    return (
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-rush-black">{field.label}</div>
          {field.help && <div className="text-xs text-grayrush-medium mt-0.5">{field.help}</div>}
        </div>
        <button
          type="button"
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition border ${
            checked ? "bg-rush-gold border-rush-gold" : "bg-grayrush-light border-[rgba(0,0,0,0.10)]"
          }`}
          onClick={() => onChange(field.key, !checked)}
          aria-label={field.label}
        >
          <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition shadow ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
        </button>
      </div>
    );
  }

  if (field.type === "text") {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-rush-black">
        {field.label}
      </label>
      <input
        type="text"
        value={String(value ?? "")}
        onChange={(e) => onChange(field.key, e.target.value)}
        className="w-full rounded-lg border border-[rgba(0,0,0,0.15)] px-3 py-2 text-sm text-rush-black outline-none focus:ring-2 focus:ring-[rgba(238,177,17,0.40)]"
        placeholder={field.help ?? ""}
      />
      {field.help && (
        <div className="text-xs text-grayrush-medium">{field.help}</div>
      )}
      {error && (
        <div className="text-xs font-medium text-rush-red">{error}</div>
      )}
    </div>
  );
}

  

  const step = field.step ?? (field.type === "currency" ? 1 : 0.01);
  const min = field.min;
  const max = field.max;

  return (
    <div className="space-y-1">
      <div>
        <div className="text-sm font-medium text-rush-black">{field.label}</div>
        {field.help && <div className="text-xs text-grayrush-medium mt-0.5">{field.help}</div>}
      </div>

      <div className="flex items-center gap-2">
        {field.type === "currency" && <span className="text-sm text-grayrush-dark">$</span>}
        {field.type === "percent" && <span className="text-sm text-grayrush-dark">%</span>}
        <input
          className={inputClass}
          type="number"
          inputMode="decimal"
          value={value === null ? "" : field.type === "percent" ? (toNumber(value) * 100).toString() : toNumber(value).toString()}
          step={field.type === "percent" ? step * 100 : step}
          min={field.type === "percent" && typeof min === "number" ? min * 100 : min}
          max={field.type === "percent" && typeof max === "number" ? max * 100 : max}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw.trim() === "") return onChange(field.key, null);
            const entered = toNumber(raw);
            const normalized = field.type === "percent" ? entered / 100 : entered;
            onChange(field.key, clamp(normalized, min, max));
          }}
        />
      </div>

      

      {error && <div className="text-xs text-rush-red">{error}</div>}
    </div>
  );
}
