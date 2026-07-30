import { useState } from "react";
import { downloadAsImage, downloadAsPdf } from "../../lib/resumeExport.js";

export default function DownloadBar({ cvRef, resume }) {
  const [busy, setBusy] = useState(null);

  async function handleImage() {
    if (!cvRef.current || busy) return;
    setBusy("image");
    try {
      await downloadAsImage(cvRef.current, "resume.png");
    } finally {
      setBusy(null);
    }
  }

  async function handlePdf() {
    if (busy) return;
    setBusy("pdf");
    try {
      await downloadAsPdf(resume);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex justify-center gap-3 py-6">
      <button
        type="button"
        data-tour="download-image"
        disabled={busy !== null}
        onClick={handleImage}
        className="rounded-full border border-line bg-paper px-6 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink disabled:opacity-50"
      >
        {busy === "image" ? "Rendering…" : "Download as Image"}
      </button>
      <button
        type="button"
        data-tour="download-pdf"
        disabled={busy !== null}
        onClick={handlePdf}
        className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {busy === "pdf" ? "Rendering…" : "Download as PDF"}
      </button>
    </div>
  );
}
