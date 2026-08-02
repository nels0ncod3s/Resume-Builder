import { DEFAULT_TEMPLATE_ID } from "./templates.js";
import { generateId } from "../lib/id.js";

export const createDefaultResume = () => ({
  template: DEFAULT_TEMPLATE_ID,
  name: "Your Name",
  tagline: "Your Job Title",
  location: "City, Country",
  email: "youremail@example.com",
  phone: "+000 000 0000",
  link: "github.com/yourusername",
  profile:
    "A brief, punchy professional summary goes here. Cover who you are, the kind of work you do, and what you're looking for next in two to three sentences tailored to the role.",
  education: [
    {
      id: generateId(),
      degree: "Degree Name",
      institution: "Institution Name, City",
      dates: "Month Year – Month Year",
    },
  ],
  experience: [
    {
      id: generateId(),
      title: "Job Title",
      company: "Company Name",
      dates: "Month Year – Month Year",
      bullets: ["Describe a key responsibility or achievement in this role."],
    },
  ],
  projects: [
    {
      id: generateId(),
      name: "Project Name",
      description:
        "A short description of what you built, the problem it solves, and the technologies used.",
      bullets: [],
    },
  ],
  achievements: [
    {
      id: generateId(),
      title: "Achievement or Award Name",
      dates: "Year",
      description: "A brief line on the achievement and why it mattered.",
    },
  ],
  skills: [{ id: generateId(), label: "Skills", value: "Skill, Skill, Skill" }],
});

function str(value, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function withId(item) {
  return { ...item, id: typeof item?.id === "string" && item.id ? item.id : generateId() };
}

function normalizeEducation(list) {
  if (!Array.isArray(list)) return null;
  return list.map((item) =>
    withId({
      id: item?.id,
      degree: str(item?.degree, "Degree Name"),
      institution: str(item?.institution),
      dates: str(item?.dates),
    })
  );
}

function normalizeExperience(list) {
  if (!Array.isArray(list)) return null;
  return list.map((item) =>
    withId({
      id: item?.id,
      title: str(item?.title, "Job Title"),
      company: str(item?.company),
      dates: str(item?.dates),
      bullets: Array.isArray(item?.bullets) ? item.bullets.filter((b) => typeof b === "string") : [""],
    })
  );
}

function normalizeProjects(list) {
  if (!Array.isArray(list)) return null;
  return list.map((item) =>
    withId({
      id: item?.id,
      name: str(item?.name, "Project Name"),
      description: str(item?.description),
      bullets: Array.isArray(item?.bullets) ? item.bullets.filter((b) => typeof b === "string") : [],
    })
  );
}

function normalizeAchievements(list) {
  if (!Array.isArray(list)) return null;
  return list.map((item) =>
    withId({
      id: item?.id,
      title: str(item?.title, "Achievement"),
      dates: str(item?.dates),
      description: str(item?.description),
    })
  );
}

function normalizeSkills(skills) {
  if (Array.isArray(skills)) {
    return skills.map((g) => withId({ id: g?.id, label: str(g?.label, "Skills"), value: str(g?.value) }));
  }
  // Legacy shape from an earlier version of the app, where `skills` was a
  // single plain string instead of a list of labeled groups — migrate it
  // forward into one group rather than discarding the person's data.
  if (typeof skills === "string" && skills.trim()) {
    return [{ id: generateId(), label: "Skills", value: skills }];
  }
  return null;
}

/**
 * Takes whatever's actually sitting in localStorage — which may predate the
 * current schema, have been hand-edited, or partially corrupted — and
 * returns a resume object every component can safely rely on. Every field
 * is individually type-checked rather than trusting the saved shape
 * wholesale: previously, one field with an unexpected type (e.g. `skills`
 * saved as a plain string by an older build, instead of today's array of
 * `{id, label, value}` groups) was enough to crash the *entire* Builder page
 * with something like "e.skills.some is not a function", since downstream
 * code assumes these fields are always arrays of a specific shape. This
 * sanitizes on load instead, migrating known legacy shapes where possible
 * (see `normalizeSkills`) and only falling back to the default for a field
 * that's unrecognizable, rather than losing everything else in the resume
 * over one bad field.
 */
export function sanitizeResume(raw) {
  const defaults = createDefaultResume();
  if (!raw || typeof raw !== "object") return defaults;

  return {
    template: str(raw.template, defaults.template),
    name: str(raw.name, defaults.name),
    tagline: str(raw.tagline, defaults.tagline),
    location: str(raw.location, defaults.location),
    email: str(raw.email, defaults.email),
    phone: str(raw.phone, defaults.phone),
    link: str(raw.link, defaults.link),
    profile: str(raw.profile, defaults.profile),
    education: normalizeEducation(raw.education) ?? defaults.education,
    experience: normalizeExperience(raw.experience) ?? defaults.experience,
    projects: normalizeProjects(raw.projects) ?? defaults.projects,
    achievements: normalizeAchievements(raw.achievements) ?? defaults.achievements,
    skills: normalizeSkills(raw.skills) ?? defaults.skills,
  };
}
