import { DEFAULT_TEMPLATE_ID } from "./templates.js";

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
      id: crypto.randomUUID(),
      degree: "Degree Name",
      institution: "Institution Name, City",
      dates: "Month Year – Month Year",
    },
  ],
  experience: [
    {
      id: crypto.randomUUID(),
      title: "Job Title",
      company: "Company Name",
      dates: "Month Year – Month Year",
      bullets: ["Describe a key responsibility or achievement in this role."],
    },
  ],
  projects: [
    {
      id: crypto.randomUUID(),
      name: "Project Name",
      description:
        "A short description of what you built, the problem it solves, and the technologies used.",
    },
  ],
  skills: [{ id: crypto.randomUUID(), label: "Skills", value: "Skill, Skill, Skill" }],
});
