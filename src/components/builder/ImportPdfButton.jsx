import PdfDropzone from "../shared/PdfDropzone.jsx";
import { parseResumeText } from "../../lib/resumeImport.js";

export default function ImportPdfButton({ onImport }) {
  return (
    <PdfDropzone
      dataTour="import-pdf"
      title="Already have a resume?"
      description="Drag and drop a PDF here, or click to browse, to auto-fill the fields below. This replaces the current form, and parsing is best-effort — review everything after."
      successMessage="Imported — review each section below."
      parse={parseResumeText}
      onImport={onImport}
    />
  );
}
