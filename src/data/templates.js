/**
 * Template tokens shared by the Resume Builder and Cover Letter Builder.
 *
 * A single template id (e.g. "modern-mono") drives BOTH the resume preview
 * (CVPreview) and the cover letter preview (CoverLetterPreview), plus their
 * jsPDF export renderers (resumeExport.js / coverLetterExport.js). That's a
 * deliberate structural choice: rather than maintaining separate
 * "resume template" / "cover letter template" catalogs and a mapping table
 * between them, both documents just read the same token object. That
 * guarantees the design rule the pairing needs by construction — matching
 * typography hierarchy, accent color, header treatment, and margins — since
 * there's only one source of truth per template, not two that could drift.
 *
 * `headerStyle` is intentionally a small, fixed enum (not free-form CSS)
 * because every consumer (React preview + jsPDF renderer) has to be able to
 * express it in its own medium:
 *   - "centered-rule": thin full-width accent bar, centered header text.
 *   - "left-rule":     left-aligned header under an accent bottom-border.
 *   - "band":          full-bleed accent-colored header block, white text.
 *
 * `pdf.headingFont` / `pdf.bodyFont` intentionally map to jsPDF's built-in
 * standard fonts ("times" | "helvetica" | "courier") rather than embedding
 * the actual on-screen webfonts (Playfair Display / DM Sans / Space Mono).
 * Embedding real fonts in jsPDF means shipping base64 font files and
 * calling doc.addFont() for every weight/style used, which is a
 * meaningfully heavier and slower pipeline. Since the resume/cover letter
 * PDFs are drawn as real vector text (see pdfLayout.js) rather than
 * screenshotted, they need to stay on fonts jsPDF ships natively to
 * guarantee crisp, fast, always-available export — the visual pairing
 * comes from serif/sans/mono + accent color, not from matching the exact
 * webfont.
 */

export const DEFAULT_TEMPLATE_ID = "classic-serif";

export const TEMPLATES = [
  {
    id: "classic-serif",
    name: "Classic Serif",
    description: "Centered serif headline with a thin accent rule. Resume Pilot's original look.",
    fonts: {
      heading: '"Playfair Display", serif',
      body: '"DM Sans", sans-serif',
    },
    accent: "#1a1a1a",
    headerStyle: "centered-rule",
    swatch: { bg: "#ffffff", accent: "#1a1a1a" },
    pdf: {
      headingFont: "times",
      bodyFont: "helvetica",
      accentRGB: [26, 26, 26],
      headerBand: false,
      headerAlign: "center",
    },
  },
  {
    id: "modern-mono",
    name: "Modern Mono",
    description: "Left-aligned sans-serif headline, solid accent underline. Minimal and ATS-first.",
    fonts: {
      heading: '"DM Sans", sans-serif',
      body: '"DM Sans", sans-serif',
    },
    accent: "#0f766e",
    headerStyle: "left-rule",
    swatch: { bg: "#ffffff", accent: "#0f766e" },
    pdf: {
      headingFont: "helvetica",
      bodyFont: "helvetica",
      accentRGB: [15, 118, 110],
      headerBand: false,
      headerAlign: "left",
    },
  },
  {
    id: "bold-editorial",
    name: "Bold Editorial",
    description: "Full-width color header band with serif display type. Confident and distinctive.",
    fonts: {
      heading: '"Playfair Display", serif',
      body: '"DM Sans", sans-serif',
    },
    accent: "#7c2d12",
    headerStyle: "band",
    swatch: { bg: "#7c2d12", accent: "#7c2d12" },
    pdf: {
      headingFont: "times",
      bodyFont: "helvetica",
      accentRGB: [124, 45, 18],
      headerBand: true,
      headerAlign: "center",
    },
  },
  {
    id: "code-clean",
    name: "Code Clean",
    description:
      "Left-aligned monospace headline, sharp accent underline. Built for engineering and technical resumes.",
    fonts: {
      heading: '"Space Mono", monospace',
      body: '"DM Sans", sans-serif',
    },
    accent: "#4338ca",
    headerStyle: "left-rule",
    swatch: { bg: "#ffffff", accent: "#4338ca" },
    pdf: {
      // jsPDF's built-in Courier is the closest standard font to a
      // monospace webfont without embedding one — see the file-level note
      // above on why templates stick to jsPDF's native fonts.
      headingFont: "courier",
      bodyFont: "helvetica",
      accentRGB: [67, 56, 202],
      headerBand: false,
      headerAlign: "left",
    },
  },
  {
    id: "quiet-sans",
    name: "Quiet Sans",
    description: "Centered sans-serif headline with a soft accent rule. Understated and easy to scan.",
    fonts: {
      heading: '"DM Sans", sans-serif',
      body: '"DM Sans", sans-serif',
    },
    accent: "#1d4ed8",
    headerStyle: "centered-rule",
    swatch: { bg: "#ffffff", accent: "#1d4ed8" },
    pdf: {
      headingFont: "helvetica",
      bodyFont: "helvetica",
      accentRGB: [29, 78, 216],
      headerBand: false,
      headerAlign: "center",
    },
  },
];

export function getTemplate(id) {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES.find((t) => t.id === DEFAULT_TEMPLATE_ID);
}
