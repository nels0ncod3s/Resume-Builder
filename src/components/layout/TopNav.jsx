import { NavLink } from "react-router-dom";
import { CircleHelp, FileText, Mail, ScanSearch } from "lucide-react";
import SaveToast from "../builder/SaveToast.jsx";

const links = [
  { to: "/app/builder", label: "Builder", icon: FileText, tourId: "nav-builder-mobile" },
  { to: "/app/cover-letter", label: "Letter", icon: Mail, tourId: "nav-cover-letter-mobile" },
  { to: "/app/ats-checker", label: "ATS Check", icon: ScanSearch, tourId: "nav-ats-mobile" },
];

export default function TopNav({ title, onStartTour, saveStatus }) {
  return (
    <header className="shrink-0 border-b border-line bg-paper">
      <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-8">
        <a href="/" className="shrink-0 font-display text-lg font-bold text-ink md:hidden">
          Resume Pilot
        </a>
        <h1 className="hidden truncate text-sm font-semibold text-ink-soft md:block">{title}</h1>
        <div className="flex shrink-0 items-center gap-3">
          <SaveToast status={saveStatus} />
          <button
            type="button"
            data-tour="tour-replay"
            onClick={onStartTour}
            className="flex min-h-[40px] shrink-0 items-center gap-2 border border-line px-3 text-xs font-semibold text-ink-soft transition-colors hover:border-ink hover:text-ink"
          >
            <CircleHelp size={15} aria-hidden="true" />
            Take a tour
          </button>
        </div>
      </div>

      <nav className="flex gap-2 px-4 pb-3 md:hidden" data-tour="mobile-nav">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              data-tour={link.tourId}
              className={({ isActive }) =>
                `flex min-h-[44px] flex-1 items-center justify-center gap-1.5 text-xs font-semibold transition-colors ${
                  isActive ? "bg-ink text-white" : "border border-line text-ink-soft"
                }`
              }
            >
              <Icon size={15} aria-hidden="true" />
              {link.label}
            </NavLink>
          );
        })}
      </nav>
    </header>
  );
}
