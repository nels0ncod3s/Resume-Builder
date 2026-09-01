import PdfDropzone from "../shared/PdfDropzone.jsx";
import { parseCoverLetterText } from "../../lib/coverLetterImport.js";

export default function ImportCoverLetterPdfButton({ onImport }) {
  return (
    <PdfDropzone
      dataTour="import-cover-letter-pdf"
      title="Already have a cover letter?"
      description="Import a PDF to prefill this form. Your current draft will be replaced, so review the result before exporting."
      successMessage="Imported — review each field below."
      parse={parseCoverLetterText}
      onImport={onImport}
    />
  );
}
