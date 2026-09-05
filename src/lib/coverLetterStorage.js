import { useEffect, useState } from "react";
import { createDefaultCoverLetter } from "../data/defaultCoverLetter.js";
import { getTemplate } from "../data/templates.js";

const STORAGE_KEY = "resumely.coverletter.v1";

function loadCoverLetter() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultCoverLetter();
    const saved = JSON.parse(raw);
    return {
      ...createDefaultCoverLetter(),
      ...saved,
      template: getTemplate(saved?.template).id,
    };
  } catch {
    return createDefaultCoverLetter();
  }
}

export function useCoverLetterData() {
  const [coverLetter, setCoverLetter] = useState(loadCoverLetter);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(coverLetter));
  }, [coverLetter]);

  return [coverLetter, setCoverLetter];
}

export function resetCoverLetter() {
  localStorage.removeItem(STORAGE_KEY);
}
