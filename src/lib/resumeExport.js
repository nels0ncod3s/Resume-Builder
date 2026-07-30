/** Renders the CV node at full, unscaled resolution regardless of the
 * current display scale, so exports are always crisp and identically sized. */
async function captureNode(node) {
  const { default: html2canvas } = await import("html2canvas");
  const originalTransform = node.style.transform;
  node.style.transform = "none";
  try {
    return await html2canvas(node, { scale: 2, useCORS: true });
  } finally {
    node.style.transform = originalTransform;
  }
}

export async function downloadAsImage(node, filename = "resume.png") {
  const canvas = await captureNode(node);
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

export async function downloadAsPdf(node, filename = "resume.pdf") {
  const [canvas, { default: jsPDF }] = await Promise.all([
    captureNode(node),
    import("jspdf"),
  ]);
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgData = canvas.toDataURL("image/png");
  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  pdf.save(filename);
}
