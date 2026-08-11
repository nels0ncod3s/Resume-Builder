import { useCallback, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar.jsx";
import TopNav from "../components/layout/TopNav.jsx";

const TITLES = {
  "/app/builder": "Resume Builder",
  "/app/cover-letter": "Cover Letter",
  "/app/ats-checker": "ATS Checker",
};

export default function Workspace() {
  const location = useLocation();
  const [tourStart, setTourStart] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);

  const registerTour = useCallback((fn) => {
    setTourStart(() => fn);
  }, []);

  // Pages that autosave (currently just the resume builder) report their
  // status up here so it can live in the persistent header — that way it's
  // visible no matter how far down the editor column someone has scrolled,
  // and it's cleared automatically when they navigate to a page that
  // doesn't autosave.
  const reportSaveStatus = useCallback((status) => {
    setSaveStatus(status);
  }, []);

  const title = TITLES[location.pathname] ?? "Resume Builder";

  // index.html isn't part of this codebase, so the static <title> tag
  // can't be edited directly — this keeps the browser tab in sync with
  // whichever workspace page is active instead.
  useEffect(() => {
    document.title = `${title} · Resume Pilot`;
  }, [title]);

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <TopNav title={title} onStartTour={() => tourStart?.()} saveStatus={saveStatus} />
        <main className="min-h-0 flex-1 min-w-0">
          <Outlet context={{ registerTour, reportSaveStatus }} />
        </main>
      </div>
    </div>
  );
}
