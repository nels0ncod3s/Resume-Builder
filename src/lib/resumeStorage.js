import { useEffect, useState } from "react";
import { createDefaultResume, sanitizeResume } from "../data/defaultResume";

const STORAGE_KEY = "resumely.resume.v1";

function loadResume() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultResume();
    return sanitizeResume(JSON.parse(raw));
  } catch {
    return createDefaultResume();
  }
}

export function useResumeData() {
  const [resume, setResume] = useState(loadResume);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resume));
  }, [resume]);

  return [resume, setResume];
}

export function resetResume() {
  localStorage.removeItem(STORAGE_KEY);
}
