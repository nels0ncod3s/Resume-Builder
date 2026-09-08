export default function JobDescriptionInput({ value, onChange }) {
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div>
      <div className="mb-2 flex items-end justify-between gap-3">
      <label className="block text-xs font-semibold uppercase text-ink-soft">
        Target job description
      </label>
        <span className="text-[10px] text-ink-soft">{wordCount ? `${wordCount} words` : "Optional"}</span>
      </div>
      <textarea
        rows={9}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste the job description to compare its language with your resume."
        className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-soft/50 focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink"
      />
      <p className="mt-2 text-xs leading-relaxed text-ink-soft">
        Adding a role makes 30% of the score specific to its most-used keywords.
      </p>
    </div>
  );
}
