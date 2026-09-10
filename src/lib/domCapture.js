/** Renders a DOM node at full, unscaled resolution regardless of the
 * current display scale, so exports are always crisp and identically sized. */
export async function captureNode(node) {
  const { default: html2canvas } = await import("html2canvas");
  const originalTransform = node.style.transform;
  node.style.transform = "none";
  try {
    return await html2canvas(node, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });
  } finally {
    node.style.transform = originalTransform;
  }
}

/** Starts a browser download from generated file data. Keeping the anchor
 * attached until after the click makes downloads reliable in Chromium,
 * Safari, and Firefox, including after an asynchronous render finishes. */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();

  window.setTimeout(() => {
    link.remove();
    URL.revokeObjectURL(url);
  }, 1_000);
}

/** Downloads a screenshot of a DOM node as a PNG. This is a flattened
 * image — there is no text layer, so it's only ever appropriate for the
 * "image" export option, never for the PDF export (see resumeExport.js /
 * coverLetterExport.js for why the PDF export builds real text instead). */
export async function downloadAsImage(node, filename = "download.png") {
  const canvas = await captureNode(node);
  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) resolve(result);
      else reject(new Error("The resume image could not be created."));
    }, "image/png");
  });
  downloadBlob(blob, filename);
}
