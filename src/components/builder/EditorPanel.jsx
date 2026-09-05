import TemplatePicker from "../shared/TemplatePicker.jsx";
import { generateId } from "../../lib/id.js";
import { DEFAULT_SECTION_ORDER } from "../../data/defaultResume.js";
import { useDragReorder, DragGhost } from "../../lib/useDragReorder.jsx";

// Profile is pinned first (it's the intro summary) and isn't draggable;
// everything else here can be reordered by dragging, and renders — both in
// this panel and in the CV preview — in the order the person chose.
const REORDERABLE_KEYS = DEFAULT_SECTION_ORDER.filter((key) => key !== "profile");
const SECTION_LABELS = {
  education: "Education",
  experience: "Experience",
  projects: "Projects",
  achievements: "Achievements",
  skills: "Skills",
};

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

  const updateLink = (id, field, value) =>
    setResume((r) => ({
      ...r,
      links: r.links.map((link) => (link.id === id ? { ...link, [field]: value } : link)),
    }));

  const addLink = () =>
    setResume((r) => ({
      ...r,
      links: [...r.links, { id: generateId(), label: "Portfolio", url: "" }],
    }));

  const removeLink = (id) =>
    setResume((r) => ({ ...r, links: r.links.filter((link) => link.id !== id) }));

  const updateItem = (listKey, id, field, value) =>
    setResume((r) => ({
      ...r,
      [listKey]: r[listKey].map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));

  const addItem = (listKey, factory) =>
    setResume((r) => ({ ...r, [listKey]: [...r[listKey], factory()] }));

  const removeItem = (listKey, id) =>
    setResume((r) => ({ ...r, [listKey]: r[listKey].filter((item) => item.id !== id) }));

  // Reorders a list of entries (education, experience, projects,
  // achievements, or skill groups) to match a new array of ids.
  const reorderList = (listKey) => (ids) =>
    setResume((r) => ({
      ...r,
      [listKey]: ids.map((id) => r[listKey].find((item) => item.id === id)).filter(Boolean),
    }));

  const order = (resume.sectionOrder?.length ? resume.sectionOrder : DEFAULT_SECTION_ORDER).filter((key) =>
    REORDERABLE_KEYS.includes(key)
  );

  // One drag hook for the section order, one per reorderable entry list —
  // each is an independent drag scope (dragging an experience entry never
  // touches the education list, etc).
  const sectionDrag = useDragReorder(order, (next) =>
    setResume((r) => ({ ...r, sectionOrder: ["profile", ...next] }))
  );
  const educationDrag = useDragReorder(resume.education.map((i) => i.id), reorderList("education"));
  const experienceDrag = useDragReorder(resume.experience.map((i) => i.id), reorderList("experience"));
  const projectsDrag = useDragReorder(resume.projects.map((i) => i.id), reorderList("projects"));
  const achievementsDrag = useDragReorder(
    (resume.achievements ?? []).map((i) => i.id),
    reorderList("achievements")
  );
  const skillsDrag = useDragReorder(resume.skills.map((i) => i.id), reorderList("skills"));

  const sectionDragProps = (key) => ({
    registerNode: sectionDrag.registerNode(key),
    handleProps: sectionDrag.getHandleProps(key),
    isDragging: sectionDrag.draggedKey === key,
  });

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

  const sectionFields = {
    education: (
      <Field
        key="education"
        label="Education"
        dragProps={sectionDragProps("education")}
        onAdd={() => addItem("education", () => ({ id: generateId(), degree: "Degree Name", institution: "Institution Name, City", dates: "" }))}
        onRemoveSection={resume.education.length > 0 ? () => update("education", []) : undefined}
      >
        {resume.education.map((item) => (
          <DraggableEntry key={item.id} drag={educationDrag} itemId={item.id}>
            <div className="grid grid-cols-2 gap-2">
              <input className={inputCls} placeholder="Degree" value={item.degree} onChange={(e) => updateItem("education", item.id, "degree", e.target.value)} />
              <input className={inputCls} placeholder="Dates" value={item.dates} onChange={(e) => updateItem("education", item.id, "dates", e.target.value)} />
            </div>
            <input className={`${inputCls} mt-2`} placeholder="Institution" value={item.institution} onChange={(e) => updateItem("education", item.id, "institution", e.target.value)} />
            <RemoveButton onClick={() => removeItem("education", item.id)} />
          </DraggableEntry>
        ))}
      </Field>
    ),

    experience: (
      <Field
        key="experience"
        label="Experience"
        dragProps={sectionDragProps("experience")}
        onAdd={() => addItem("experience", () => ({ id: generateId(), title: "Job Title", company: "Company Name", dates: "", bullets: [""] }))}
        onRemoveSection={resume.experience.length > 0 ? () => update("experience", []) : undefined}
      >
        {resume.experience.map((item) => (
          <DraggableEntry key={item.id} drag={experienceDrag} itemId={item.id}>
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
          </DraggableEntry>
        ))}
      </Field>
    ),

    projects: (
      <Field
        key="projects"
        label="Projects"
        dragProps={sectionDragProps("projects")}
        onAdd={() => addItem("projects", () => ({ id: generateId(), name: "Project Name", description: "", bullets: [] }))}
        onRemoveSection={resume.projects.length > 0 ? () => update("projects", []) : undefined}
      >
        {resume.projects.map((item) => (
          <DraggableEntry key={item.id} drag={projectsDrag} itemId={item.id}>
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
          </DraggableEntry>
        ))}
      </Field>
    ),

    achievements: (
      <Field
        key="achievements"
        label="Achievements"
        dragProps={sectionDragProps("achievements")}
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
          <DraggableEntry key={item.id} drag={achievementsDrag} itemId={item.id}>
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
          </DraggableEntry>
        ))}
      </Field>
    ),

    skills: (
      <Field
        key="skills"
        label="Skills"
        dragProps={sectionDragProps("skills")}
        onAdd={addSkillGroup}
        onRemoveSection={
          resume.skills.some((g) => g.value)
            ? () => update("skills", [{ id: generateId(), label: "Skills", value: "" }])
            : undefined
        }
      >
        <p className="mb-3 -mt-1 text-xs text-ink-soft">
          Leave this as one plain "Skills" list, or use "+ Add" to split it into your own
          categories (Languages, Certifications, whatever fits your field). Drag to reorder which
          category shows first.
        </p>
        {resume.skills.map((group) => (
          <DraggableEntry key={group.id} drag={skillsDrag} itemId={group.id}>
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
          </DraggableEntry>
        ))}
      </Field>
    ),
  };

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
        </div>
      </Field>

      <Field label="Links" onAdd={addLink}>
        <p className="mb-3 -mt-1 text-xs text-ink-soft">
          Add your portfolio, LinkedIn, GitHub, or any other professional profile.
        </p>
        {resume.links.map((link) => (
          <div key={link.id} className="mb-3 rounded-lg border border-line p-3">
            <div className="grid grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] gap-2">
              <input
                className={inputCls}
                aria-label="Link label"
                placeholder="Label, e.g. LinkedIn"
                value={link.label}
                onChange={(e) => updateLink(link.id, "label", e.target.value)}
              />
              <input
                className={inputCls}
                aria-label="Link URL"
                inputMode="url"
                placeholder="linkedin.com/in/yourname"
                value={link.url}
                onChange={(e) => updateLink(link.id, "url", e.target.value)}
              />
            </div>
            <RemoveButton onClick={() => removeLink(link.id)} label="Remove link" />
          </div>
        ))}
        {resume.links.length === 0 && (
          <p className="rounded-lg border border-dashed border-line px-3 py-4 text-sm text-ink-soft">
            No links added yet.
          </p>
        )}
      </Field>

      <Field label="Profile" onRemoveSection={resume.profile ? () => update("profile", "") : undefined}>
        <textarea
          rows={4}
          className={inputCls}
          value={resume.profile}
          onChange={(e) => update("profile", e.target.value)}
        />
      </Field>

      {order.map((key) => sectionFields[key])}

      {sectionDrag.draggedKey && (
        <DragGhost pointer={sectionDrag.pointer} label={SECTION_LABELS[sectionDrag.draggedKey]} />
      )}
      {educationDrag.draggedKey && (
        <DragGhost
          pointer={educationDrag.pointer}
          label={resume.education.find((i) => i.id === educationDrag.draggedKey)?.degree || "Education entry"}
        />
      )}
      {experienceDrag.draggedKey && (
        <DragGhost
          pointer={experienceDrag.pointer}
          label={resume.experience.find((i) => i.id === experienceDrag.draggedKey)?.title || "Experience entry"}
        />
      )}
      {projectsDrag.draggedKey && (
        <DragGhost
          pointer={projectsDrag.pointer}
          label={resume.projects.find((i) => i.id === projectsDrag.draggedKey)?.name || "Project"}
        />
      )}
      {achievementsDrag.draggedKey && (
        <DragGhost
          pointer={achievementsDrag.pointer}
          label={(resume.achievements ?? []).find((i) => i.id === achievementsDrag.draggedKey)?.title || "Achievement"}
        />
      )}
      {skillsDrag.draggedKey && (
        <DragGhost
          pointer={skillsDrag.pointer}
          label={resume.skills.find((i) => i.id === skillsDrag.draggedKey)?.label || "Skills group"}
        />
      )}
    </div>
  );
}

