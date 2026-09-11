import { useEffect, useState } from "react";
import { FileDown, ImageDown } from "lucide-react";
import { downloadAsImage, downloadAsPdf } from "../../lib/resumeExport.js";

export default function DownloadBar({
  cvRef,
  resume,
  exportPdf = downloadAsPdf,
  documentLabel = "Resume",
  imageFilename = "resume.png",
  tourPrefix = "",
}) {
  const [busy, setBusy] = useState(null);
  const [notice, setNotice] = useState(null);
  const [fallbackLink, setFallbackLink] = useState(null);

  useEffect(() => {
    return () => {
      if (fallbackLink?.url) URL.revokeObjectURL(fallbackLink.url);
    };
  }, [fallbackLink]);

  async function handleImage() {
    if (!cvRef.current || busy) return;
    setBusy("image");
    setNotice(null);
    setFallbackLink(null);
    try {
      const result = await downloadAsImage(cvRef.current, imageFilename);
      if (!result) {
        setNotice({ type: "neutral", text: "Image download cancelled." });
      } else if (result.url) {
        setFallbackLink({ url: result.url, filename: result.filename, label: "Download image now" });
        setNotice({ type: "success", text: `${documentLabel} image is ready. If the download did not start, use the link below.` });
      } else {
        setNotice({ type: "success", text: `${documentLabel} image saved.` });
      }
    } catch (error) {
      console.error(`${documentLabel} image download failed`, error);
      setNotice({ type: "error", text: "Image download failed. Please try again." });
    } finally {
      setBusy(null);
    }
  }

  async function handlePdf() {
    if (busy) return;
    setBusy("pdf");
    setNotice(null);
    setFallbackLink(null);
    try {
      const result = await exportPdf(resume);
      if (!result) {
        setNotice({ type: "neutral", text: "PDF download cancelled." });
      } else if (result.url) {
        setFallbackLink({ url: result.url, filename: result.filename, label: "Download PDF now" });
        setNotice({ type: "success", text: `${documentLabel} PDF is ready. If the download did not start, use the link below.` });
      } else {
        setNotice({ type: "success", text: `${documentLabel} PDF saved.` });
      }
    } catch (error) {
      console.error(`${documentLabel} PDF download failed`, error);
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
          data-tour={`${tourPrefix}download-image`}
          disabled={busy !== null}
          onClick={handleImage}
          className="flex min-h-[44px] items-center gap-2 border border-line bg-paper px-5 text-sm font-semibold text-ink transition-colors hover:border-ink disabled:opacity-50"
        >
          <ImageDown size={16} aria-hidden="true" />
          {busy === "image" ? "Rendering…" : "Download as Image"}
        </button>
        <button
          type="button"
          data-tour={`${tourPrefix}download-pdf`}
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
      {fallbackLink && (
        <a
          href={fallbackLink.url}
          download={fallbackLink.filename}
          className="border-b border-ink text-sm font-semibold text-ink hover:opacity-70"
        >
          {fallbackLink.label}
        </a>
      )}
    </div>
  );
}
