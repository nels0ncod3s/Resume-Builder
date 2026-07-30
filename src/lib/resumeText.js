export function resumeToText(resume) {
  const lines = [];

  lines.push(resume.name, resume.tagline, resume.location);
  lines.push(`${resume.email} ${resume.phone} ${resume.link}`);

  if (resume.profile.trim()) {
    lines.push("", "PROFILE", resume.profile);
  }

  if (resume.education.length > 0) {
    lines.push("", "EDUCATION");
    for (const item of resume.education) {
      lines.push(`${item.degree} — ${item.institution} (${item.dates})`);
    }
  }

  if (resume.experience.length > 0) {
    lines.push("", "EXPERIENCE");
    for (const item of resume.experience) {
      lines.push(`${item.title} — ${item.company} (${item.dates})`);
      for (const bullet of item.bullets) lines.push(`• ${bullet}`);
    }
  }

  if (resume.projects.length > 0) {
    lines.push("", "PROJECTS");
    for (const item of resume.projects) {
      lines.push(item.name);
      lines.push(item.description);
    }
  }

  const { languages, frameworks, tools, soft } = resume.skills;
  if (languages || frameworks || tools || soft) {
    lines.push("", "SKILLS");
    if (languages) lines.push(`Languages: ${languages}`);
    if (frameworks) lines.push(`Frameworks: ${frameworks}`);
    if (tools) lines.push(`Tools: ${tools}`);
    if (soft) lines.push(`Soft Skills: ${soft}`);
  }

  return lines.join("\n");
}
