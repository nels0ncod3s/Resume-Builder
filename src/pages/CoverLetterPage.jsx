import { useRef } from "react";
import DownloadBar from "../components/builder/DownloadBar.jsx";
import { useOutletContext } from "react-router-dom";
import { useCoverLetterData } from "../lib/coverLetterStorage.js";
import CoverLetterEditorPanel from "../components/coverletter/CoverLetterEditorPanel.jsx";
import ImportCoverLetterPdfButton from "../components/coverletter/ImportCoverLetterPdfButton.jsx";
import CoverLetterPreview from "../components/coverletter/CoverLetterPreview.jsx";
import CVScaledViewport from "../components/builder/CVScaledViewport.jsx";
import { downloadAsPdf } from "../lib/coverLetterExport.js";
import { useCoverLetterTour } from "../components/onboarding/useProductTour.js";

export default function CoverLetterPage() {
  const [coverLetter, setCoverLetter] = useCoverLetterData();
  const previewRef = useRef(null);
  const { registerTour } = useOutletContext();

  useCoverLetterTour(registerTour);

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
        <DownloadBar
          cvRef={previewRef}
          resume={coverLetter}
          exportPdf={downloadAsPdf}
          documentLabel="Cover letter"
          imageFilename="cover-letter.png"
          tourPrefix="cl-"
        />
      </div>
    </div>
  );
}
