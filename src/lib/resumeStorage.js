import { useEffect, useRef, useState } from "react";
import { createDefaultResume, sanitizeResume } from "../data/defaultResume";

const STORAGE_KEY = "resumely.resume.v1";
const SAVE_DEBOUNCE_MS = 500;

function loadResume() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultResume();
    return sanitizeResume(JSON.parse(raw));
  } catch {
    return createDefaultResume();
  }
}

/**
 * Returns [resume, setResume, saveStatus]. Writes are debounced so rapid
 * typing doesn't hit localStorage on every keystroke, and saveStatus
 * ("saved" | "saving") flips to "saving" the instant a change comes in, so
 * an indicator in the UI can show that autosave is actually happening —
 * today that's invisible, even though the data has always been persisted.
 */
export function useResumeData() {
  const [resume, setResume] = useState(loadResume);
  const [saveStatus, setSaveStatus] = useState("saved");
  const isFirstRun = useRef(true);

  useEffect(() => {
    // Skip the debounce/"Saving…" flash on initial mount — the loaded
    // resume is already what's in storage, so there's nothing new to save.
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    setSaveStatus("saving");
    const timeout = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(resume));
      } finally {
        setSaveStatus("saved");
      }
    }, SAVE_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [resume]);

  return [resume, setResume, saveStatus];
}

export function resetResume() {
  localStorage.removeItem(STORAGE_KEY);
}
