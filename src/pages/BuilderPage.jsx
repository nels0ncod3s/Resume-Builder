import { useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { useResumeData } from "../lib/resumeStorage.js";
import EditorPanel from "../components/builder/EditorPanel.jsx";
import ImportPdfButton from "../components/builder/ImportPdfButton.jsx";
import CVPreview from "../components/builder/CVPreview.jsx";
import CVScaledViewport from "../components/builder/CVScaledViewport.jsx";
import DownloadBar from "../components/builder/DownloadBar.jsx";
import { useBuilderTour } from "../components/onboarding/useProductTour.js";

export default function BuilderPage() {
  const [resume, setResume] = useResumeData();
  const cvRef = useRef(null);
  const { registerTour } = useOutletContext();

  useBuilderTour(registerTour);

  return (
    <div className="flex h-full min-w-0 flex-col overflow-y-auto md:flex-row md:overflow-hidden">
      <div className="order-2 w-full border-t border-line bg-white md:order-1 md:h-full md:w-[420px] md:overflow-y-auto md:border-r md:border-t-0">
        <div className="p-6 pb-0">
          <ImportPdfButton onImport={setResume} />
        </div>
        <EditorPanel resume={resume} setResume={setResume} />
      </div>
      <div className="order-1 flex-1 px-4 py-6 md:order-2 md:h-full md:overflow-y-auto md:px-6 md:py-8">
        <div data-tour="cv-preview">
          <CVScaledViewport cvRef={cvRef}>
            <CVPreview ref={cvRef} resume={resume} />
          </CVScaledViewport>
        </div>
        <DownloadBar cvRef={cvRef} resume={resume} />
      </div>
    </div>
  );
}
