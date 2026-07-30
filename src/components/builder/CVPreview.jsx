import { forwardRef } from "react";

const CVPreview = forwardRef(function CVPreview({ resume }, ref) {
  const { skills } = resume;

  return (
    <div
      ref={ref}
      className="relative h-[1123px] w-[794px] shrink-0 overflow-hidden bg-white px-14 py-13 shadow-[0_20px_60px_rgba(0,0,0,0.18)]"
      style={{ fontFamily: '"DM Sans", sans-serif' }}
    >
      <div className="absolute inset-x-0 top-0 h-[5px] bg-[#1a1a1a]" />

      <header className="mb-5 pb-5 text-center">
        <h1
          className="text-[36px] font-bold tracking-tight text-[#111]"
          style={{ fontFamily: '"Playfair Display", serif' }}
        >
          {resume.name}
        </h1>
        <p className="mt-1.5 text-[15px] font-medium uppercase tracking-[1.5px] text-[#555]">
          {resume.tagline} &nbsp;|&nbsp; {resume.location}
        </p>
        <p className="mt-1.5 text-sm text-[#777]">
          {resume.email} &nbsp;|&nbsp; {resume.phone} &nbsp;|&nbsp; {resume.link}
        </p>
      </header>

      {resume.profile.trim() && (
        <Section title="Profile">
          <p className="text-[15px] leading-[1.65] text-[#333]">{resume.profile}</p>
        </Section>
      )}

      {resume.education.length > 0 && (
        <Section title="Education">
          {resume.education.map((item) => (
            <Entry key={item.id} title={item.degree} dates={item.dates}>
              <p className="mb-1 text-[12.5px] font-medium text-[#555]">{item.institution}</p>
            </Entry>
          ))}
        </Section>
      )}

      {resume.experience.length > 0 && (
        <Section title="Experience">
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
        <Section title="Projects">
          {resume.projects.map((item) => (
            <div key={item.id} className="mb-3.5">
              <h3 className="text-base font-light text-[#111]">{item.name}</h3>
              <p className="text-[15px] leading-[1.65] text-[#333]">{item.description}</p>
            </div>
          ))}
        </Section>
      )}

      {Object.values(skills).some(Boolean) && (
        <Section title="Skills">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[15px] leading-[1.6] text-[#333]">
            {skills.languages && (
              <div>
                <strong className="text-[#111]">Languages:</strong> {skills.languages}
              </div>
            )}
            {skills.frameworks && (
              <div>
                <strong className="text-[#111]">Frameworks:</strong> {skills.frameworks}
              </div>
            )}
            {skills.tools && (
              <div>
                <strong className="text-[#111]">Tools:</strong> {skills.tools}
              </div>
            )}
            {skills.soft && (
              <div>
                <strong className="text-[#111]">Soft Skills:</strong> {skills.soft}
              </div>
            )}
          </div>
        </Section>
      )}
    </div>
  );
});

function Section({ title, children }) {
  return (
    <section className="mb-5">
      <h2
        className="mb-3 border-b border-[#111] pb-1 text-xl font-semibold uppercase tracking-[2px] text-[#111]"
        style={{ fontFamily: '"Playfair Display", serif' }}
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
