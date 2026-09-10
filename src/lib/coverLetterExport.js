import { PAGE_WIDTH, PAGE_HEIGHT, MARGIN_X, MARGIN_TOP, createCursor, writeParagraph } from "./pdfLayout.js";
import { getTemplate } from "../data/templates.js";
import { downloadBlob } from "./domCapture.js";

export { downloadAsImage } from "./domCapture.js";

function slugify(name) {
  return (
    (name || "cover-letter")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "cover-letter"
  );
}

// Mirrors CoverLetterPreview.jsx's CoverLetterHeader variants.
function writeHeaderBand(doc, cursor, letter, pdf) {
  const bandHeight = 92;
  doc.setFillColor(...pdf.accentRGB);
  doc.rect(0, 0, PAGE_WIDTH, bandHeight, "F");

  cursor.y = 38;
  doc.setFont(pdf.headingFont, "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(letter.senderName || "", MARGIN_X, cursor.y);
  cursor.y += 15;

  if (letter.senderTagline) {
    doc.setFont(pdf.bodyFont, "normal");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(letter.senderTagline, MARGIN_X, cursor.y);
    cursor.y += 13;
  }

  const contactLine = [letter.senderEmail, letter.senderPhone, letter.senderLocation].filter(Boolean).join("   |   ");
  if (contactLine) {
    doc.setFont(pdf.bodyFont, "normal");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(contactLine, MARGIN_X, cursor.y);
  }

  cursor.y = bandHeight + 34;
}

function writeHeaderPlain(doc, cursor, letter, template) {
  const { pdf } = template;
  if (template.headerStyle === "left-rule") {
    doc.setFillColor(...pdf.accentRGB);
    doc.rect(0, 0, 4, PAGE_HEIGHT, "F");
  } else {
    doc.setFillColor(...pdf.accentRGB);
    doc.rect(0, 0, PAGE_WIDTH, 4, "F");
  }

  cursor.y = MARGIN_TOP;
  doc.setFont(pdf.headingFont, "bold");
  doc.setFontSize(15);
  doc.setTextColor(17, 17, 17);
  doc.text(letter.senderName || "", MARGIN_X, cursor.y);
  cursor.y += 17;

  if (letter.senderTagline) {
    doc.setFont(pdf.bodyFont, "normal");
    doc.setFontSize(10);
    doc.setTextColor(85, 85, 85);
    doc.text(letter.senderTagline, MARGIN_X, cursor.y);
    cursor.y += 14;
  }

  const contactLine = [letter.senderEmail, letter.senderPhone, letter.senderLocation].filter(Boolean).join("   |   ");
  if (contactLine) {
    doc.setFont(pdf.bodyFont, "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(119, 119, 119);
    doc.text(contactLine, MARGIN_X, cursor.y);
    cursor.y += 14;
  }

  cursor.y += 18;
}

function renderCoverLetterToPdf(doc, letter, template) {
  const cursor = createCursor({
    onPageAdded: (pageDoc) => {
      pageDoc.setFillColor(...template.pdf.accentRGB);
      if (template.headerStyle === "left-rule") {
        pageDoc.rect(0, 0, 4, PAGE_HEIGHT, "F");
      } else {
        pageDoc.rect(0, 0, PAGE_WIDTH, template.headerStyle === "band" ? 7 : 4, "F");
      }
    },
  });

  if (template.pdf.headerBand) {
    writeHeaderBand(doc, cursor, letter, template.pdf);
  } else {
    writeHeaderPlain(doc, cursor, letter, template);
  }

  if (letter.date) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(51, 51, 51);
    doc.text(letter.date, MARGIN_X, cursor.y);
    cursor.y += 22;
  }

  const recipientLine = [letter.recipientName, letter.companyName].filter(Boolean);
  if (recipientLine.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(51, 51, 51);
    for (const line of recipientLine) {
      cursor.ensureSpace(doc, 15);
      doc.text(line, MARGIN_X, cursor.y);
      cursor.y += 15;
    }
    cursor.y += 12;
  }

  if (letter.salutation) {
    writeParagraph(doc, cursor, letter.salutation, { fontSize: 10.5, spaceAfter: 12 });
  }

  const paragraphs = (letter.body || "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  for (const p of paragraphs) {
    writeParagraph(doc, cursor, p, { fontSize: 10.5, lineHeight: 1.55, spaceAfter: 12 });
  }

  if (letter.closing) {
    cursor.y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(51, 51, 51);
    cursor.ensureSpace(doc, 15);
    doc.text(letter.closing, MARGIN_X, cursor.y);
    cursor.y += 30;
    cursor.ensureSpace(doc, 15);
    doc.text(letter.senderName || "", MARGIN_X, cursor.y);
  }
}

/** Builds and downloads the cover letter as a real, text-based PDF so it
 * stays selectable and re-importable (same rationale as resumeExport.js).
 * Reads letter.template internally, same as resumeExport.js reads
 * resume.template — keeps the template as the single field on the data
 * object rather than a second argument every caller has to remember. */
export async function downloadAsPdf(coverLetter, filename) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  renderCoverLetterToPdf(doc, coverLetter, getTemplate(coverLetter.template));
  downloadBlob(doc.output("blob"), filename || `${slugify(coverLetter.senderName)}-cover-letter.pdf`);
}
