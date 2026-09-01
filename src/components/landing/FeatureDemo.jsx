import { ArrowRight, FileCheck2, FileText, Mail, ScanSearch } from "lucide-react";
import { Link } from "react-router-dom";
import { TEMPLATES } from "../../data/templates.js";

const steps = [
  {
    number: "01",
    icon: FileText,
    title: "Build the resume",
    body: "Edit your content beside a print-accurate preview, reorder sections, import an existing PDF, and autosave as you work.",
    to: "/app/builder",
    cta: "Open resume builder",
  },
  {
    number: "02",
    icon: Mail,
    title: "Match the cover letter",
    body: "Use the same design system for your letter, so the application feels intentional from the first page to the last.",
    to: "/app/cover-letter",
    cta: "Write a cover letter",
  },
  {
    number: "03",
    icon: ScanSearch,
    title: "Review the fit",
    body: "Check structure, readability, achievement language, and overlap with a specific job description before you apply.",
    to: "/app/ats-checker",
    cta: "Run an ATS check",
  },
];

export default function FeatureDemo() {
  return (
    <>
      <section id="workflow" className="px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase text-ink-soft">One application workflow</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">
              From first draft to final check
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft sm:text-base">
              Resume Pilot keeps the tools that belong together in one quiet workspace, with no
              handoff between accounts, files, or subscriptions.
            </p>
          </div>

          <div className="mt-12 grid border-y border-line md:grid-cols-3 md:divide-x md:divide-line">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <article key={step.number} className="border-b border-line py-8 last:border-b-0 md:border-b-0 md:px-8 md:first:pl-0 md:last:pr-0">
                  <div className="flex items-center justify-between">
                    <Icon size={22} strokeWidth={1.6} className="text-ink" aria-hidden="true" />
                    <span className="font-mono text-xs text-ink-soft">{step.number}</span>
                  </div>
                  <h3 className="mt-8 font-display text-xl font-bold text-ink">{step.title}</h3>
                  <p className="mt-3 min-h-[84px] text-sm leading-relaxed text-ink-soft">{step.body}</p>
                  <Link to={step.to} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-ink">
                    {step.cta} <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="templates" className="border-y border-line bg-paper px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase text-ink-soft">Nine coordinated designs</p>
              <h2 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">
                A template for the role, not the trend
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-ink-soft sm:text-base">
                Every template keeps the document readable, exports as selectable text, and includes
                a matching cover-letter style.
              </p>
            </div>
            <Link to="/app/builder" className="inline-flex items-center gap-2 text-sm font-bold text-ink">
              Explore in the builder <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-2 border-l border-t border-line sm:grid-cols-3 lg:grid-cols-5">
            {TEMPLATES.map((template) => (
              <div key={template.id} className="border-b border-r border-line bg-white p-4">
                <div className="h-24 border border-line bg-canvas p-3">
                  <div className="h-2 w-1/2" style={{ background: template.accent }} />
                  <div className="mt-3 h-px w-full bg-line" />
                  <div className="mt-2 h-px w-4/5 bg-line" />
                  <div className="mt-2 h-px w-2/3 bg-line" />
                </div>
                <p className="mt-3 text-xs font-bold text-ink">{template.name}</p>
                <p className="mt-1 text-[10px] uppercase text-ink-soft">{template.category}</p>
              </div>
            ))}
            <div className="flex min-h-[154px] flex-col justify-between border-b border-r border-line bg-ink p-4 text-white">
              <FileCheck2 size={22} strokeWidth={1.6} aria-hidden="true" />
              <p className="text-xs font-semibold leading-relaxed">Matching resume and cover letter included.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ink px-6 py-16 text-white">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-8 sm:flex-row sm:items-center">
          <div>
            <p className="font-display text-3xl font-bold">Make the next application easier.</p>
            <p className="mt-2 text-sm text-white/65">Your first draft is already waiting in the workspace.</p>
          </div>
          <Link to="/app/builder" className="flex min-h-[48px] w-fit items-center gap-2 bg-white px-6 text-sm font-bold text-ink">
            Build my resume <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
