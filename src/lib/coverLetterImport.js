import { createDefaultCoverLetter } from "../data/defaultCoverLetter.js";

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[a-z]{2,}/i;
const PHONE_RE = /(\+?\d[\d\s().-]{7,}\d)/;
const SALUTATION_RE = /^dear\s+([^,:]+)[,:]?\s*$/i;
const CLOSING_RE =
  /^(sincerely|regards|best regards|kind regards|warm regards|best|respectfully|thank you|yours truly|yours sincerely|with gratitude)[,]?\s*$/i;

function wordCount(str) {
  return (str.trim().match(/\S+/g) || []).length;
}

/**
 * Best-effort heuristic parser for an uploaded cover letter's extracted
 * text. Real cover letters vary far more in structure than resumes (no
 * standard section headers to key off), so this only confidently pulls out
 * the handful of patterns that are reliably recognizable — a "Dear ___,"
 * salutation, a sign-off like "Sincerely," plus the short name line under
 * it, and an email/phone number anywhere in the text — and drops everything
 * else into the editable body. Always returns a complete cover letter
 * shape and never throws; the caller should prompt the user to review it.
 */
export function parseCoverLetterText(rawText) {
  const paragraphs = rawText
    .split(/\n\s*\n/)
    .map((p) =>
      p
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .join(" ")
        .trim()
    )
    .filter(Boolean);

  const letter = createDefaultCoverLetter();
  const remaining = [...paragraphs];

  const emailMatch = rawText.match(EMAIL_RE);
  const phoneMatch = rawText.match(PHONE_RE);
  if (emailMatch) letter.senderEmail = emailMatch[0];
  if (phoneMatch) letter.senderPhone = phoneMatch[0].trim();

  // A short leading paragraph carrying the sender's own contact details
  // (a letterhead-style block) — pull a plausible name out of it and drop
  // it from the body rather than let it leak into the first paragraph.
  if (remaining.length && (emailMatch || phoneMatch)) {
    const first = remaining[0];
    const looksLikeHeader =
      (emailMatch && first.includes(emailMatch[0])) || (phoneMatch && first.includes(phoneMatch[0]));
    if (looksLikeHeader && wordCount(first) <= 25) {
      const namePart = first
        .replace(emailMatch?.[0] ?? "", "")
        .replace(phoneMatch?.[0] ?? "", "")
        .split(/[|•]/)[0]
        .replace(/[,|]+$/, "")
        .trim();
      if (namePart && namePart.length <= 60 && !SALUTATION_RE.test(namePart)) {
        letter.senderName = namePart;
      }
      remaining.shift();
    }
  }

  const salutationIndex = remaining.findIndex((p) => SALUTATION_RE.test(p));
  if (salutationIndex !== -1) {
    const match = remaining[salutationIndex].match(SALUTATION_RE);
    letter.salutation = remaining[salutationIndex];
    if (match?.[1]) letter.recipientName = match[1].trim();
    remaining.splice(salutationIndex, 1);
  }

  const closingIndex = remaining.findIndex((p) => CLOSING_RE.test(p));
  if (closingIndex !== -1) {
    letter.closing = remaining[closingIndex];
    const next = remaining[closingIndex + 1];
    if (next && wordCount(next) <= 6 && !/[.!?]$/.test(next)) {
      letter.senderName = next;
      remaining.splice(closingIndex, 2);
    } else {
      remaining.splice(closingIndex, 1);
    }
  }

  letter.body = remaining.join("\n\n");
  return letter;
}
