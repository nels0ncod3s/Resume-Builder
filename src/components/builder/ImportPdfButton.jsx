import PdfDropzone from "../shared/PdfDropzone.jsx";
import { parseResumeText } from "../../lib/resumeImport.js";

export default function ImportPdfButton({ onImport }) {
  return (
    <PdfDropzone
      dataTour="import-pdf"
      title="Already have a resume?"
      description="Import a PDF to prefill this form. Your current draft will be replaced, so review the result before exporting."
      successMessage="Imported — review each section below."
      parse={parseResumeText}
      onImport={onImport}
    />
  );
}
