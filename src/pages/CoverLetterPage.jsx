import { useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useCoverLetterData } from "../lib/coverLetterStorage.js";
import CoverLetterEditorPanel from "../components/coverletter/CoverLetterEditorPanel.jsx";
import ImportCoverLetterPdfButton from "../components/coverletter/ImportCoverLetterPdfButton.jsx";
import CoverLetterPreview from "../components/coverletter/CoverLetterPreview.jsx";
import CVScaledViewport from "../components/builder/CVScaledViewport.jsx";
import { downloadAsImage, downloadAsPdf } from "../lib/coverLetterExport.js";
import { useCoverLetterTour } from "../components/onboarding/useProductTour.js";

export default function CoverLetterPage() {
  const [coverLetter, setCoverLetter] = useCoverLetterData();
  const previewRef = useRef(null);
  const [busy, setBusy] = useState(null);
  const { registerTour } = useOutletContext();

  useCoverLetterTour(registerTour);

  async function handleImage() {
    if (!previewRef.current || busy) return;
    setBusy("image");
    try {
      await downloadAsImage(previewRef.current, "cover-letter.png");
    } finally {
      setBusy(null);
    }
  }

  async function handlePdf() {
    if (busy) return;
    setBusy("pdf");
    try {
      await downloadAsPdf(coverLetter);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex h-full min-w-0 flex-col overflow-y-auto md:flex-row md:overflow-hidden">
      <div className="order-2 w-full border-t border-line bg-white md:order-1 md:h-full md:w-[420px] md:overflow-y-auto md:border-r md:border-t-0">
        <div className="p-6 pb-0">
          <ImportCoverLetterPdfButton onImport={setCoverLetter} />
        </div>
        <CoverLetterEditorPanel coverLetter={coverLetter} setCoverLetter={setCoverLetter} />
      </div>
      <div className="order-1 flex-1 px-4 py-6 md:order-2 md:h-full md:overflow-y-auto md:px-6 md:py-8">
        <div data-tour="cl-preview">
          <CVScaledViewport cvRef={previewRef}>
            <CoverLetterPreview ref={previewRef} coverLetter={coverLetter} />
          </CVScaledViewport>
        </div>
        <div className="flex justify-center gap-3 py-6">
          <button
            type="button"
            data-tour="cl-download-image"
            disabled={busy !== null}
            onClick={handleImage}
            className="rounded-full border border-line bg-paper px-6 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink disabled:opacity-50"
          >
            {busy === "image" ? "Rendering…" : "Download as Image"}
          </button>
          <button
            type="button"
            data-tour="cl-download-pdf"
            disabled={busy !== null}
            onClick={handlePdf}
            className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy === "pdf" ? "Rendering…" : "Download as PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}
