import { MARGIN_X, MARGIN_TOP, createCursor, writeParagraph } from "./pdfLayout.js";

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

function renderCoverLetterToPdf(doc, letter) {
  const cursor = createCursor();
  cursor.y = MARGIN_TOP;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(17, 17, 17);
  doc.text(letter.senderName || "", MARGIN_X, cursor.y);
  cursor.y += 17;

  if (letter.senderTagline) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(85, 85, 85);
    doc.text(letter.senderTagline, MARGIN_X, cursor.y);
    cursor.y += 14;
  }

  const contactLine = [letter.senderEmail, letter.senderPhone, letter.senderLocation]
    .filter(Boolean)
    .join("   |   ");
  if (contactLine) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(119, 119, 119);
    doc.text(contactLine, MARGIN_X, cursor.y);
    cursor.y += 14;
  }

  cursor.y += 18;

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
 * stays selectable and re-importable (same rationale as resumeExport.js). */
export async function downloadAsPdf(coverLetter, filename) {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  renderCoverLetterToPdf(doc, coverLetter);
  doc.save(filename || `${slugify(coverLetter.senderName)}-cover-letter.pdf`);
}
