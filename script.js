function downloadCV() {
  const cv = document.getElementById("cv");

  html2canvas(cv, {
    scale: 2, // 2x for sharper image quality
    useCORS: true,
  }).then((canvas) => {
    const link = document.createElement("a");
    link.download = "cv.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
}
