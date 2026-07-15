const CV_WIDTH = 794; // A4 at 96dpi
const CV_HEIGHT = 1123;

/* ── Responsive scaling ──
   #cv keeps its true 794×1123 pixel size at all times (so exports stay
   sharp and consistent). On narrow screens we just scale it down
   visually with a CSS transform, and shrink the wrapper to match so
   there's no blank space left over. */
function updateCVScale() {
  const viewport = document.querySelector(".cv-viewport");
  const cv = document.getElementById("cv");
  if (!viewport || !cv) return;

  const available = viewport.clientWidth;
  const scale = Math.min(1, available / CV_WIDTH);

  cv.style.transform = `scale(${scale})`;
  viewport.style.height = `${CV_HEIGHT * scale}px`;
}

window.addEventListener("load", updateCVScale);
window.addEventListener("resize", updateCVScale);

/* Renders #cv at full, unscaled resolution regardless of the current
   display scale, so exports are always crisp and identically sized. */
function captureCV() {
  const cv = document.getElementById("cv");
  const originalTransform = cv.style.transform;
  cv.style.transform = "none";

  return html2canvas(cv, {
    scale: 2,
    useCORS: true,
  }).then((canvas) => {
    cv.style.transform = originalTransform;
    return canvas;
  });
}

function downloadCVAsImage() {
  captureCV().then((canvas) => {
    const link = document.createElement("a");
    link.download = "cv.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
}

function downloadCVAsPDF() {
  captureCV().then((canvas) => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgData = canvas.toDataURL("image/png");

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("cv.pdf");
  });
}
