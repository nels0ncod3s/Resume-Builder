export default function MissingKeywords({ jdMatch }) {
  if (!jdMatch) return null;

  return (
    <div className="rounded-lg border border-line bg-white p-4">
      <div className="flex items-baseline justify-between">
        <h4 className="text-sm font-semibold text-ink">Job description keyword match</h4>
        <span className="text-sm font-bold text-ink">{jdMatch.matchPercent}%</span>
      </div>
      <p className="mt-1 text-xs text-ink-soft">
        {jdMatch.matched.length} of {jdMatch.totalKeywords} top keywords from the job description
        appear in your resume.
      </p>

      {jdMatch.missing.length > 0 && (
        <div className="mt-3">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Missing keywords
          </p>
          <div className="flex flex-wrap gap-1.5">
            {jdMatch.missing.map((word) => (
              <span
                key={word}
                className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700"
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
