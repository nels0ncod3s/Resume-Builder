import { BULLET_LINE_RE, mergeLoneBulletMarkers } from "./atsAnalyzer.js";
import { createDefaultResume } from "../data/defaultResume.js";
import { generateId } from "./id.js";

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[a-z]{2,}/i;
const PHONE_RE = /(\+?\d[\d\s().-]{7,}\d)/;
const URL_RE = /((https?:\/\/)?(www\.)?[a-z0-9-]+\.(com|dev|io|app|net|org|me|co)(\/[^\s|]*)?)/i;
const DATE_RANGE_RE =
  /((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*)?\d{4}\s*[-–—to]+\s*((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*)?(\d{4}|present|current)/i;

const SECTION_HEADERS = [
  { key: "profile", re: /^(summary|profile|objective|about( me)?)$/i },
  { key: "experience", re: /^(experience|work experience|employment( history)?|work history)$/i },
  { key: "education", re: /^education$/i },
  { key: "projects", re: /^projects?$/i },
  { key: "skills", re: /^(skills|technical skills)$/i },
  { key: "achievements", re: /^(achievements?|awards?( (and|&) honors?)?|honors?)$/i },
  // Recognized so their content doesn't leak into whatever section came
  // before them, but there's no field for them in our resume model yet —
  // so they're bucketed and simply dropped rather than corrupting others.
  {
    key: "ignore",
    re: /^(certifications?|publications?|references?|interests?|languages?( spoken)?|volunteer(ing)?)$/i,
  },
];

function id() {
  return generateId();
}

function matchHeader(line) {
  const clean = line.replace(/[:.\s]+$/, "").trim();
  if (clean.length > 30) return null;
  return SECTION_HEADERS.find((h) => h.re.test(clean))?.key ?? null;
}

function extractDates(line) {
  const match = line.match(DATE_RANGE_RE);
  if (!match) return { text: line.trim(), dates: "" };
  return { text: (line.slice(0, match.index) + line.slice(match.index + match[0].length)).trim(), dates: match[0].trim() };
}

/** Groups lines into entries of [headerLine, ...bulletLines, headerLine, ...].
 * Bullets attach to the most recent non-bullet line seen. */
function groupWithBullets(lines) {
  const entries = [];
  let current = null;
  for (const line of lines) {
    if (BULLET_LINE_RE.test(line)) {
      if (!current) current = { headerLines: [], bullets: [] };
      current.bullets.push(line.replace(BULLET_LINE_RE, ""));
    } else if (current && current.bullets.length > 0) {
      entries.push(current);
      current = { headerLines: [line], bullets: [] };
    } else {
      current = current ?? { headerLines: [], bullets: [] };
      current.headerLines.push(line);
    }
  }
  if (current && (current.headerLines.length > 0 || current.bullets.length > 0)) entries.push(current);
  return entries;
}

function parseExperience(lines) {
  return groupWithBullets(lines).map((entry) => {
    const [rawTitle = "", rawCompany = ""] = entry.headerLines;
    const { text: title, dates: titleDates } = extractDates(rawTitle);
    const { text: company, dates: companyDates } = extractDates(rawCompany);
    return {
      id: id(),
      title: title || "Job Title",
      company: company || "",
      dates: titleDates || companyDates,
      bullets: entry.bullets.length > 0 ? entry.bullets : [""],
    };
  });
}

function parseEducation(lines) {
  const entries = [];
  for (let i = 0; i < lines.length; i += 2) {
    const { text: degree, dates } = extractDates(lines[i] ?? "");
    entries.push({
      id: id(),
      degree: degree || "Degree Name",
      institution: lines[i + 1] ?? "",
      dates,
    });
  }
  return entries;
}

const PROJECT_METADATA_RE = /^(tech(nologies)?|stack|tools?|built with)\s*:/i;

function parseProjects(lines) {
  const entries = [];
  let current = null;
  for (const line of lines) {
    if (BULLET_LINE_RE.test(line)) {
      if (!current) current = { id: id(), name: "Project Name", description: "", bullets: [] };
      current.bullets.push(line.replace(BULLET_LINE_RE, ""));
      continue;
    }

    const isMetadata = PROJECT_METADATA_RE.test(line) || /^\[[^\]]*\]$/.test(line);
    const looksLikeNewTitle =
      !isMetadata &&
      line.length <= 60 &&
      !/[.!?]$/.test(line) &&
      (current === null || current.description.length > 0 || current.bullets.length > 0);

    if (looksLikeNewTitle) {
      if (current) entries.push(current);
      current = { id: id(), name: line, description: "", bullets: [] };
    } else if (current) {
      current.description = current.description ? `${current.description} ${line}` : line;
    } else {
      current = { id: id(), name: line, description: "", bullets: [] };
    }
  }
  if (current) entries.push(current);
  return entries;
}

// Skills are now user-defined categories rather than a fixed
// languages/frameworks/tools/soft set, so instead of matching a short
// list of known labels, any "Label: value" line becomes its own group.
// Lines that don't fit that shape (plain comma-separated skill lists,
// the common case) are pooled into one catch-all "Skills" group.
const LABELED_SKILL_LINE_RE = /^([A-Za-z][A-Za-z\s/&-]{1,28}):\s*(.+)$/;

function titleCase(str) {
  return str.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase());
}

