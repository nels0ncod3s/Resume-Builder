import { useState } from "react";
import { FileDown, ImageDown } from "lucide-react";
import { downloadAsImage, downloadAsPdf } from "../../lib/resumeExport.js";

export default function DownloadBar({ cvRef, resume }) {
  const [busy, setBusy] = useState(null);
  const [notice, setNotice] = useState(null);

  async function handleImage() {
    if (!cvRef.current || busy) return;
    setBusy("image");
    setNotice(null);
    try {
      const saved = await downloadAsImage(cvRef.current, "resume.png");
      setNotice(
        saved
          ? { type: "success", text: "Resume image saved." }
          : { type: "neutral", text: "Image download cancelled." },
      );
    } catch (error) {
      console.error("Resume image download failed", error);
      setNotice({ type: "error", text: "Image download failed. Please try again." });
    } finally {
      setBusy(null);
    }
  }

  async function handlePdf() {
    if (busy) return;
    setBusy("pdf");
    setNotice(null);
    try {
      const saved = await downloadAsPdf(resume);
      setNotice(
        saved
          ? { type: "success", text: "Resume PDF saved." }
          : { type: "neutral", text: "PDF download cancelled." },
      );
    } catch (error) {
      console.error("Resume PDF download failed", error);
      setNotice({ type: "error", text: "PDF download failed. Please try again." });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2 py-6">
      <div className="flex justify-center gap-3">
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
      {notice && (
        <p
          role="status"
          aria-live="polite"
          className={`text-sm ${
            notice.type === "error"
              ? "text-red-700"
              : notice.type === "success"
                ? "text-emerald-700"
                : "text-neutral-600"
          }`}
        >
          {notice.text}
        </p>
      )}
    </div>
  );
}
