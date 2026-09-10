import {
  PAGE_WIDTH,
  PAGE_HEIGHT,
  MARGIN_X,
  MARGIN_TOP,
  CONTENT_WIDTH,
  createCursor,
  writeParagraph,
  writeLabeledLine,
} from "./pdfLayout.js";
import { getTemplate } from "../data/templates.js";
import { activeResumeLinks, linkHref, linkLabel } from "./resumeLinks.js";
import { downloadBlob, requestSaveTarget } from "./domCapture.js";

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

function layoutLinkRows(doc, links, font) {
  doc.setFont(font, "normal");
  doc.setFontSize(9.5);
  const separatorWidth = doc.getTextWidth("   |   ");
  const rows = [];
  let row = [];
  let rowWidth = 0;

  for (const link of links) {
    const label = linkLabel(link);
    const width = doc.getTextWidth(label);
    const nextWidth = rowWidth + (row.length ? separatorWidth : 0) + width;
    if (row.length && nextWidth > CONTENT_WIDTH) {
      rows.push(row);
      row = [];
      rowWidth = 0;
    }
    row.push({ label, url: linkHref(link.url), width });
    rowWidth += (row.length > 1 ? separatorWidth : 0) + width;
  }
  if (row.length) rows.push(row);
  return { rows, separatorWidth };
}