function Field({ label, onAdd, onRemoveSection, dragProps, children }) {
  return (
    <section
      ref={dragProps?.registerNode}
      className={`rounded-lg transition-opacity ${dragProps?.isDragging ? "opacity-40" : ""}`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {dragProps && (
            <span
              {...dragProps.handleProps}
              title="Drag to reorder"
              aria-hidden="true"
              className="cursor-grab select-none px-0.5 text-base leading-none text-ink-soft/40 hover:text-ink-soft active:cursor-grabbing"
            >
              ⠿
            </span>
          )}
          <h3 className="font-display text-lg font-bold text-ink">{label}</h3>
        </div>
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

// Wraps a single entry (an education/experience/project/achievement item,
// or a skills group) with a grip handle so it can be dragged to reorder
// within its own list, independent of every other list's order.
function DraggableEntry({ drag, itemId, children }) {
  return (
    <div
      ref={drag.registerNode(itemId)}
      className={`mb-3 flex gap-2 rounded-lg border border-line p-3 transition-opacity ${
        drag.draggedKey === itemId ? "opacity-40" : ""
      }`}
    >
      <span
        {...drag.getHandleProps(itemId)}
        title="Drag to reorder"
        aria-hidden="true"
        className="mt-0.5 shrink-0 cursor-grab select-none text-ink-soft/40 hover:text-ink-soft active:cursor-grabbing"
      >
        ⠿
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
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

function RemoveButton({ onClick, label = "Remove entry" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-1 flex min-h-[36px] items-center py-2 text-xs font-semibold text-red-500/80 hover:text-red-600"
    >
      {label}
    </button>
  );
}
