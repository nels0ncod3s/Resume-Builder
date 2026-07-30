import { useCallback, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar.jsx";
import TopNav from "../components/layout/TopNav.jsx";

const TITLES = {
  "/app/builder": "Resume Builder",
  "/app/ats-checker": "ATS Checker",
};

export default function Workspace() {
  const location = useLocation();
  const [tourStart, setTourStart] = useState(null);

  const registerTour = useCallback((fn) => {
    setTourStart(() => fn);
  }, []);

  const title = TITLES[location.pathname] ?? "Resume Builder";

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <TopNav title={title} onStartTour={() => tourStart?.()} />
        <main className="min-h-0 flex-1 min-w-0">
          <Outlet context={{ registerTour }} />
        </main>
      </div>
    </div>
  );
}
