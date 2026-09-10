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
export async function requestSaveTarget(filename, mimeType, extension, description) {
  if (typeof window.showSaveFilePicker !== "function") {
    return { kind: "download" };
  }

  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: filename,
      types: [
        {
          description,
          accept: { [mimeType]: [extension] },
        },
      ],
    });
    return { kind: "file-handle", handle };
  } catch (error) {
    if (error?.name === "AbortError") return { kind: "cancelled" };
    throw error;
  }
}

export async function downloadBlob(blob, filename, target = { kind: "download" }) {
  if (target.kind === "cancelled") return false;

  if (target.kind === "file-handle") {
    const writable = await target.handle.createWritable();
    await writable.write(blob);
    await writable.close();
    return true;
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.position = "fixed";
  link.style.left = "-9999px";
  document.body.appendChild(link);
  link.click();

  window.setTimeout(() => {
    link.remove();
    URL.revokeObjectURL(url);
  }, 1_000);
  return true;
}

/** Downloads a screenshot of a DOM node as a PNG. This is a flattened
 * image — there is no text layer, so it's only ever appropriate for the
 * "image" export option, never for the PDF export (see resumeExport.js /
 * coverLetterExport.js for why the PDF export builds real text instead). */
export async function downloadAsImage(node, filename = "download.png") {
  // Ask where to save while the original button click still owns browser
  // activation. Waiting until html2canvas finishes can cause Chrome to
  // reject the download without showing anything.
  const target = await requestSaveTarget(filename, "image/png", ".png", "PNG image");
  if (target.kind === "cancelled") return false;

  const canvas = await captureNode(node);
  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) resolve(result);
      else reject(new Error("The resume image could not be created."));
    }, "image/png");
  });
  return downloadBlob(blob, filename, target);
}
