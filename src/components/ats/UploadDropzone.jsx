import { useCallback, useState } from "react";
import { FileUp } from "lucide-react";

export default function UploadDropzone({ onFile, fileName, error }) {
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(
    (files) => {
      const file = files?.[0];
      if (file) onFile(file);
    },
    [onFile]
  );

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center border border-dashed p-7 text-center transition-colors ${
          dragOver ? "border-ink bg-canvas" : "border-line bg-white"
        }`}
      >
        <FileUp size={20} className="mb-3 text-ink-soft" aria-hidden="true" />
        <p className="text-sm font-semibold text-ink">
          {fileName ? fileName : "Drop a PDF resume here"}
        </p>
        <p className="mt-1 text-xs text-ink-soft">or</p>
        <label className="mt-3 flex min-h-[40px] cursor-pointer items-center border border-line px-4 text-xs font-semibold text-ink hover:border-ink">
          Browse file
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      </div>
      {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
