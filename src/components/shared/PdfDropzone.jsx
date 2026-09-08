import { useCallback, useRef, useState } from "react";
import { FileUp } from "lucide-react";
import { extractPdfText } from "../../lib/pdfTextExtract.js";

/**
 * Shared PDF upload widget for both the resume Builder and the Cover Letter
 * editor. Supports the original click-to-browse flow plus real
 * drag-and-drop — the box was already styled with a dashed border like a
 * dropzone, but previously only responded to clicks. Dropping a file
 * anywhere on it now works the same as picking one from the file dialog.
 */
export default function PdfDropzone({ dataTour, title, description, successMessage, parse, onImport }) {
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [error, setError] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  // Dragging over a child element fires dragleave on the parent before
  // dragenter on the child, which would otherwise make the highlight
  // flicker off mid-drag. Counting enter/leave pairs instead of using a
  // single boolean keeps it stable regardless of what's inside the box.
  const dragDepth = useRef(0);
  const busy = status === "loading";

  const processFile = useCallback(
    async (file) => {
      if (!file || busy) return;

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
        onImport(parse(text));
        setStatus("done");
      } catch {
        setStatus("error");
        setError("Couldn't read that PDF — it may be corrupted or password-protected.");
      }
    },
    [busy, onImport, parse]
  );

  function handleChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    processFile(file);
  }

  function handleDragEnter(e) {
    e.preventDefault();
    if (busy) return;
    dragDepth.current += 1;
    setIsDragActive(true);
  }

  function handleDragOver(e) {
    // Browsers block drops by default unless dragover is prevented here.
    e.preventDefault();
  }

  function handleDragLeave(e) {
    e.preventDefault();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setIsDragActive(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    dragDepth.current = 0;
    setIsDragActive(false);
    if (busy) return;
    processFile(e.dataTransfer.files?.[0]);
  }

  return (
    <div
      data-tour={dataTour}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`mb-6 border border-dashed p-4 transition-colors ${
        isDragActive ? "border-ink bg-ink/5" : "border-line bg-canvas"
      }`}
    >
      <p className="text-sm font-semibold text-ink">{title}</p>
      <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">{description}</p>
      <label
        className={`mt-3 inline-flex min-h-[40px] items-center gap-2 border border-line px-4 text-xs font-semibold text-ink transition-colors hover:border-ink ${
          busy ? "cursor-not-allowed opacity-60" : "cursor-pointer"
        }`}
      >
        <FileUp size={14} aria-hidden="true" />
        {busy ? "Reading PDF…" : isDragActive ? "Drop to import" : "Import from PDF"}
        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleChange}
          disabled={busy}
        />
      </label>
      {status === "done" && (
        <p className="mt-2 text-xs font-medium text-green-600">{successMessage}</p>
      )}
      {status === "error" && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
