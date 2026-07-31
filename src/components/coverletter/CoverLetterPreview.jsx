import { forwardRef } from "react";
import { getTemplate } from "../../data/templates.js";

const CoverLetterPreview = forwardRef(function CoverLetterPreview({ coverLetter }, ref) {
  const paragraphs = (coverLetter.body || "").split(/\n\s*\n/).filter((p) => p.trim());
  const template = getTemplate(coverLetter.template);
  const isBand = template.headerStyle === "band";
  const isLeftRule = template.headerStyle === "left-rule";
  const contactLine = [coverLetter.senderEmail, coverLetter.senderPhone, coverLetter.senderLocation]
    .filter(Boolean)
    .join("  |  ");

  return (
    <div
      ref={ref}
      className="relative h-[1123px] w-[794px] shrink-0 overflow-hidden bg-white shadow-[0_20px_60px_rgba(0,0,0,0.18)]"
      style={{ fontFamily: template.fonts.body }}
    >
      {isLeftRule && (
        <div className="absolute inset-y-0 left-0 w-[6px]" style={{ background: template.accent }} />
      )}
      {!isBand && !isLeftRule && (
        <div className="absolute inset-x-0 top-0 h-[5px]" style={{ background: template.accent }} />
      )}

      <CoverLetterHeader coverLetter={coverLetter} template={template} contactLine={contactLine} />

      <div className={`px-16 pb-16 ${isBand ? "pt-7" : "pt-9"}`}>
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
    </div>
  );
});

// Mirrors ResumeHeader's variant switch in CVPreview.jsx one-for-one, using
// the exact same template.headerStyle values, so a given template id
// always produces a visually matching header treatment on both documents.
function CoverLetterHeader({ coverLetter, template, contactLine }) {
  if (template.headerStyle === "band") {
    return (
      <header className="px-16 pb-7 pt-11 text-white" style={{ background: template.accent }}>
        <h1 className="text-[23px] font-bold tracking-tight" style={{ fontFamily: template.fonts.heading }}>
          {coverLetter.senderName}
        </h1>
        {coverLetter.senderTagline && <p className="mt-1 text-[13px] opacity-90">{coverLetter.senderTagline}</p>}
        {contactLine && <p className="mt-1.5 text-[12px] opacity-75">{contactLine}</p>}
      </header>
    );
  }

  return (
    <header className="px-16 pt-11">
      <h1
        className="text-[22px] font-bold text-[#111]"
        style={{ fontFamily: template.fonts.heading }}
      >
        {coverLetter.senderName}
      </h1>
      {coverLetter.senderTagline && <p className="mt-1 text-[13px] text-[#555]">{coverLetter.senderTagline}</p>}
      {contactLine && <p className="mt-1.5 text-[12px] text-[#777]">{contactLine}</p>}
    </header>
  );
}

export default CoverLetterPreview;
