import { BULLET_LINE_RE, mergeLoneBulletMarkers } from "./atsAnalyzer.js";
import { createDefaultResume } from "../data/defaultResume.js";

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
];

function id() {
  return crypto.randomUUID();
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

function parseProjects(lines) {
  const entries = [];
  let current = null;
  for (const line of lines) {
    const looksLikeTitle = line.length <= 60 && !/[.!?]$/.test(line);
    if (looksLikeTitle || !current) {
      if (current) entries.push(current);
      current = { id: id(), name: line, description: "" };
    } else {
      current.description = current.description ? `${current.description} ${line}` : line;
    }
  }
  if (current) entries.push(current);
  return entries;
}

const SKILL_LABELS = [
  { key: "languages", re: /^languages?:?/i },
  { key: "frameworks", re: /^(frameworks?|frontend|backend):?/i },
  { key: "tools", re: /^tools?:?/i },
  { key: "soft", re: /^soft\s*skills?:?/i },
];

function parseSkills(lines) {
  const skills = { languages: "", frameworks: "", tools: "", soft: "" };
  const leftovers = [];

  for (const line of lines) {
    const label = SKILL_LABELS.find((l) => l.re.test(line));
    if (label) {
      skills[label.key] = line.replace(label.re, "").trim();
    } else {
      leftovers.push(line);
    }
  }

  if (leftovers.length > 0 && !skills.languages) {
    skills.languages = leftovers.join(", ");
  } else if (leftovers.length > 0) {
    skills.languages += (skills.languages ? ", " : "") + leftovers.join(", ");
  }

  return skills;
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
  const preambleNoContact = sections.preamble.filter(
    (l) => !EMAIL_RE.test(l) && !PHONE_RE.test(l)
  );
  const urlMatch = preambleNoContact.join(" ").match(URL_RE) ?? fullText.match(URL_RE);

  const resume = createDefaultResume();

  if (preambleNoContact[0]) resume.name = preambleNoContact[0];
  if (preambleNoContact[1]) {
    const parts = preambleNoContact[1].split("|").map((p) => p.trim());
    resume.tagline = parts[0] ?? resume.tagline;
    resume.location = parts[1] ?? resume.location;
  }
  if (emailMatch) resume.email = emailMatch[0];
  if (phoneMatch) resume.phone = phoneMatch[0].trim();
  if (urlMatch) resume.link = urlMatch[0];

  if (sections.profile?.length) resume.profile = sections.profile.join(" ");
  if (sections.experience?.length) resume.experience = parseExperience(sections.experience);
  if (sections.education?.length) resume.education = parseEducation(sections.education);
  if (sections.projects?.length) resume.projects = parseProjects(sections.projects);
  if (sections.skills?.length) resume.skills = parseSkills(sections.skills);

  return resume;
}
