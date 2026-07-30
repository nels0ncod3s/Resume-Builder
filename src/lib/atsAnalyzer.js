import { ACTION_VERBS } from "../data/actionVerbs.js";
import { STOPWORDS } from "../data/stopwords.js";

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[a-z]{2,}/i;
const PHONE_RE = /(\+?\d[\d\s().-]{7,}\d)/;
const SECTION_PATTERNS = {
  experience: /\b(experience|employment|work history)\b/i,
  education: /\beducation\b/i,
  skills: /\bskills\b/i,
};
const FIRST_PERSON_RE = /\b(i|me|my|myself)\b/i;
const METRIC_RE = /(\d|%|\$|₦|€|£)/;
export const BULLET_LINE_RE = /^[•\-*▪●]\s+/;
const LONE_BULLET_MARKER_RE = /^[•\-*▪●]$/;

function tokenize(text) {
  return text.toLowerCase().match(/[a-z][a-z+.#-]*[a-z]|[a-z]/g) || [];
}

/** Many PDF generators (including ours) render a bullet glyph as its own
 * text run on its own line, separate from the line it marks — so a naive
 * per-line scan misses every bullet. Merge lone markers into the next line.
 * Returns the full line array with markers merged in (non-bullet lines
 * untouched), so callers that need surrounding structure (not just the
 * bullets themselves) can reuse it too. */
export function mergeLoneBulletMarkers(lines) {
  const merged = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (LONE_BULLET_MARKER_RE.test(line) && lines[i + 1]) {
      merged.push(`${line} ${lines[i + 1]}`);
      i++;
    } else {
      merged.push(line);
    }
  }
  return merged;
}

function extractBulletsFromText(text) {
  const rawLines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return mergeLoneBulletMarkers(rawLines)
    .filter((line) => BULLET_LINE_RE.test(line))
    .map((line) => line.replace(BULLET_LINE_RE, ""));
}

function wordCount(text) {
  return (text.trim().match(/\S+/g) || []).length;
}

function pct(numerator, denominator) {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 100);
}

function check(id, label, status, detail) {
  return { id, label, status, detail };
}

function scoreChecks(checks) {
  const weight = { pass: 1, warn: 0.5, fail: 0 };
  const total = checks.reduce((sum, c) => sum + weight[c.status], 0);
  return Math.round((total / checks.length) * 100);
}

function significantTokens(text) {
  const counts = new Map();
  for (const token of tokenize(text)) {
    if (token.length < 3 || STOPWORDS.has(token)) continue;
    counts.set(token, (counts.get(token) || 0) + 1);
  }
  return counts;
}

function matchKeywords(resumeText, jdText, topN = 25) {
  const jdCounts = significantTokens(jdText);
  const resumeCounts = significantTokens(resumeText);

  const jdKeywords = [...jdCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word]) => word);

  const matched = jdKeywords.filter((word) => resumeCounts.has(word));
  const missing = jdKeywords.filter((word) => !resumeCounts.has(word));

  return {
    matchPercent: pct(matched.length, jdKeywords.length),
    matched,
    missing,
    totalKeywords: jdKeywords.length,
  };
}

/**
 * Rules-based, no-API resume analyzer.
 * @param {{text: string, bullets?: string[], jobDescription?: string}} input
 */
