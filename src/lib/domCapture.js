/** Renders a DOM node at full, unscaled resolution regardless of the
 * current display scale, so exports are always crisp and identically sized. */
export async function captureNode(node) {
  const { default: html2canvas } = await import("html2canvas");
  const originalTransform = node.style.transform;
  node.style.transform = "none";
  try {
    return await html2canvas(node, { scale: 2, useCORS: true });
  } finally {
    node.style.transform = originalTransform;
  }
}

/** Downloads a screenshot of a DOM node as a PNG. This is a flattened
 * image — there is no text layer, so it's only ever appropriate for the
 * "image" export option, never for the PDF export (see resumeExport.js /
 * coverLetterExport.js for why the PDF export builds real text instead). */
export async function downloadAsImage(node, filename = "download.png") {
  const canvas = await captureNode(node);
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
