import { NavLink } from "react-router-dom";

const links = [
  { to: "/app/builder", label: "Builder", tourId: "nav-builder-mobile" },
  { to: "/app/cover-letter", label: "Cover Letter", tourId: "nav-cover-letter-mobile" },
  { to: "/app/ats-checker", label: "ATS Checker", tourId: "nav-ats-mobile" },
];

export default function TopNav({ title, onStartTour }) {
  return (
    <header className="shrink-0 border-b border-line bg-paper">
      <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-8">
        <a href="/" className="shrink-0 font-display text-lg font-bold text-ink md:hidden">
          Resume Pilot
        </a>
        <h1 className="hidden truncate text-sm font-semibold text-ink-soft md:block">{title}</h1>
        <button
          type="button"
          data-tour="tour-replay"
          onClick={onStartTour}
          className="flex min-h-[40px] shrink-0 items-center rounded-full border border-line px-4 text-xs font-semibold text-ink-soft transition-colors hover:border-ink hover:text-ink"
        >
          Take a tour
        </button>
      </div>

      <nav className="flex gap-2 px-4 pb-3 md:hidden" data-tour="mobile-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            data-tour={link.tourId}
            className={({ isActive }) =>
              `flex min-h-[44px] flex-1 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                isActive ? "bg-ink text-white" : "border border-line text-ink-soft"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
