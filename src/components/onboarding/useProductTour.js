import { useEffect, useMemo, useState } from "react";
import { driver } from "driver.js";

const SEEN_KEY_PREFIX = "resumely.tour.";
const MOBILE_MEDIA_QUERY = "(max-width: 767px)";

function hasSeenTour(id) {
  return localStorage.getItem(SEEN_KEY_PREFIX + id) === "1";
}

function markTourSeen(id) {
  localStorage.setItem(SEEN_KEY_PREFIX + id, "1");
}

function isMobileViewport() {
  return typeof window !== "undefined" && window.matchMedia(MOBILE_MEDIA_QUERY).matches;
}

/**
 * Tracks whether we're currently in the mobile top-nav layout or the
 * desktop sidebar layout, and re-renders when — and only when — the
 * viewport actually crosses that breakpoint (768px, matching the `md:`
 * classes Sidebar/TopNav already use). We deliberately don't recompute on
 * every window resize pixel: tour steps are memoized off this value, and
 * rebuilding the driver.js instance on every resize tick would tear down
 * an in-progress tour's popover mid-drag. A matchMedia "change" listener
 * only fires on the actual flip, which is exactly the "dynamically update
 * placement when the layout changes" behavior we want.
 */
function useIsMobileLayout() {
  const [mobile, setMobile] = useState(isMobileViewport);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const mql = window.matchMedia(MOBILE_MEDIA_QUERY);
    const onChange = (e) => setMobile(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return mobile;
}

/**
 * A step that targets a sidebar (desktop) / top-nav (mobile) link.
 *
 * Note this app's tour library is driver.js, whose popover positioning API
 * is `side` ("top" | "right" | "bottom" | "left") + `align` ("start" |
 * "center" | "end") — not the `placement` prop used by libraries like
 * Shepherd.js or react-joyride. On desktop the link lives in the left
 * sidebar, so the popover opens to its right (side: "right"), pointing
 * left into the link without covering the sidebar itself. On mobile the
 * same link lives in the collapsed TopNav bar, so the popover instead
 * opens below it (side: "bottom"), pointing up into the header — which is
 * the driver.js equivalent of what the brief called "point upward to
 * accurately highlight the header element."
 */
function navStep({ mobile, desktopSelector, mobileSelector, title, description }) {
  return {
    element: mobile ? mobileSelector : desktopSelector,
    popover: {
      title,
      description,
      side: mobile ? "bottom" : "right",
      align: mobile ? "center" : "start",
    },
  };
}

// The sidebar's nav-* elements are display:none on mobile (the same links
// live in TopNav's mobile nav instead), so every nav step has to target
// whichever pair is actually visible for the current viewport.
function buildBuilderSteps(mobile) {
  return [
    {
      popover: {
        title: "Welcome to the Resume Builder",
        description: "Edit your details on the left — your CV updates live on the right.",
      },
    },
    navStep({
      mobile,
      desktopSelector: '[data-tour="nav-builder"]',
      mobileSelector: '[data-tour="nav-builder-mobile"]',
      title: "Resume Builder",
      description: "You're here — design your CV.",
    }),
    navStep({
      mobile,
      desktopSelector: '[data-tour="nav-cover-letter"]',
      mobileSelector: '[data-tour="nav-cover-letter-mobile"]',
      title: "Cover Letter",
      description: "Switch here any time to write a matching cover letter.",
    }),
    navStep({
      mobile,
      desktopSelector: '[data-tour="nav-ats"]',
      mobileSelector: '[data-tour="nav-ats-mobile"]',
      title: "ATS Checker",
      description: "Switch here any time for a practical structure, wording, and job-match review.",
    }),
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
}

function buildCoverLetterSteps(mobile) {
  return [
    {
      popover: {
        title: "Welcome to the Cover Letter Builder",
        description: "Write your letter on the left — the formatted page updates live on the right.",
      },
    },
    navStep({
      mobile,
      desktopSelector: '[data-tour="nav-cover-letter"]',
      mobileSelector: '[data-tour="nav-cover-letter-mobile"]',
      title: "Cover Letter",
      description: "You're here — write a letter to go with your resume.",
    }),
    navStep({
      mobile,
      desktopSelector: '[data-tour="nav-builder"]',
      mobileSelector: '[data-tour="nav-builder-mobile"]',
      title: "Resume Builder",
      description: "Head back here any time to keep working on your CV.",
    }),
    {
      element: '[data-tour="import-cover-letter-pdf"]',
      popover: {
        title: "Already have a cover letter?",
        description: "Import an existing PDF to auto-fill these fields, then just review and tweak.",
      },
    },
    {
      element: '[data-tour="cl-editor-panel"]',
      popover: {
        title: "Write your letter",
        description: "Fill in your details, the recipient, and the body paragraphs.",
      },
    },
    {
      element: '[data-tour="cl-preview"]',
      popover: {
        title: "Live preview",
        description: "This is exactly what gets exported — always true to A4 size, and it matches your resume's template.",
      },
    },
    {
      element: '[data-tour="cl-download-pdf"]',
      popover: {
        title: "Export",
        description: "Download as a PDF or PNG whenever you're happy with it.",
      },
    },
  ];
}

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

function addSkipButton(popoverDOM, driverInstance) {
  if (popoverDOM.footer.querySelector(".resumely-skip-btn")) return;
  const skipBtn = document.createElement("button");
  skipBtn.type = "button";
  skipBtn.className = "resumely-skip-btn";
  skipBtn.textContent = "Skip tour";
  skipBtn.addEventListener("click", () => driverInstance.destroy());
  popoverDOM.footer.prepend(skipBtn);
}

function useTour(id, steps, registerTour) {
  useEffect(() => {
    const driverInstance = driver({
      showProgress: true,
      popoverClass: "resumely-tour",
      steps,
      onPopoverRender: (popoverDOM, { driver: di }) => {
        addSkipButton(popoverDOM, di);
      },
    });

    registerTour?.(() => driverInstance.drive());

    let timer;
    if (!hasSeenTour(id)) {
      timer = setTimeout(() => {
        driverInstance.drive();
        markTourSeen(id);
      }, 600);
    }

    // Destroy on every dep change, not just unmount. Previously `steps` was
    // computed once at mount and never changed, so this didn't matter; now
    // that steps can change when the layout crosses the mobile/desktop
    // breakpoint mid-tour, skipping this would leave the old popover/
    // backdrop orphaned on screen underneath the new driver instance.
    return () => {
      clearTimeout(timer);
      driverInstance.destroy();
    };
  }, [id, steps, registerTour]);
}

export function useBuilderTour(registerTour) {
  const mobile = useIsMobileLayout();
  const steps = useMemo(() => buildBuilderSteps(mobile), [mobile]);
  useTour("builder", steps, registerTour);
}

export function useCoverLetterTour(registerTour) {
  const mobile = useIsMobileLayout();
  const steps = useMemo(() => buildCoverLetterSteps(mobile), [mobile]);
  useTour("cover-letter", steps, registerTour);
}

export function useAtsTour(registerTour) {
  useTour("ats", ATS_STEPS, registerTour);
}
