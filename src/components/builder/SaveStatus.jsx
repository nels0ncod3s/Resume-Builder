// Purely visual — reflects the saveStatus already returned by
// useResumeData(). Autosave itself was already happening via localStorage;
// this just makes it visible so people trust a refresh won't lose anything.
export default function SaveStatus({ status }) {
  const isSaving = status === "saving";

  return (
    <div className="flex items-center gap-1.5 text-xs font-medium text-ink-soft" aria-live="polite">
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isSaving ? "animate-pulse bg-amber-400" : "bg-emerald-500"
        }`}
      />
      {isSaving ? "Saving…" : "Saved"}
    </div>
  );
}
