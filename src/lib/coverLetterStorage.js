import { useEffect, useState } from "react";
import { createDefaultCoverLetter } from "../data/defaultCoverLetter.js";

const STORAGE_KEY = "resumely.coverletter.v1";

function loadCoverLetter() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultCoverLetter();
    return { ...createDefaultCoverLetter(), ...JSON.parse(raw) };
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
