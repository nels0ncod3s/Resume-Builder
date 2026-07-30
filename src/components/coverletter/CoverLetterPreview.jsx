import { forwardRef } from "react";

const CoverLetterPreview = forwardRef(function CoverLetterPreview({ coverLetter }, ref) {
  const paragraphs = (coverLetter.body || "").split(/\n\s*\n/).filter((p) => p.trim());

  return (
    <div
      ref={ref}
      className="relative h-[1123px] w-[794px] shrink-0 overflow-hidden bg-white px-16 py-16 shadow-[0_20px_60px_rgba(0,0,0,0.18)]"
      style={{ fontFamily: '"DM Sans", sans-serif' }}
    >
      <header className="mb-8">
        <h1 className="text-[22px] font-bold text-[#111]">{coverLetter.senderName}</h1>
        {coverLetter.senderTagline && (
          <p className="mt-1 text-[13px] text-[#555]">{coverLetter.senderTagline}</p>
        )}
        <p className="mt-1.5 text-[12px] text-[#777]">
          {[coverLetter.senderEmail, coverLetter.senderPhone, coverLetter.senderLocation]
            .filter(Boolean)
            .join("  |  ")}
        </p>
      </header>

      {coverLetter.date && <p className="mb-6 text-[13px] text-[#333]">{coverLetter.date}</p>}

      {(coverLetter.recipientName || coverLetter.companyName) && (
        <div className="mb-6 text-[13px] text-[#333]">
          {coverLetter.recipientName && <p>{coverLetter.recipientName}</p>}
          {coverLetter.companyName && <p>{coverLetter.companyName}</p>}
        </div>
      )}

      {coverLetter.salutation && <p className="mb-4 text-[14px] text-[#333]">{coverLetter.salutation}</p>}

      <div className="flex flex-col gap-4">
        {paragraphs.map((p, i) => (
          <p key={i} className="whitespace-pre-wrap text-[14px] leading-[1.7] text-[#333]">
            {p.trim()}
          </p>
        ))}
      </div>

      {coverLetter.closing && (
        <div className="mt-8 text-[14px] text-[#333]">
          <p>{coverLetter.closing}</p>
          <p className="mt-8">{coverLetter.senderName}</p>
        </div>
      )}
    </div>
  );
});

export default CoverLetterPreview;