function drawLinkRows(doc, cursor, layout, { x, align, color, font }) {
  doc.setFont(font, "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...color);

  for (const row of layout.rows) {
    const totalWidth = row.reduce((sum, item) => sum + item.width, 0) +
      layout.separatorWidth * Math.max(0, row.length - 1);
    let currentX = align === "center" ? x - totalWidth / 2 : x;
    row.forEach((item, index) => {
      if (index > 0) {
        doc.text("   |   ", currentX, cursor.y);
        currentX += layout.separatorWidth;
      }
      doc.text(item.label, currentX, cursor.y);
      doc.link(currentX, cursor.y - 9.5, item.width, 12, { url: item.url });
      currentX += item.width;
    });
    cursor.y += 13;
  }
}

function drawOverflowPageTheme(doc, template) {
  doc.setFillColor(...template.pdf.accentRGB);
  if (template.headerStyle === "left-rule") {
    doc.rect(0, 0, 4, PAGE_HEIGHT, "F");
  } else {
    doc.rect(0, 0, PAGE_WIDTH, template.headerStyle === "band" ? 7 : 4, "F");
  }
}

// Mirrors CVPreview.jsx's ResumeHeader variants. `pdf.headingFont` /
// `pdf.bodyFont` are jsPDF's built-in "times"/"helvetica" — see the note
// in data/templates.js on why real webfonts aren't embedded here.
function writeHeader(doc, cursor, resume, template) {
  const { pdf } = template;
  const links = activeResumeLinks(resume);
  const linkLayout = layoutLinkRows(doc, links, pdf.bodyFont);
  const contactLine = [resume.email, resume.phone].filter(Boolean).join("   |   ");

  if (pdf.headerBand) {
    const bandHeight = 87 + (resume.tagline || resume.location ? 15 : 0) +
      (contactLine ? 15 : 0) + linkLayout.rows.length * 13;
    doc.setFillColor(...pdf.accentRGB);
    doc.rect(0, 0, PAGE_WIDTH, bandHeight, "F");

    cursor.y = 46;
    doc.setFont(pdf.headingFont, "bold");
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text(resume.name || "", PAGE_WIDTH / 2, cursor.y, { align: "center" });
    cursor.y += 19;

    const taglineLine = [resume.tagline, resume.location].filter(Boolean).join("   |   ");
    if (taglineLine) {
      doc.setFont(pdf.bodyFont, "bold");
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text(taglineLine.toUpperCase(), PAGE_WIDTH / 2, cursor.y, { align: "center" });
      cursor.y += 15;
    }

    if (contactLine) {
      doc.setFont(pdf.bodyFont, "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(255, 255, 255);
      doc.text(contactLine, PAGE_WIDTH / 2, cursor.y, { align: "center" });
      cursor.y += 15;
    }

    drawLinkRows(doc, cursor, linkLayout, {
      x: PAGE_WIDTH / 2,
      align: "center",
      color: [255, 255, 255],
      font: pdf.bodyFont,
    });

    cursor.y = bandHeight + 26;
    return;
  }

  doc.setFillColor(...pdf.accentRGB);
  if (template.headerStyle === "left-rule") {
    doc.rect(0, 0, 4, PAGE_HEIGHT, "F");
  } else {
    doc.rect(0, 0, PAGE_WIDTH, 4, "F");
  }
  cursor.y = MARGIN_TOP + 14;

  const align = pdf.headerAlign === "left" ? "left" : "center";
  const x = align === "left" ? MARGIN_X : PAGE_WIDTH / 2;

  doc.setFont(pdf.headingFont, "bold");
  doc.setFontSize(25);
  doc.setTextColor(17, 17, 17);
  doc.text(resume.name || "", x, cursor.y, { align });
  cursor.y += 20;

  const taglineLine = [resume.tagline, resume.location].filter(Boolean).join("   |   ");
  if (taglineLine) {
    doc.setFont(pdf.bodyFont, "bold");
    doc.setFontSize(10);
    doc.setTextColor(...pdf.accentRGB);
    doc.text(taglineLine.toUpperCase(), x, cursor.y, { align });
    cursor.y += 15;
  }

  if (contactLine) {
    doc.setFont(pdf.bodyFont, "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(119, 119, 119);
    doc.text(contactLine, x, cursor.y, { align });
    cursor.y += 20;
  }

  drawLinkRows(doc, cursor, linkLayout, {
    x,
    align,
    color: [85, 85, 85],
    font: pdf.bodyFont,
  });

  if (align === "left") {
    doc.setDrawColor(...pdf.accentRGB);
    doc.setLineWidth(1.25);
    doc.line(MARGIN_X, cursor.y, MARGIN_X + CONTENT_WIDTH, cursor.y);
    cursor.y += 16;
  }
}

function writeSectionHeader(doc, cursor, title, template) {
  cursor.ensureSpace(doc, 34);
  cursor.y += 12;
  doc.setFont(template.pdf.headingFont, "bold");
  doc.setFontSize(12.5);
  doc.setTextColor(17, 17, 17);
  doc.text(title.toUpperCase(), MARGIN_X, cursor.y);
  cursor.y += 5;
  doc.setDrawColor(...template.pdf.accentRGB);
  doc.setLineWidth(0.9);
  doc.line(MARGIN_X, cursor.y, MARGIN_X + CONTENT_WIDTH, cursor.y);
  cursor.y += 15;
}

// Title on the left, dates right-aligned on the same line — matching the
// on-screen template. Kept as two separate text() calls at the same
// baseline; pdfTextExtract.js's word-gap heuristic reliably rejoins them
// into "Title Month Year – Month Year" on re-extraction, which is exactly
// the shape resumeImport.js's date-stripping parser expects.
function writeEntryHeader(doc, cursor, title, dates, template) {
  cursor.ensureSpace(doc, 15);
  doc.setFont(template.pdf.bodyFont, "normal");
  doc.setFontSize(11.5);
  doc.setTextColor(17, 17, 17);
  doc.text(title || "", MARGIN_X, cursor.y);
  if (dates) {
    doc.setFont(template.pdf.headingFont, "italic");
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

function renderResumeToPdf(doc, resume, template) {
  const cursor = createCursor({ onPageAdded: (pageDoc) => drawOverflowPageTheme(pageDoc, template) });
  writeHeader(doc, cursor, resume, template);

  if (resume.profile?.trim()) {
    writeSectionHeader(doc, cursor, "Profile", template);
    writeParagraph(doc, cursor, resume.profile);
  }

  if (resume.education?.length) {
    writeSectionHeader(doc, cursor, "Education", template);
    for (const item of resume.education) {
      writeEntryHeader(doc, cursor, item.degree, item.dates, template);
      writeSubLine(doc, cursor, item.institution);
      cursor.y += 4;
    }
  }

  if (resume.experience?.length) {
    writeSectionHeader(doc, cursor, "Experience", template);
    for (const item of resume.experience) {
      writeEntryHeader(doc, cursor, item.title, item.dates, template);
      writeSubLine(doc, cursor, item.company);
      writeBullets(doc, cursor, (item.bullets || []).filter(Boolean));
      cursor.y += 3;
    }
  }

  if (resume.projects?.length) {
    writeSectionHeader(doc, cursor, "Projects", template);
    for (const item of resume.projects) {
      cursor.ensureSpace(doc, 15);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(17, 17, 17);
      doc.text(item.name || "", MARGIN_X, cursor.y);
      cursor.y += 14;
      writeParagraph(doc, cursor, item.description, { spaceAfter: item.bullets?.length ? 0 : 6 });
      writeBullets(doc, cursor, (item.bullets || []).filter(Boolean));
    }
  }

  if (resume.achievements?.length) {
    writeSectionHeader(doc, cursor, "Achievements", template);
    for (const item of resume.achievements) {
      writeEntryHeader(doc, cursor, item.title, item.dates, template);
      writeParagraph(doc, cursor, item.description, { spaceAfter: 4 });
    }
  }

  const skillGroups = (resume.skills || []).filter((g) => g.value?.trim());
  if (skillGroups.length > 0) {
    if (skillGroups.length === 1) {
      writeSectionHeader(doc, cursor, skillGroups[0].label || "Skills", template);
      writeParagraph(doc, cursor, skillGroups[0].value);
    } else {
      writeSectionHeader(doc, cursor, "Skills", template);
      for (const group of skillGroups) {
        writeLabeledLine(doc, cursor, group.label || "Skills", group.value);
      }
    }
  }
}

/** Builds and downloads the resume as a real, text-based PDF (no
 * screenshot involved) so it stays fully ATS-parseable and re-importable
 * after download. Takes the resume data object, not a DOM node. Reads
 * resume.template internally (same source of truth the on-screen preview
 * uses) so callers never have to thread the template through separately. */
export async function downloadAsPdf(resume, filename) {
  const outputName = filename || `${slugify(resume.name)}.pdf`;
  const target = await requestSaveTarget(outputName, "application/pdf", ".pdf", "PDF document");
  if (target.kind === "cancelled") return false;

  // jsPDF's ESM build exposes the constructor as a named export. Its
  // default export is a namespace object, so `new default()` throws at
  // runtime even though Vite can bundle it successfully.
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  renderResumeToPdf(doc, resume, getTemplate(resume.template));
  return downloadBlob(doc.output("blob"), outputName, target);
}
