import { useMemo, useState } from "react";
import { ArrowRight, FileText, ScanSearch, ShieldCheck } from "lucide-react";
import { Link, useOutletContext } from "react-router-dom";
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

const SCORE_COPY = [
  { min: 75, title: "Strong foundation", body: "The essentials are in place. Focus on the remaining role-specific improvements before applying." },
  { min: 50, title: "Worth refining", body: "Your resume is readable, but a few content and structure changes could make it more competitive." },
  { min: 0, title: "Needs attention", body: "Start with the priority checks below. Fixing structure and missing basics will have the largest effect." },
];

export default function AtsCheckerPage() {
  const [resume] = useResumeData();
  const { registerTour } = useOutletContext();
  useAtsTour(registerTour);

  const [source, setSource] = useState("builder");
  const [upload, setUpload] = useState(null);
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
      setUploadError("Couldn't read that PDF. It may be corrupted or password-protected.");
      setUpload(null);
    } finally {
      setUploading(false);
    }
  }

  const resumeText = useMemo(() => {
    if (source === "builder") return resumeToText(resume);
    return upload?.text ?? "";
  }, [source, resume, upload]);

  const hasSource = source === "upload" ? Boolean(upload) : true;
  const analysis = useMemo(() => {
    if (!hasSource) return null;
    return analyzeResume({ text: resumeText, jobDescription });
  }, [hasSource, resumeText, jobDescription]);

  return (
    <div className="flex h-full min-w-0 flex-col overflow-y-auto md:flex-row md:overflow-hidden">
      <aside className="order-1 w-full border-b border-line bg-white p-5 md:h-full md:w-[420px] md:overflow-y-auto md:border-b-0 md:border-r md:p-6">
        <div data-tour="ats-source">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase text-ink-soft">Step 1</p>
            <h2 className="mt-1 font-display text-xl font-bold text-ink">Choose the resume to review</h2>
          </div>

          <div className="grid grid-cols-2 border border-line bg-canvas p-1" role="tablist" aria-label="Resume source">
            <SourceTab active={source === "builder"} onClick={() => setSource("builder")} icon={FileText}>
              Builder resume
            </SourceTab>
            <SourceTab active={source === "upload"} onClick={() => setSource("upload")} icon={ScanSearch}>
              Upload PDF
            </SourceTab>
          </div>

          {source === "builder" ? (
            <div className="mt-4 flex items-start gap-3 border-l-2 border-ink bg-canvas p-3">
              <ShieldCheck size={17} className="mt-0.5 shrink-0 text-ink" aria-hidden="true" />
              <p className="text-xs leading-relaxed text-ink-soft">
                Reviewing the version saved in your builder. Changes there update this score automatically.
              </p>
            </div>
          ) : (
            <div className="mt-4">
              <UploadDropzone
                onFile={handleFile}
                fileName={uploading ? "Reading PDF..." : upload?.name}
                error={uploadError}
              />
            </div>
          )}
        </div>

        <div data-tour="ats-jd" className="mt-8 border-t border-line pt-7">
          <p className="mb-1 text-xs font-bold uppercase text-ink-soft">Step 2</p>
          <h2 className="mb-4 font-display text-xl font-bold text-ink">Tailor the review to a role</h2>
          <JobDescriptionInput value={jobDescription} onChange={setJobDescription} />
        </div>

        <p className="mt-8 border-t border-line pt-5 text-[11px] leading-relaxed text-ink-soft">
          This is a rules-based estimate, not a prediction from a specific employer's applicant tracking system.
        </p>
      </aside>

      <main className="order-2 flex-1 px-5 py-7 md:h-full md:overflow-y-auto md:px-8 md:py-9">
        <div data-tour="ats-results" className="mx-auto max-w-3xl">
          {!analysis ? <EmptyState /> : <Results analysis={analysis} source={source} />}
        </div>
      </main>
    </div>
  );
}

function Results({ analysis, source }) {
  const scoreCopy = SCORE_COPY.find((item) => analysis.score >= item.min);
  const passCount = analysis.checks.filter((check) => check.status === "pass").length;
  const priorityCount = analysis.checks.filter((check) => check.status === "fail").length;

  return (
    <div>
      <div className="grid items-center gap-7 border-b border-line pb-8 sm:grid-cols-[180px_1fr]">
        <ScoreGauge score={analysis.score} />
        <div>
          <p className="text-xs font-bold uppercase text-ink-soft">Resume readiness estimate</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-ink">{scoreCopy.title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">{scoreCopy.body}</p>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs text-ink-soft">
            <span><strong className="text-ink">{passCount}</strong> of 8 checks passed</span>
            <span><strong className="text-ink">{analysis.wordCount}</strong> words</span>
            <span><strong className="text-ink">{analysis.bulletCount}</strong> bullets found</span>
          </div>
          {source === "builder" && priorityCount > 0 && (
            <Link to="/app/builder" className="mt-6 inline-flex min-h-[42px] items-center gap-2 bg-ink px-4 text-xs font-bold text-white">
              Fix {priorityCount} priority {priorityCount === 1 ? "item" : "items"} in builder
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>

      {analysis.jdMatch && <div className="mt-8"><MissingKeywords jdMatch={analysis.jdMatch} /></div>}
      <div className="mt-8"><ChecklistResults checks={analysis.checks} /></div>
    </div>
  );
}

function SourceTab({ active, onClick, icon: Icon, children }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`flex min-h-[42px] items-center justify-center gap-2 px-3 text-xs font-semibold transition-colors ${
        active ? "bg-ink text-white" : "text-ink-soft hover:text-ink"
      }`}
    >
      <Icon size={15} aria-hidden="true" />
      {children}
    </button>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[430px] flex-col items-center justify-center border border-dashed border-line bg-white px-6 text-center">
      <ScanSearch size={28} strokeWidth={1.5} className="text-ink-soft" aria-hidden="true" />
      <h2 className="mt-4 font-display text-xl font-bold text-ink">Upload a resume to begin</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
        We will extract its text, check the document structure, and show the most useful improvements first.
      </p>
    </div>
  );
}
