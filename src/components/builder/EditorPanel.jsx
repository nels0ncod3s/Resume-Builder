import TemplatePicker from "../shared/TemplatePicker.jsx";
import { generateId } from "../../lib/id.js";

const inputCls =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-soft/50 focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink";
const labelCls = "mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft";
const smallActionCls =
  "flex min-h-[36px] items-center py-2 text-xs font-semibold text-ink-soft hover:text-ink";

export default function EditorPanel({ resume, setResume }) {
  const update = (key, value) => setResume((r) => ({ ...r, [key]: value }));
  const updateSkillGroup = (id, field, value) =>
    setResume((r) => ({
      ...r,
      skills: r.skills.map((g) => (g.id === id ? { ...g, [field]: value } : g)),
    }));

  const addSkillGroup = () =>
    setResume((r) => ({
      ...r,
      skills: [...r.skills, { id: generateId(), label: "Skills", value: "" }],
    }));

  const removeSkillGroup = (id) =>
    setResume((r) => ({ ...r, skills: r.skills.filter((g) => g.id !== id) }));

  const updateItem = (listKey, id, field, value) =>
    setResume((r) => ({
      ...r,
      [listKey]: r[listKey].map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));

  const addItem = (listKey, factory) =>
    setResume((r) => ({ ...r, [listKey]: [...r[listKey], factory()] }));

  const removeItem = (listKey, id) =>
    setResume((r) => ({ ...r, [listKey]: r[listKey].filter((item) => item.id !== id) }));

  // Shared by Experience and Projects — both store an optional `bullets`
  // array on each entry, keyed by list (listKey) + entry id (itemId).
  const updateBullet = (listKey, itemId, index, value) =>
    setResume((r) => ({
      ...r,
      [listKey]: r[listKey].map((entry) =>
        entry.id === itemId
          ? { ...entry, bullets: entry.bullets.map((b, i) => (i === index ? value : b)) }
          : entry
      ),
    }));

  const addBullet = (listKey, itemId) =>
    setResume((r) => ({
      ...r,
      [listKey]: r[listKey].map((entry) =>
        entry.id === itemId ? { ...entry, bullets: [...(entry.bullets ?? []), ""] } : entry
      ),
    }));

  const removeBullet = (listKey, itemId, index) =>
    setResume((r) => ({
      ...r,
      [listKey]: r[listKey].map((entry) =>
        entry.id === itemId
          ? { ...entry, bullets: entry.bullets.filter((_, i) => i !== index) }
          : entry
      ),
    }));

  return (
    <div data-tour="editor-panel" className="flex flex-col gap-8 p-6">
      <Field label="Design">
        <TemplatePicker value={resume.template} onChange={(id) => update("template", id)} />
      </Field>

      <Field label="Header">
        <div className="grid grid-cols-2 gap-3">
          <Labeled label="Full name">
            <input className={inputCls} value={resume.name} onChange={(e) => update("name", e.target.value)} />
          </Labeled>
          <Labeled label="Job title">
            <input className={inputCls} value={resume.tagline} onChange={(e) => update("tagline", e.target.value)} />
          </Labeled>
          <Labeled label="Location">
            <input className={inputCls} value={resume.location} onChange={(e) => update("location", e.target.value)} />
          </Labeled>
          <Labeled label="Email">
            <input className={inputCls} value={resume.email} onChange={(e) => update("email", e.target.value)} />
          </Labeled>
          <Labeled label="Phone">
            <input className={inputCls} value={resume.phone} onChange={(e) => update("phone", e.target.value)} />
          </Labeled>
          <Labeled label="Link (GitHub/portfolio)">
            <input className={inputCls} value={resume.link} onChange={(e) => update("link", e.target.value)} />
          </Labeled>
        </div>
      </Field>

      <Field label="Profile" onRemoveSection={resume.profile ? () => update("profile", "") : undefined}>
        <textarea
          rows={4}
          className={inputCls}
          value={resume.profile}
          onChange={(e) => update("profile", e.target.value)}
        />
      </Field>

      <Field
        label="Education"
        onAdd={() => addItem("education", () => ({ id: generateId(), degree: "Degree Name", institution: "Institution Name, City", dates: "" }))}
        onRemoveSection={resume.education.length > 0 ? () => update("education", []) : undefined}
      >
        {resume.education.map((item) => (
          <div key={item.id} className="mb-3 rounded-lg border border-line p-3">
            <div className="grid grid-cols-2 gap-2">
              <input className={inputCls} placeholder="Degree" value={item.degree} onChange={(e) => updateItem("education", item.id, "degree", e.target.value)} />
              <input className={inputCls} placeholder="Dates" value={item.dates} onChange={(e) => updateItem("education", item.id, "dates", e.target.value)} />
            </div>
            <input className={`${inputCls} mt-2`} placeholder="Institution" value={item.institution} onChange={(e) => updateItem("education", item.id, "institution", e.target.value)} />
            <RemoveButton onClick={() => removeItem("education", item.id)} />
          </div>
        ))}
      </Field>

      <Field
        label="Experience"
        onAdd={() => addItem("experience", () => ({ id: generateId(), title: "Job Title", company: "Company Name", dates: "", bullets: [""] }))}
        onRemoveSection={resume.experience.length > 0 ? () => update("experience", []) : undefined}
      >
        {resume.experience.map((item) => (
          <div key={item.id} className="mb-3 rounded-lg border border-line p-3">
            <div className="grid grid-cols-2 gap-2">
              <input className={inputCls} placeholder="Job title" value={item.title} onChange={(e) => updateItem("experience", item.id, "title", e.target.value)} />
              <input className={inputCls} placeholder="Dates" value={item.dates} onChange={(e) => updateItem("experience", item.id, "dates", e.target.value)} />
            </div>
            <input className={`${inputCls} mt-2`} placeholder="Company" value={item.company} onChange={(e) => updateItem("experience", item.id, "company", e.target.value)} />
            <div className="mt-2 flex flex-col gap-1.5">
              {item.bullets.map((bullet, i) => (
                <div key={i} className="flex gap-1.5">
                  <input
                    className={inputCls}
                    placeholder="Bullet point"
                    value={bullet}
                    onChange={(e) => updateBullet("experience", item.id, i, e.target.value)}
                  />
                  <button type="button" onClick={() => removeBullet("experience", item.id, i)} className="shrink-0 rounded-lg border border-line px-2 text-xs text-ink-soft hover:text-ink">
                    ✕
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => addBullet("experience", item.id)} className={`w-fit ${smallActionCls}`}>
                + Add bullet
              </button>
            </div>
            <RemoveButton onClick={() => removeItem("experience", item.id)} />
          </div>
        ))}
      </Field>

      <Field
        label="Projects"
        onAdd={() => addItem("projects", () => ({ id: generateId(), name: "Project Name", description: "", bullets: [] }))}
        onRemoveSection={resume.projects.length > 0 ? () => update("projects", []) : undefined}
      >
        {resume.projects.map((item) => (
          <div key={item.id} className="mb-3 rounded-lg border border-line p-3">
            <input className={inputCls} placeholder="Project name" value={item.name} onChange={(e) => updateItem("projects", item.id, "name", e.target.value)} />
            <textarea rows={2} className={`${inputCls} mt-2`} placeholder="Description" value={item.description} onChange={(e) => updateItem("projects", item.id, "description", e.target.value)} />
            <div className="mt-2 flex flex-col gap-1.5">
              {(item.bullets ?? []).map((bullet, i) => (
                <div key={i} className="flex gap-1.5">
                  <input
                    className={inputCls}
                    placeholder="Bullet point"
                    value={bullet}
                    onChange={(e) => updateBullet("projects", item.id, i, e.target.value)}
                  />
                  <button type="button" onClick={() => removeBullet("projects", item.id, i)} className="shrink-0 rounded-lg border border-line px-2 text-xs text-ink-soft hover:text-ink">
                    ✕
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => addBullet("projects", item.id)} className={`w-fit ${smallActionCls}`}>
                + Add bullet
              </button>
            </div>
            <RemoveButton onClick={() => removeItem("projects", item.id)} />
          </div>
        ))}
      </Field>

      <Field
        label="Achievements"
        onAdd={() =>
          addItem("achievements", () => ({
            id: generateId(),
            title: "Achievement or Award Name",
            dates: "",
            description: "",
          }))
        }
        onRemoveSection={resume.achievements?.length > 0 ? () => update("achievements", []) : undefined}
      >
        <p className="mb-3 -mt-1 text-xs text-ink-soft">
          Awards, certifications, publications, competition wins — anything worth calling out on
          its own.
        </p>
        {(resume.achievements ?? []).map((item) => (
          <div key={item.id} className="mb-3 rounded-lg border border-line p-3">
            <div className="grid grid-cols-2 gap-2">
              <input className={inputCls} placeholder="Achievement" value={item.title} onChange={(e) => updateItem("achievements", item.id, "title", e.target.value)} />
              <input className={inputCls} placeholder="Date (optional)" value={item.dates} onChange={(e) => updateItem("achievements", item.id, "dates", e.target.value)} />
            </div>
            <textarea
              rows={2}
              className={`${inputCls} mt-2`}
              placeholder="Description (optional)"
              value={item.description}
              onChange={(e) => updateItem("achievements", item.id, "description", e.target.value)}
            />
            <RemoveButton onClick={() => removeItem("achievements", item.id)} />
          </div>
        ))}
      </Field>

      <Field
        label="Skills"
        onAdd={addSkillGroup}
        onRemoveSection={
          resume.skills.some((g) => g.value)
            ? () => update("skills", [{ id: generateId(), label: "Skills", value: "" }])
            : undefined
        }
      >
        <p className="mb-3 -mt-1 text-xs text-ink-soft">
          Leave this as one plain "Skills" list, or use "+ Add" to split it into your own
          categories (Languages, Certifications, whatever fits your field).
        </p>
        {resume.skills.map((group) => (
          <div key={group.id} className="mb-3 rounded-lg border border-line p-3">
            <input
              className={`${inputCls} font-semibold`}
              placeholder="Category label (e.g. Skills, Languages)"
              value={group.label}
              onChange={(e) => updateSkillGroup(group.id, "label", e.target.value)}
            />
            <input
              className={`${inputCls} mt-2`}
              placeholder="Skill, Skill, Skill"
              value={group.value}
              onChange={(e) => updateSkillGroup(group.id, "value", e.target.value)}
            />
            <RemoveButton onClick={() => removeSkillGroup(group.id)} />
          </div>
        ))}
      </Field>
    </div>
  );
}

function Field({ label, onAdd, onRemoveSection, children }) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-display text-lg font-bold text-ink">{label}</h3>
        <div className="flex items-center gap-3">
          {onRemoveSection && (
            <button
              type="button"
              onClick={onRemoveSection}
              className="flex min-h-[36px] items-center py-2 text-xs font-semibold text-red-500/80 hover:text-red-600"
            >
              Remove section
            </button>
          )}
          {onAdd && (
            <button type="button" onClick={onAdd} className={`px-1 ${smallActionCls}`}>
              + Add
            </button>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

function Labeled({ label, children }) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      {children}
    </label>
  );
}

function RemoveButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-1 flex min-h-[36px] items-center py-2 text-xs font-semibold text-red-500/80 hover:text-red-600"
    >
      Remove entry
    </button>
  );
}
