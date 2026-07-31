import { forwardRef } from "react";
import { getTemplate } from "../../data/templates.js";

const CVPreview = forwardRef(function CVPreview({ resume }, ref) {
  const template = getTemplate(resume.template);
  const skillGroups = resume.skills.filter((g) => g.value?.trim());
  const isBand = template.headerStyle === "band";
  const isLeftRule = template.headerStyle === "left-rule";

  return (
    <div
      ref={ref}
      className="relative h-[1123px] w-[794px] shrink-0 overflow-hidden bg-white shadow-[0_20px_60px_rgba(0,0,0,0.18)]"
      style={{ fontFamily: template.fonts.body }}
    >
      {isLeftRule && (
        <div className="absolute inset-y-0 left-0 w-[6px]" style={{ background: template.accent }} />
      )}

      <ResumeHeader resume={resume} template={template} />

      <div className={`px-14 pb-13 ${isBand ? "pt-3" : "pt-6"}`}>
        {resume.profile.trim() && (
          <Section title="Profile" template={template}>
            <p className="text-[15px] leading-[1.65] text-[#333]">{resume.profile}</p>
          </Section>
        )}

        {resume.education.length > 0 && (
          <Section title="Education" template={template}>
            {resume.education.map((item) => (
              <Entry key={item.id} title={item.degree} dates={item.dates}>
                <p className="mb-1 text-[12.5px] font-medium text-[#555]">{item.institution}</p>
              </Entry>
            ))}
          </Section>
        )}

        {resume.experience.length > 0 && (
          <Section title="Experience" template={template}>
            {resume.experience.map((item) => (
              <Entry key={item.id} title={item.title} dates={item.dates}>
                <p className="mb-1 text-[12.5px] font-medium text-[#555]">{item.company}</p>
                <ul className="mt-1 list-disc pl-[18px]">
                  {item.bullets.map((bullet, i) => (
                    <li key={i} className="text-[15px] leading-[1.7] text-[#333]">
                      {bullet}
                    </li>
                  ))}
                </ul>
              </Entry>
            ))}
          </Section>
        )}

        {resume.projects.length > 0 && (
          <Section title="Projects" template={template}>
            {resume.projects.map((item) => (
              <div key={item.id} className="mb-3.5">
                <h3 className="text-base font-light text-[#111]">{item.name}</h3>
                <p className="text-[15px] leading-[1.65] text-[#333]">{item.description}</p>
              </div>
            ))}
          </Section>
        )}

        {skillGroups.length > 0 && (
          <Section title={skillGroups.length === 1 ? skillGroups[0].label || "Skills" : "Skills"} template={template}>
            {skillGroups.length === 1 ? (
              <p className="text-[15px] leading-[1.6] text-[#333]">{skillGroups[0].value}</p>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[15px] leading-[1.6] text-[#333]">
                {skillGroups.map((group) => (
                  <div key={group.id}>
                    <strong className="text-[#111]">{group.label || "Skills"}:</strong> {group.value}
                  </div>
                ))}
              </div>
            )}
          </Section>
        )}
      </div>
    </div>
  );
});

// Renders the header treatment for the active template. Kept as one
// component with a variant switch (rather than three separate preview
// components) so the section content below never has to know or care
// which template is active — only the header and the accent color used
// for section-title underlines change between templates.
function ResumeHeader({ resume, template }) {
  const subLine = [resume.tagline, resume.location].filter(Boolean).join("  |  ");
  const contactLine = [resume.email, resume.phone, resume.link].filter(Boolean).join("  |  ");

  if (template.headerStyle === "band") {
    return (
      <header className="px-14 pb-8 pt-11 text-center text-white" style={{ background: template.accent }}>
        <h1 className="text-[34px] font-bold tracking-tight" style={{ fontFamily: template.fonts.heading }}>
          {resume.name}
        </h1>
        {subLine && (
          <p className="mt-1.5 text-[14px] font-medium uppercase tracking-[1.5px] opacity-90">{subLine}</p>
        )}
        {contactLine && <p className="mt-1.5 text-[13px] opacity-75">{contactLine}</p>}
      </header>
    );
  }

  if (template.headerStyle === "left-rule") {
    return (
      <header className="border-b-2 px-14 pb-5 pt-11" style={{ borderColor: template.accent }}>
        <h1
          className="text-[32px] font-bold tracking-tight text-[#111]"
          style={{ fontFamily: template.fonts.heading }}
        >
          {resume.name}
        </h1>
        {subLine && (
          <p className="mt-1.5 text-[13px] font-semibold uppercase tracking-[1px]" style={{ color: template.accent }}>
            {subLine}
          </p>
        )}
        {contactLine && <p className="mt-1.5 text-sm text-[#666]">{contactLine}</p>}
      </header>
    );
  }

  // "centered-rule" — the original Classic Serif treatment.
  return (
    <header className="relative px-14 pb-5 pt-11 text-center">
      <div className="absolute inset-x-0 top-0 h-[5px]" style={{ background: template.accent }} />
      <h1
        className="text-[36px] font-bold tracking-tight text-[#111]"
        style={{ fontFamily: template.fonts.heading }}
      >
        {resume.name}
      </h1>
      {subLine && <p className="mt-1.5 text-[15px] font-medium uppercase tracking-[1.5px] text-[#555]">{subLine}</p>}
      {contactLine && <p className="mt-1.5 text-sm text-[#777]">{contactLine}</p>}
    </header>
  );
}

function Section({ title, template, children }) {
  return (
    <section className="mb-5">
      <h2
        className="mb-3 border-b pb-1 text-xl font-semibold uppercase tracking-[2px] text-[#111]"
        style={{ fontFamily: template.fonts.heading, borderColor: template.accent }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function Entry({ title, dates, children }) {
  return (
    <div className="mb-3.5">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-base font-light text-[#111]">{title}</h3>
        {dates && <span className="whitespace-nowrap text-xs italic text-[#888]">{dates}</span>}
      </div>
      {children}
    </div>
  );
}

export default CVPreview;
