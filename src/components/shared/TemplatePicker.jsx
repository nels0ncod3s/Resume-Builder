import { useEffect, useRef, useState } from "react";
import { Check, LayoutGrid, X } from "lucide-react";
import { TEMPLATES, getTemplate } from "../../data/templates.js";

const FEATURED = TEMPLATES.filter((template) => template.featured);

export default function TemplatePicker({ value, onChange }) {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const activeTemplate = getTemplate(value);

  return (
    <>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">{activeTemplate.name}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">{activeTemplate.bestFor}</p>
        </div>
        <span className="shrink-0 border border-line bg-canvas px-2 py-1 text-[10px] font-bold uppercase text-ink-soft">
          {activeTemplate.category}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {FEATURED.map((template) => (
          <TemplateSwatch
            key={template.id}
            template={template}
            active={template.id === value}
            onClick={() => onChange(template.id)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => setGalleryOpen(true)}
        aria-haspopup="dialog"
        className="mt-3 flex min-h-[42px] w-full items-center justify-center gap-2 border border-line bg-canvas px-3 text-xs font-semibold text-ink transition-colors hover:border-ink"
      >
        <LayoutGrid size={15} aria-hidden="true" />
        Browse all {TEMPLATES.length} templates
      </button>

      {galleryOpen && (
        <TemplateGallery
          value={value}
          onChange={(id) => {
            onChange(id);
            setGalleryOpen(false);
          }}
          onClose={() => setGalleryOpen(false)}
        />
      )}
    </>
  );
}

function TemplateSwatch({ template, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`relative flex min-w-0 flex-col gap-2 border bg-white p-2 text-left transition-colors ${
        active ? "border-ink ring-2 ring-ink/10" : "border-line hover:border-ink/50"
      }`}
    >
      {active && (
        <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center bg-ink text-white">
          <Check size={11} strokeWidth={3} aria-hidden="true" />
        </span>
      )}
      <TemplateMiniature template={template} compact />
      <span className="w-full truncate text-[11px] font-semibold text-ink">{template.name}</span>
    </button>
  );
}

function TemplateMiniature({ template, compact = false }) {
  const isBand = template.headerStyle === "band";
  const isLeft = template.headerStyle === "left-rule";

  return (
    <span
      className={`relative block w-full overflow-hidden border border-line bg-white ${compact ? "h-12" : "h-20"}`}
      aria-hidden="true"
    >
      {isLeft && <span className="absolute inset-y-0 left-0 w-1" style={{ background: template.accent }} />}
      {isBand ? (
        <span className="block h-[38%] px-2 pt-2" style={{ background: template.accent }}>
          <span className="block h-1.5 w-1/2 bg-white/90" />
          <span className="mt-1 block h-0.5 w-2/3 bg-white/50" />
        </span>
      ) : (
        <span className={`block px-2 pt-2 ${isLeft ? "text-left" : "text-center"}`}>
          <span
            className={`block h-1.5 ${isLeft ? "w-1/2" : "mx-auto w-1/2"}`}
            style={{ background: template.accent }}
          />
          <span
            className={`mt-1 block h-px ${isLeft ? "w-2/3" : "mx-auto w-2/3"}`}
            style={{ background: template.accent, opacity: 0.45 }}
          />
        </span>
      )}
      <span className="absolute bottom-2 left-2 right-2 space-y-1">
        <span className="block h-px w-full bg-line" />
        <span className="block h-px w-4/5 bg-line" />
        {!compact && <span className="block h-px w-2/3 bg-line" />}
      </span>
    </span>
  );
}

function TemplateGallery({ value, onChange, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="template-gallery-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-5"
      onMouseDown={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden border border-line bg-white shadow-2xl sm:max-h-[84vh]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
          <div>
            <h3 id="template-gallery-title" className="font-display text-xl font-bold text-ink">
              Choose a template
            </h3>
            <p className="mt-1 text-xs text-ink-soft">
              Every design exports as selectable text and has a matching cover letter.
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close template gallery"
            title="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center text-ink-soft transition-colors hover:bg-canvas hover:text-ink"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <div className="grid overflow-y-auto sm:grid-cols-2">
          {TEMPLATES.map((template) => {
            const active = template.id === value;
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => onChange(template.id)}
                aria-pressed={active}
                className={`grid grid-cols-[92px_1fr_auto] items-center gap-4 border-b border-line p-4 text-left transition-colors sm:[&:nth-child(odd)]:border-r ${
                  active ? "bg-canvas" : "hover:bg-canvas/70"
                }`}
              >
                <TemplateMiniature template={template} />
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-ink">{template.name}</span>
                    <span className="border border-line px-1.5 py-0.5 text-[9px] font-bold uppercase text-ink-soft">
                      {template.category}
                    </span>
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-ink-soft">
                    {template.description}
                  </span>
                </span>
                <span className={`flex h-6 w-6 items-center justify-center ${active ? "bg-ink text-white" : "border border-line"}`}>
                  {active && <Check size={14} strokeWidth={3} aria-hidden="true" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
