import {
  PAGE_WIDTH,
  MARGIN_X,
  MARGIN_TOP,
  CONTENT_WIDTH,
  createCursor,
  writeParagraph,
  writeLabeledLine,
} from "./pdfLayout.js";

export { downloadAsImage } from "./domCapture.js";

function slugify(name) {
  return (
    (name || "resume")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "resume"
  );
}

function writeHeader(doc, cursor, resume) {
  doc.setFillColor(26, 26, 26);
  doc.rect(0, 0, PAGE_WIDTH, 4, "F");
  cursor.y = MARGIN_TOP + 14;

  doc.setFont("times", "bold");
  doc.setFontSize(25);
  doc.setTextColor(17, 17, 17);
  doc.text(resume.name || "", PAGE_WIDTH / 2, cursor.y, { align: "center" });
  cursor.y += 20;

  const taglineLine = [resume.tagline, resume.location].filter(Boolean).join("   |   ");
  if (taglineLine) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(85, 85, 85);
    doc.text(taglineLine.toUpperCase(), PAGE_WIDTH / 2, cursor.y, { align: "center" });
    cursor.y += 15;
  }

  const contactLine = [resume.email, resume.phone, resume.link].filter(Boolean).join("   |   ");
  if (contactLine) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(119, 119, 119);
    doc.text(contactLine, PAGE_WIDTH / 2, cursor.y, { align: "center" });
    cursor.y += 20;
  }
}

function writeSectionHeader(doc, cursor, title) {
  cursor.ensureSpace(doc, 34);
  cursor.y += 12;
  doc.setFont("times", "bold");
  doc.setFontSize(12.5);
  doc.setTextColor(17, 17, 17);
  doc.text(title.toUpperCase(), MARGIN_X, cursor.y);
  cursor.y += 5;
  doc.setDrawColor(17, 17, 17);
  doc.setLineWidth(0.75);
  doc.line(MARGIN_X, cursor.y, MARGIN_X + CONTENT_WIDTH, cursor.y);
  cursor.y += 15;
}

// Title on the left, dates right-aligned on the same line — matching the
// on-screen template. Kept as two separate text() calls at the same
// baseline; pdfTextExtract.js's word-gap heuristic reliably rejoins them
// into "Title Month Year – Month Year" on re-extraction, which is exactly
// the shape resumeImport.js's date-stripping parser expects.
function writeEntryHeader(doc, cursor, title, dates) {
  cursor.ensureSpace(doc, 15);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11.5);
  doc.setTextColor(17, 17, 17);
  doc.text(title || "", MARGIN_X, cursor.y);
  if (dates) {
    doc.setFont("times", "italic");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    const w = doc.getTextWidth(dates);
    doc.text(dates, MARGIN_X + CONTENT_WIDTH - w, cursor.y);
  }
  cursor.y += 14;
}

function writeSubLine(doc, cursor, str) {
  if (!str) return;
  cursor.ensureSpace(doc, 13);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(85, 85, 85);
  doc.text(str, MARGIN_X, cursor.y);
  cursor.y += 13;
}

function writeBullets(doc, cursor, bullets) {
  const indent = 13;
  const width = CONTENT_WIDTH - indent;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(51, 51, 51);
  for (const bullet of bullets) {
    if (!bullet) continue;
    const lines = doc.splitTextToSize(bullet, width);
    lines.forEach((line, i) => {
      cursor.ensureSpace(doc, 15);
      doc.text(i === 0 ? `•  ${line}` : `   ${line}`, MARGIN_X, cursor.y);
      cursor.y += 15;
    });
  }
  cursor.y += 3;
}

function renderResumeToPdf(doc, resume) {
  const cursor = createCursor();
  writeHeader(doc, cursor, resume);

  if (resume.profile?.trim()) {
    writeSectionHeader(doc, cursor, "Profile");
    writeParagraph(doc, cursor, resume.profile);
  }

  if (resume.education?.length) {
    writeSectionHeader(doc, cursor, "Education");
    for (const item of resume.education) {
      writeEntryHeader(doc, cursor, item.degree, item.dates);
      writeSubLine(doc, cursor, item.institution);
      cursor.y += 4;
    }
  }

  if (resume.experience?.length) {
    writeSectionHeader(doc, cursor, "Experience");
    for (const item of resume.experience) {
      writeEntryHeader(doc, cursor, item.title, item.dates);
      writeSubLine(doc, cursor, item.company);
      writeBullets(doc, cursor, (item.bullets || []).filter(Boolean));
      cursor.y += 3;
    }
  }

  if (resume.projects?.length) {
    writeSectionHeader(doc, cursor, "Projects");
    for (const item of resume.projects) {
      cursor.ensureSpace(doc, 15);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(17, 17, 17);
      doc.text(item.name || "", MARGIN_X, cursor.y);
      cursor.y += 14;
      writeParagraph(doc, cursor, item.description, { spaceAfter: 6 });
    }
  }

  const { languages, frameworks, tools, soft } = resume.skills || {};
  if (languages || frameworks || tools || soft) {
    writeSectionHeader(doc, cursor, "Skills");
    writeLabeledLine(doc, cursor, "Languages", languages);
    writeLabeledLine(doc, cursor, "Frameworks", frameworks);
    writeLabeledLine(doc, cursor, "Tools", tools);
    writeLabeledLine(doc, cursor, "Soft Skills", soft);
  }
}

/** Builds and downloads the resume as a real, text-based PDF (no
 * screenshot involved) so it stays fully ATS-parseable and re-importable
 * after download. Takes the resume data object, not a DOM node. */
export async function downloadAsPdf(resume, filename) {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  renderResumeToPdf(doc, resume);
  doc.save(filename || `${slugify(resume.name)}.pdf`);
}
