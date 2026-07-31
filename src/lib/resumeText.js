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

  const skillGroups = (resume.skills || []).filter((g) => g.value);
  if (skillGroups.length > 0) {
    lines.push("", "SKILLS");
    if (skillGroups.length === 1) {
      lines.push(skillGroups[0].value);
    } else {
      for (const group of skillGroups) lines.push(`${group.label}: ${group.value}`);
    }
  }

  return lines.join("\n");
}
