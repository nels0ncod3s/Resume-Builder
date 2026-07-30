export function resumeToText(resume) {
  const lines = [];

  lines.push(resume.name, resume.tagline, resume.location);
  lines.push(`${resume.email} ${resume.phone} ${resume.link}`);
  lines.push("", "PROFILE", resume.profile);

  lines.push("", "EDUCATION");
  for (const item of resume.education) {
    lines.push(`${item.degree} — ${item.institution} (${item.dates})`);
  }

  lines.push("", "EXPERIENCE");
  for (const item of resume.experience) {
    lines.push(`${item.title} — ${item.company} (${item.dates})`);
    for (const bullet of item.bullets) lines.push(`• ${bullet}`);
  }

  lines.push("", "PROJECTS");
  for (const item of resume.projects) {
    lines.push(item.name);
    lines.push(item.description);
  }

  lines.push("", "SKILLS");
  const { languages, frameworks, tools, soft } = resume.skills;
  lines.push(`Languages: ${languages}`);
  lines.push(`Frameworks: ${frameworks}`);
  lines.push(`Tools: ${tools}`);
  lines.push(`Soft Skills: ${soft}`);

  return lines.join("\n");
}
