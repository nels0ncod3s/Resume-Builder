import { NavLink } from "react-router-dom";

const links = [
  { to: "/app/builder", label: "Resume Builder", icon: "📝", tourId: "nav-builder" },
  { to: "/app/cover-letter", label: "Cover Letter", icon: "✉️", tourId: "nav-cover-letter" },
  { to: "/app/ats-checker", label: "ATS Checker", icon: "🎯", tourId: "nav-ats" },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-60 md:flex-col md:border-r md:border-line md:bg-paper md:py-8 md:px-4 shrink-0">
      <a href="/" className="px-2 pb-8 font-display text-xl font-bold tracking-tight text-ink">
        Resume Pilot
      </a>
      <nav className="flex flex-col gap-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            data-tour={link.tourId}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-ink text-white"
                  : "text-ink-soft hover:bg-canvas hover:text-ink"
              }`
            }
          >
            <span aria-hidden="true">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
