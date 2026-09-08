export function resumeToText(resume) {
  const lines = [];

  lines.push(resume.name, resume.tagline, resume.location);
  const linkText = (resume.links || []).map((link) => link.url).filter(Boolean).join(" ");
  lines.push(`${resume.email} ${resume.phone} ${linkText}`);

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
      if (item.description) lines.push(item.description);
      for (const bullet of item.bullets ?? []) lines.push(`• ${bullet}`);
    }
  }

  if (resume.achievements?.length > 0) {
    lines.push("", "ACHIEVEMENTS");
    for (const item of resume.achievements) {
      lines.push(item.dates ? `${item.title} (${item.dates})` : item.title);
      if (item.description) lines.push(item.description);
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
