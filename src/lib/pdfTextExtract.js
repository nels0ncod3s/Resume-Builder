/** Reconstructs line breaks from text item Y-positions — pdf.js hands back
 * text items with no inherent line structure, so joining them with a plain
 * space collapses bullet markers into the same run as surrounding prose. */
function itemsToText(items) {
  let text = "";
  let line = "";
  let lastY = null;

  for (const item of items) {
    const y = item.transform[5];
    if (lastY !== null && Math.abs(y - lastY) > 1) {
      text += line.trim() + "\n";
      line = "";
    }
    line += item.str + " ";
    lastY = y;
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