/** Achievements/Awards sections are almost always one line per entry
 * (often bullet- or dash-prefixed) rather than the multi-line blocks
 * Experience/Education have, so this stays a flat one-line-in, one-entry-out
 * mapping — any date found on the line is pulled out into its own field,
 * same as the other section parsers. */
function parseAchievements(lines) {
  return mergeLoneBulletMarkers(lines).map((line) => {
    const cleaned = line.replace(BULLET_LINE_RE, "").trim();
    const { text, dates } = extractDates(cleaned);
    return { id: id(), title: text || cleaned || "Achievement", dates, description: "" };
  });
}

function parseSkills(lines) {
  const groups = [];
  const leftovers = [];

  for (const line of lines) {
    const match = line.match(LABELED_SKILL_LINE_RE);
    if (match) {
      groups.push({ id: id(), label: titleCase(match[1].trim()), value: match[2].trim() });
    } else {
      leftovers.push(line);
    }
  }

  if (leftovers.length > 0) {
    groups.push({ id: id(), label: "Skills", value: leftovers.join(", ") });
  }

  return groups.length > 0 ? groups : [{ id: id(), label: "Skills", value: "" }];
}

/**
 * Best-effort heuristic parser — real-world resumes vary too much to parse
 * perfectly, so this always returns a complete resume shape and never
 * throws; the caller should prompt the user to review the result.
 */
export function parseResumeText(rawText) {
  const allLines = mergeLoneBulletMarkers(
    rawText.split("\n").map((l) => l.trim()).filter(Boolean)
  );

  const sections = { preamble: [] };
  let currentKey = "preamble";
  for (const line of allLines) {
    const header = matchHeader(line);
    if (header) {
      currentKey = header;
      sections[currentKey] = sections[currentKey] ?? [];
    } else {
      sections[currentKey] = sections[currentKey] ?? [];
      sections[currentKey].push(line);
    }
  }

  const fullText = rawText;
  const emailMatch = fullText.match(EMAIL_RE);
  const phoneMatch = fullText.match(PHONE_RE);

  const resume = createDefaultResume();

  const [nameLine, ...restLines] = sections.preamble;
  if (nameLine) resume.name = nameLine;

  // Join the remaining preamble lines with "|" so a tagline and a
  // separate "location | email | phone | link" line both land in the
  // same delimited string — real resumes put contact info on its own
  // line about as often as they cram everything onto one, and this
  // handles either case the same way instead of assuming a fixed layout.
  const restText = restLines.join(" | ");
  // Strip the email out before URL-matching — its own domain (e.g.
  // "gmail.com") is otherwise indistinguishable from a real link.
  const restTextNoEmail = emailMatch ? restText.replace(emailMatch[0], "") : restText;
  const urlMatch =
    restTextNoEmail.match(URL_RE) ??
    (emailMatch ? fullText.replace(emailMatch[0], "") : fullText).match(URL_RE);

  if (emailMatch) resume.email = emailMatch[0];
  if (phoneMatch) resume.phone = phoneMatch[0].trim();
  if (urlMatch) resume.links = [{ id: id(), label: "Portfolio", url: urlMatch[0] }];

  let taglineLocationText = restText;
  for (const token of [emailMatch?.[0], phoneMatch?.[0], urlMatch?.[0]]) {
    if (token) taglineLocationText = taglineLocationText.replace(token, "");
  }
  taglineLocationText = taglineLocationText
    .replace(/\|+/g, "|")
    .replace(/^\s*\|\s*|\s*\|\s*$/g, "")
    .trim();

  const parts = taglineLocationText.split("|").map((p) => p.trim()).filter(Boolean);
  if (parts[0]) resume.tagline = parts[0];
  if (parts[1]) resume.location = parts[1];

  if (sections.profile?.length) resume.profile = sections.profile.join(" ");
  if (sections.experience?.length) resume.experience = parseExperience(sections.experience);
  if (sections.education?.length) resume.education = parseEducation(sections.education);
  if (sections.projects?.length) resume.projects = parseProjects(sections.projects);
  if (sections.achievements?.length) resume.achievements = parseAchievements(sections.achievements);
  if (sections.skills?.length) resume.skills = parseSkills(sections.skills);

  return resume;
}