export function analyzeResume({ text, bullets: providedBullets, jobDescription }) {
  const checks = [];
  const bullets =
    providedBullets && providedBullets.length ? providedBullets : extractBulletsFromText(text);

  const hasEmail = EMAIL_RE.test(text);
  const hasPhone = PHONE_RE.test(text);
  checks.push(
    check(
      "contact",
      "Contact information",
      hasEmail && hasPhone ? "pass" : hasEmail || hasPhone ? "warn" : "fail",
      hasEmail && hasPhone
        ? "Email and phone number are both present."
        : `Missing ${!hasEmail ? "an email address" : "a phone number"} — ATS profiles are built from this field.`
    )
  );

  const missingSections = Object.entries(SECTION_PATTERNS)
    .filter(([, re]) => !re.test(text))
    .map(([key]) => key);
  checks.push(
    check(
      "sections",
      "Standard section headers",
      missingSections.length === 0 ? "pass" : missingSections.length === 1 ? "warn" : "fail",
      missingSections.length === 0
        ? "Experience, Education and Skills sections are all clearly labeled."
        : `Couldn't find a clearly labeled ${missingSections.join(", ")} section — ATS parsers look for these exact headers.`
    )
  );

  const words = wordCount(text);
  const lengthOk = words >= 250 && words <= 900;
  checks.push(
    check(
      "length",
      "Resume length",
      lengthOk ? "pass" : "warn",
      lengthOk
        ? `${words} words — a healthy length.`
        : words < 250
          ? `Only ${words} words — likely too thin for ATS keyword matching. Add more detail.`
          : `${words} words — trim it down; most ATS/recruiters skim rather than read in full.`
    )
  );

  checks.push(
    check(
      "bullets",
      "Bullet points in experience",
      bullets.length >= 3 ? "pass" : bullets.length > 0 ? "warn" : "fail",
      bullets.length > 0
        ? `${bullets.length} bullet point${bullets.length === 1 ? "" : "s"} detected.`
        : "No bullet points detected — use bullets for experience entries instead of paragraphs."
    )
  );

  const quantified = bullets.filter((b) => METRIC_RE.test(b));
  const quantPct = pct(quantified.length, bullets.length);
  checks.push(
    check(
      "metrics",
      "Quantified achievements",
      bullets.length === 0 ? "warn" : quantPct >= 50 ? "pass" : quantPct >= 20 ? "warn" : "fail",
      bullets.length === 0
        ? "Add bullet points with numbers to measure this."
        : `${quantPct}% of bullets include a number, %, or metric. Aim for 50%+.`
    )
  );

  const actionStarts = bullets.filter((b) => ACTION_VERBS.has(tokenize(b)[0]));
  const verbPct = pct(actionStarts.length, bullets.length);
  checks.push(
    check(
      "verbs",
      "Bullets start with a strong action verb",
      bullets.length === 0 ? "warn" : verbPct >= 60 ? "pass" : verbPct >= 30 ? "warn" : "fail",
      bullets.length === 0
        ? "Add bullet points to check verb usage."
        : `${verbPct}% of bullets open with a strong action verb (e.g. "Led", "Built", "Reduced").`
    )
  );

  const pronounHits = (text.match(new RegExp(FIRST_PERSON_RE, "gi")) || []).length;
  checks.push(
    check(
      "pronouns",
      "Avoids first-person pronouns",
      pronounHits === 0 ? "pass" : pronounHits <= 2 ? "warn" : "fail",
      pronounHits === 0
        ? "No first-person pronouns found — resumes read best in implied first person."
        : `Found ${pronounHits} instance(s) of "I / me / my" — drop them for a tighter, standard resume voice.`
    )
  );

  const textDensity = text.length;
  checks.push(
    check(
      "parseable",
      "Text is machine-readable",
      textDensity > 200 ? "pass" : textDensity > 0 ? "warn" : "fail",
      textDensity > 200
        ? "Plenty of extractable text — this document will parse cleanly in an ATS."
        : textDensity > 0
          ? "Very little extractable text was found — double-check this isn't a scanned/image-based file."
          : "No extractable text found — this looks like a scanned or image-based PDF, which most ATS cannot read at all."
    )
  );

  const generalScore = scoreChecks(checks);

  let jdMatch = null;
  if (jobDescription && jobDescription.trim().length > 0) {
    jdMatch = matchKeywords(text, jobDescription);
  }

  const overallScore = jdMatch
    ? Math.round(generalScore * 0.7 + jdMatch.matchPercent * 0.3)
    : generalScore;

  return {
    checks,
    score: overallScore,
    generalScore,
    jdMatch,
    bulletCount: bullets.length,
    wordCount: words,
  };
}
