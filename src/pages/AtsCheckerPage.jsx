import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useResumeData } from "../lib/resumeStorage.js";
import { resumeToText } from "../lib/resumeText.js";
import { extractPdfText } from "../lib/pdfTextExtract.js";
import { analyzeResume } from "../lib/atsAnalyzer.js";
import UploadDropzone from "../components/ats/UploadDropzone.jsx";
import JobDescriptionInput from "../components/ats/JobDescriptionInput.jsx";
import ScoreGauge from "../components/ats/ScoreGauge.jsx";
import ChecklistResults from "../components/ats/ChecklistResults.jsx";
import MissingKeywords from "../components/ats/MissingKeywords.jsx";
import { useAtsTour } from "../components/onboarding/useProductTour.js";

export default function AtsCheckerPage() {
  const [resume] = useResumeData();
  const { registerTour } = useOutletContext();
  useAtsTour(registerTour);

  const [source, setSource] = useState("builder"); // "builder" | "upload"
  const [upload, setUpload] = useState(null); // { name, text, pageCount }
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [jobDescription, setJobDescription] = useState("");

  async function handleFile(file) {
    setUploadError(null);
    if (file.type !== "application/pdf") {
      setUploadError("Please upload a PDF file.");
      return;
    }
    setUploading(true);
    try {
      const { text, pageCount } = await extractPdfText(file);
      setUpload({ name: file.name, text, pageCount });
    } catch {
      setUploadError("Couldn't read that PDF — it may be corrupted or password-protected.");
      setUpload(null);
    } finally {
      setUploading(false);
    }
  }

  const resumeText = useMemo(() => {
    if (source === "builder") return resumeToText(resume);
    return upload?.text ?? "";
  }, [source, resume, upload]);

  // For uploads, a file being present is what triggers analysis — even a
  // PDF that extracts to no text at all should still run (and correctly
  // score very low), not silently sit there looking unfinished.
  const hasSource = source === "upload" ? Boolean(upload) : true;

  const analysis = useMemo(() => {
    if (!hasSource) return null;
    return analyzeResume({ text: resumeText, jobDescription });
  }, [hasSource, resumeText, jobDescription]);

  return (
    <div className="flex h-full min-w-0 flex-col overflow-y-auto md:flex-row md:overflow-hidden">
      <div className="order-1 w-full border-t border-line bg-white p-4 md:order-1 md:h-full md:w-[420px] md:overflow-y-auto md:border-r md:border-t-0 md:p-6">
        <div data-tour="ats-source" className="mb-6">
          <h3 className="mb-3 font-display text-lg font-bold text-ink">Resume source</h3>
          <div className="flex gap-2">
            <SourceTab active={source === "builder"} onClick={() => setSource("builder")}>
              My Builder resume
            </SourceTab>
            <SourceTab active={source === "upload"} onClick={() => setSource("upload")}>
              Upload a PDF
            </SourceTab>
          </div>

          {source === "upload" && (
            <div className="mt-4">
              <UploadDropzone
                onFile={handleFile}
                fileName={uploading ? "Reading PDF…" : upload?.name}
                error={uploadError}
              />
            </div>
          )}
        </div>

        <div data-tour="ats-jd">
          <JobDescriptionInput value={jobDescription} onChange={setJobDescription} />
        </div>
      </div>

      <div className="order-2 flex-1 px-4 py-6 md:order-2 md:h-full md:overflow-y-auto md:px-6 md:py-8">
        <div data-tour="ats-results" className="mx-auto max-w-xl">
          {!analysis ? (
            <EmptyState source={source} />
          ) : (
            <div className="flex flex-col items-center gap-6">
              <ScoreGauge score={analysis.score} />
              <div className="w-full">
                <ChecklistResults checks={analysis.checks} />
              </div>
              {analysis.jdMatch && (
                <div className="w-full">
                  <MissingKeywords jdMatch={analysis.jdMatch} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SourceTab({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[40px] flex-1 items-center justify-center rounded-full px-3.5 text-xs font-semibold transition-colors md:flex-none md:py-1.5 ${
        active ? "bg-ink text-white" : "border border-line text-ink-soft hover:border-ink hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function EmptyState({ source }) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-white py-16 text-center">
      <p className="text-sm font-medium text-ink-soft">
        {source === "upload"
          ? "Upload a PDF resume to see your ATS score."
          : "Add some content in the Resume Builder to see your ATS score."}
      </p>
    </div>
  );
}
