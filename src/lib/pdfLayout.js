/**
 * Both the resume and cover letter PDFs used to be built by screenshotting
 * the on-screen preview with html2canvas and dropping that image into a
 * jsPDF page. That looked fine, but the resulting PDF has no text layer at
 * all — it's a picture of a resume, not a document with words in it. Two
 * consequences follow directly from that:
 *   1. Any ATS (or our own ATS checker, when you upload the downloaded
 *      file) that tries to read the text finds nothing, so real scoring
 *      craters even though the live "check my builder resume" path (which
 *      reads the structured form data directly) looked great.
 *   2. Re-importing a downloaded PDF to keep editing it fails outright,
 *      because there's no text to extract.
 * The fix is to stop screenshotting and instead draw real text straight
 * into the PDF with jsPDF's own text APIs. That produces a smaller, crisper,
 * fully selectable/searchable/ATS-parseable file — and it's also what every
 * real resume builder does under the hood.
 *
 * This module holds the page-layout plumbing (margins, pagination,
 * paragraph wrapping) that both lib/resumeExport.js and
 * lib/coverLetterExport.js build on.
 */

export const PAGE_WIDTH = 595.28; // A4 in points
export const PAGE_HEIGHT = 841.89;
export const MARGIN_X = 56;
export const MARGIN_TOP = 58;
export const MARGIN_BOTTOM = 56;
export const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;

/** Tracks the current vertical position and pushes a new page whenever the
 * next chunk of content wouldn't fit above the bottom margin. */
export function createCursor({ onPageAdded } = {}) {
  let y = MARGIN_TOP;
  return {
    get y() {
      return y;
    },
    set y(v) {
      y = v;
    },
    ensureSpace(doc, needed) {
      if (y + needed > PAGE_HEIGHT - MARGIN_BOTTOM) {
        doc.addPage();
        onPageAdded?.(doc);
        y = MARGIN_TOP;
      }
    },
  };
}

/** Writes a left-aligned block of wrapped text, paginating as needed.
 * Returns nothing; advances cursor.y as it goes. */
export function writeParagraph(doc, cursor, text, opts = {}) {
  const {
    fontSize = 10.5,
    font = "helvetica",
    style = "normal",
    color = [51, 51, 51],
    lineHeight = 1.5,
    x = MARGIN_X,
    width = CONTENT_WIDTH,
    spaceAfter = 0,
  } = opts;
  if (!text || !text.trim()) return;

  doc.setFont(font, style);
  doc.setFontSize(fontSize);
  doc.setTextColor(...color);
  const lineStep = fontSize * lineHeight;
  const lines = doc.splitTextToSize(text.trim(), width);
  for (const line of lines) {
    cursor.ensureSpace(doc, lineStep);
    doc.text(line, x, cursor.y);
    cursor.y += lineStep;
  }
  cursor.y += spaceAfter;
}

/** A bold "Label: value" line where the value wraps under the label's
 * left edge on overflow (rather than under the label itself). */
export function writeLabeledLine(doc, cursor, label, value, opts = {}) {
  const { fontSize = 10.5, color = [51, 51, 51], lineHeight = 1.45 } = opts;
  if (!value) return;

  const lineStep = fontSize * lineHeight;
  const labelText = `${label}: `;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(fontSize);
  doc.setTextColor(17, 17, 17);
  const labelWidth = doc.getTextWidth(labelText);

  doc.setFont("helvetica", "normal");
  const valueLines = doc.splitTextToSize(value, CONTENT_WIDTH - labelWidth);

  cursor.ensureSpace(doc, lineStep);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(17, 17, 17);
  doc.text(labelText, MARGIN_X, cursor.y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...color);
  doc.text(valueLines[0] ?? "", MARGIN_X + labelWidth, cursor.y);
  cursor.y += lineStep;

  for (let i = 1; i < valueLines.length; i++) {
    cursor.ensureSpace(doc, lineStep);
    doc.text(valueLines[i], MARGIN_X, cursor.y);
    cursor.y += lineStep;
  }
}
