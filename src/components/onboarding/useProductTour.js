import { useEffect, useRef } from "react";
import { driver } from "driver.js";

const SEEN_KEY_PREFIX = "resumely.tour.";

function hasSeenTour(id) {
  return localStorage.getItem(SEEN_KEY_PREFIX + id) === "1";
}

function markTourSeen(id) {
  localStorage.setItem(SEEN_KEY_PREFIX + id, "1");
}

const BUILDER_STEPS = [
  {
    popover: {
      title: "Welcome to the Resume Builder",
      description: "Edit your details on the left — your CV updates live on the right.",
    },
  },
  {
    element: '[data-tour="nav-builder"]',
    popover: { title: "Resume Builder", description: "You're here — design your CV." },
  },
  {
    element: '[data-tour="nav-ats"]',
    popover: {
      title: "ATS Checker",
      description: "Switch here any time to stress-test your resume against ATS filters.",
    },
  },
  {
    element: '[data-tour="import-pdf"]',
    popover: {
      title: "Already have a resume?",
      description: "Import an existing PDF to auto-fill these fields, then just review and tweak.",
    },
  },
  {
    element: '[data-tour="editor-panel"]',
    popover: {
      title: "Edit your details",
      description: "Fill in each section — header, experience, projects, skills.",
    },
  },
  {
    element: '[data-tour="cv-preview"]',
    popover: {
      title: "Live preview",
      description: "This is exactly what gets exported — always true to A4 size.",
    },
  },
  {
    element: '[data-tour="download-pdf"]',
    popover: {
      title: "Export",
      description: "Download as a PDF or PNG whenever you're happy with it.",
    },
  },
];

const ATS_STEPS = [
  {
    popover: {
      title: "Welcome to the ATS Checker",
      description: "See how your resume holds up against real applicant tracking systems.",
    },
  },
  {
    element: '[data-tour="ats-source"]',
    popover: {
      title: "Choose a source",
      description: "Check the resume you're building, or upload an existing PDF.",
    },
  },
  {
    element: '[data-tour="ats-jd"]',
    popover: {
      title: "Match a job description",
      description: "Paste one in to see your keyword match score against it.",
    },
  },
  {
    element: '[data-tour="ats-results"]',
    popover: {
      title: "Your results",
      description: "A 0-100 score plus a fix-it checklist, updated live as you edit.",
    },
  },
];

function useTour(id, steps, registerTour) {
  const driverRef = useRef(null);

  useEffect(() => {
    driverRef.current = driver({
      showProgress: true,
      popoverClass: "resumely-tour",
      steps,
    });

    registerTour?.(() => driverRef.current?.drive());

    if (!hasSeenTour(id)) {
      const timer = setTimeout(() => {
        driverRef.current?.drive();
        markTourSeen(id);
      }, 600);
      return () => clearTimeout(timer);
    }

    return undefined;
  }, [id, steps, registerTour]);
}

export function useBuilderTour(registerTour) {
  useTour("builder", BUILDER_STEPS, registerTour);
}

export function useAtsTour(registerTour) {
  useTour("ats", ATS_STEPS, registerTour);
}
