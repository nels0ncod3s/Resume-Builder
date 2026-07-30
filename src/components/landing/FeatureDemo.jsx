import { motion } from "framer-motion";
import { Link } from "react-router-dom";

function BrowserChrome() {
  return (
    <div className="mb-4 flex gap-1.5" aria-hidden="true">
      <span className="h-2.5 w-2.5 rounded-full bg-line" />
      <span className="h-2.5 w-2.5 rounded-full bg-line" />
      <span className="h-2.5 w-2.5 rounded-full bg-line" />
    </div>
  );
}

function BuilderMockup() {
  return (
    <div className="rounded-lg border border-line bg-canvas p-5" aria-hidden="true">
      <div className="mx-auto max-w-[220px] rounded-md bg-white p-4 shadow-sm">
        <div className="mx-auto mb-1.5 h-3 w-24 rounded bg-ink" />
        <div className="mx-auto mb-4 h-1.5 w-16 rounded bg-line" />
        <div className="mb-3 space-y-1.5">
          <div className="h-1.5 w-10 rounded bg-ink-soft/40" />
          <div className="h-1.5 w-full rounded bg-line" />
          <div className="h-1.5 w-5/6 rounded bg-line" />
        </div>
        <div className="space-y-1.5">
          <div className="h-1.5 w-14 rounded bg-ink-soft/40" />
          <div className="h-1.5 w-full rounded bg-line" />
          <div className="h-1.5 w-4/6 rounded bg-line" />
        </div>
      </div>
    </div>
  );
}

function AtsMockup() {
  return (
    <div className="rounded-lg border border-line bg-canvas p-5" aria-hidden="true">
      <div className="mx-auto flex max-w-[220px] flex-col items-center gap-4 rounded-md bg-white p-4 shadow-sm">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full text-sm font-bold text-ink"
          style={{
            background: `conic-gradient(#16a34a 0% 81%, #e4e1db 81% 100%)`,
          }}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white">81</span>
        </div>
        <div className="w-full space-y-2">
          {[
            { color: "bg-green-500", w: "w-full" },
            { color: "bg-green-500", w: "w-5/6" },
            { color: "bg-amber-500", w: "w-4/6" },
          ].map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className={`h-2 w-2 shrink-0 rounded-full ${row.color}`} />
              <span className={`h-1.5 ${row.w} rounded bg-line`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const panels = [
  {
    to: "/app/builder",
    eyebrow: "Resume Builder",
    title: "Design your CV live",
    body: "Edit a real, print-accurate A4 resume side-by-side with your changes.",
    cta: "Open the builder",
    mockup: BuilderMockup,
  },
  {
    to: "/app/ats-checker",
    eyebrow: "ATS Checker",
    title: "See exactly what to fix",
    body: "A 0-100 score plus a plain-English checklist of what's holding your resume back.",
    cta: "Run a check",
    mockup: AtsMockup,
  },
];

export default function FeatureDemo() {
  return (
    <section className="mx-auto grid max-w-5xl gap-6 px-6 py-20 md:grid-cols-2">
      {panels.map((panel, i) => {
        const Mockup = panel.mockup;
        return (
          <motion.div
            key={panel.to}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
            className="flex flex-col rounded-2xl border border-line bg-paper p-6"
          >
            <BrowserChrome />
            <Mockup />
            <span className="mt-5 text-xs font-semibold uppercase tracking-widest text-ink-soft">
              {panel.eyebrow}
            </span>
            <h3 className="mt-1.5 font-display text-xl font-bold text-ink">{panel.title}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{panel.body}</p>
            <Link
              to={panel.to}
              className="mt-4 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-ink transition-all hover:gap-2.5"
            >
              {panel.cta} <span aria-hidden="true">→</span>
            </Link>
          </motion.div>
        );
      })}
    </section>
  );
}
