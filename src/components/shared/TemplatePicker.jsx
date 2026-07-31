import { TEMPLATES } from "../../data/templates.js";

// Swatch grid used by both EditorPanel and CoverLetterEditorPanel to pick
// a template. Deliberately dumb/generic — it just renders whatever's in
// data/templates.js — so the two editors stay in sync automatically as
// templates are added or changed there, with no duplicated list.
export default function TemplatePicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {TEMPLATES.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            aria-pressed={active}
            className={`flex flex-col gap-2 rounded-lg border p-2.5 text-left transition-colors ${
              active ? "border-ink ring-2 ring-ink/15" : "border-line hover:border-ink/40"
            }`}
          >
            <span className="flex h-9 w-full overflow-hidden rounded" style={{ border: `1px solid ${t.swatch.accent}` }}>
              <span className="w-2 shrink-0" style={{ background: t.swatch.accent }} />
              <span
                className="flex flex-1 items-center justify-center text-sm font-bold"
                style={{ background: t.swatch.bg, color: t.swatch.accent, fontFamily: t.fonts.heading }}
              >
                Aa
              </span>
            </span>
            <span className="text-xs font-semibold text-ink">{t.name}</span>
          </button>
        );
      })}
    </div>
  );
}
