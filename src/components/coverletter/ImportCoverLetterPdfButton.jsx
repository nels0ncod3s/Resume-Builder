import PdfDropzone from "../shared/PdfDropzone.jsx";
import { parseCoverLetterText } from "../../lib/coverLetterImport.js";

export default function ImportCoverLetterPdfButton({ onImport }) {
  return (
    <PdfDropzone
      dataTour="import-cover-letter-pdf"
      title="Already have a cover letter?"
      description="Drag and drop a PDF here, or click to browse, to auto-fill the fields below. This replaces the current form, and parsing is best-effort — review everything after."
      successMessage="Imported — review each field below."
      parse={parseCoverLetterText}
      onImport={onImport}
    />
  );
}
