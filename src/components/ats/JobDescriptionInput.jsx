export default function JobDescriptionInput({ value, onChange }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
        Job description (optional)
      </label>
      <textarea
        rows={6}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste a job description to check keyword match…"
        className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-soft/50 focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink"
      />
    </div>
  );
}
