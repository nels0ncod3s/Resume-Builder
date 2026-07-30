import { useState } from "react";
import { extractPdfText } from "../../lib/pdfTextExtract.js";
import { parseResumeText } from "../../lib/resumeImport.js";

export default function ImportPdfButton({ onImport }) {
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [error, setError] = useState(null);

  async function handleChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.type !== "application/pdf") {
      setStatus("error");
      setError("Please choose a PDF file.");
      return;
    }

    setStatus("loading");
    setError(null);
    try {
      const { text } = await extractPdfText(file);
      if (!text.trim()) {
        setStatus("error");
        setError("Couldn't find any text in that PDF — it may be a scanned image.");
        return;
      }
      onImport(parseResumeText(text));
      setStatus("done");
    } catch {
      setStatus("error");
      setError("Couldn't read that PDF — it may be corrupted or password-protected.");
    }
  }

  return (
    <div data-tour="import-pdf" className="mb-6 rounded-lg border border-dashed border-line bg-canvas p-4">
      <p className="text-sm font-semibold text-ink">Already have a resume?</p>
      <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">
        Import a PDF to auto-fill the fields below. This replaces the current form, and parsing
        is best-effort — review everything after.
      </p>
      <label className="mt-3 inline-flex min-h-[40px] cursor-pointer items-center rounded-full border border-line px-4 text-xs font-semibold text-ink transition-colors hover:border-ink">
        {status === "loading" ? "Reading PDF…" : "Import from PDF"}
        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleChange}
          disabled={status === "loading"}
        />
      </label>
      {status === "done" && (
        <p className="mt-2 text-xs font-medium text-green-600">Imported — review each section below.</p>
      )}
      {status === "error" && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
