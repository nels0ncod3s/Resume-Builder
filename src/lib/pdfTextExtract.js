/** Reconstructs readable text from pdf.js's flat list of positioned glyph
 * runs, which has no inherent line or word structure. Two real-world PDFs
 * exposed the same underlying problem here: (1) draw order in the content
 * stream doesn't have to match visual reading order — a two-column resume
 * (sidebar + main content) can interleave into scrambled text if you just
 * walk items in the order pdf.js returns them; (2) many PDF generators
 * position each word as its own run with no space character between them,
 * relying on layout alone for the gap — naively concatenating runs then
 * glues words together ("SkillsJavaScript"). Both are fixed by explicitly
 * sorting into a normalized top-to-bottom, left-to-right order and only
 * inserting a space where there's an actual visible gap between runs. */
// Glyphs on what's visually the same line don't always share an exact Y —
// e.g. a bullet marker can sit ~2-3pt off the paragraph text's baseline.
// This is comfortably below normal line-to-line spacing (~11-13pt for
// typical resume body text), so it's safe to treat anything within it as
// the same line without risking merging genuinely separate lines together.
const LINE_Y_TOLERANCE = 4;

function itemsToText(items) {
  const positioned = items
    .filter((item) => item.str.length > 0)
    .map((item) => ({
      str: item.str,
      x: item.transform[4],
      y: item.transform[5],
      width: item.width ?? 0,
      fontSize: Math.abs(item.transform[0]) || Math.abs(item.transform[3]) || 10,
    }));

  positioned.sort((a, b) => {
    if (Math.abs(a.y - b.y) > LINE_Y_TOLERANCE) return b.y - a.y;
    return a.x - b.x;
  });

  let text = "";
  let line = "";
  let lastY = null;
  let lastRight = null;
  let currentLineFontSize = null;
  let previousLineFontSize = null;

  for (const item of positioned) {
    if (lastY !== null && Math.abs(item.y - lastY) > LINE_Y_TOLERANCE) {
      text += line.trim() + "\n";
      // A vertical gap noticeably taller than a normal line-to-line step
      // usually means a paragraph break or a new section rather than just
      // the next line of the same paragraph. Preserving that as a blank
      // line means downstream consumers — e.g. reflowing extracted text
      // back into an editable field — don't fuse unrelated paragraphs
      // together. Lines within a single wrapped paragraph normally step by
      // ~1.2-1.5x the font size, so anywhere past ~1.8x is a safe cutoff.
      const refSize = Math.max(currentLineFontSize ?? 0, previousLineFontSize ?? 0) || item.fontSize;
      if (lastY - item.y > refSize * 1.8) {
        text += "\n";
      }
      previousLineFontSize = currentLineFontSize;
      line = "";
      lastRight = null;
      currentLineFontSize = null;
    }
    if (lastRight !== null && item.x - lastRight > item.fontSize * 0.2) {
      line += " ";
    }
    line += item.str;
    lastY = item.y;
    lastRight = item.x + item.width;
    currentLineFontSize = Math.max(currentLineFontSize ?? 0, item.fontSize);
  }
  return text + line.trim() + "\n";
}

/** Extracts raw text from a PDF file. A near-empty result for a
 * multi-page document usually means the PDF is image-based/scanned —
 * which is itself a useful ATS-compatibility signal upstream. */
export async function extractPdfText(file) {
  const [pdfjsLib, { default: pdfjsWorker }] = await Promise.all([
    import("pdfjs-dist"),
    import("pdfjs-dist/build/pdf.worker.mjs?url"),
  ]);
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += itemsToText(content.items);
  }

  return { text: text.trim(), pageCount: pdf.numPages };
}
