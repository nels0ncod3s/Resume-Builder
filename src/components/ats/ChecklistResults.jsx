const STATUS_STYLES = {
  pass: { icon: "✓", cls: "text-green-600 bg-green-50 border-green-200" },
  warn: { icon: "!", cls: "text-amber-600 bg-amber-50 border-amber-200" },
  fail: { icon: "✕", cls: "text-red-600 bg-red-50 border-red-200" },
};

export default function ChecklistResults({ checks }) {
  return (
    <ul className="flex flex-col gap-2">
      {checks.map((c) => {
        const style = STATUS_STYLES[c.status];
        return (
          <li key={c.id} className="flex gap-3 rounded-lg border border-line bg-white p-3">
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${style.cls}`}
              aria-hidden="true"
            >
              {style.icon}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">{c.label}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">{c.detail}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
