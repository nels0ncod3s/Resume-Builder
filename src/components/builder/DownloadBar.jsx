import { useState } from "react";
import { FileDown, ImageDown } from "lucide-react";
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
        className="flex min-h-[44px] items-center gap-2 border border-line bg-paper px-5 text-sm font-semibold text-ink transition-colors hover:border-ink disabled:opacity-50"
      >
        <ImageDown size={16} aria-hidden="true" />
        {busy === "image" ? "Rendering…" : "Download as Image"}
      </button>
      <button
        type="button"
        data-tour="download-pdf"
        disabled={busy !== null}
        onClick={handlePdf}
        className="flex min-h-[44px] items-center gap-2 bg-ink px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        <FileDown size={16} aria-hidden="true" />
        {busy === "pdf" ? "Rendering…" : "Download as PDF"}
      </button>
    </div>
  );
}
