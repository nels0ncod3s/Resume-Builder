import TemplatePicker from "../shared/TemplatePicker.jsx";

const inputCls =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-soft/50 focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink";
const labelCls = "mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft";

export default function CoverLetterEditorPanel({ coverLetter, setCoverLetter }) {
  const update = (key, value) => setCoverLetter((c) => ({ ...c, [key]: value }));

  return (
    <div data-tour="cl-editor-panel" className="flex flex-col gap-8 p-6">
      <Field label="Design">
        <TemplatePicker value={coverLetter.template} onChange={(id) => update("template", id)} />
      </Field>

      <Field label="Your details">
        <div className="grid grid-cols-2 gap-3">
          <Labeled label="Full name">
            <input className={inputCls} value={coverLetter.senderName} onChange={(e) => update("senderName", e.target.value)} />
          </Labeled>
          <Labeled label="Job title">
            <input className={inputCls} value={coverLetter.senderTagline} onChange={(e) => update("senderTagline", e.target.value)} />
          </Labeled>
          <Labeled label="Email">
            <input className={inputCls} value={coverLetter.senderEmail} onChange={(e) => update("senderEmail", e.target.value)} />
          </Labeled>
          <Labeled label="Phone">
            <input className={inputCls} value={coverLetter.senderPhone} onChange={(e) => update("senderPhone", e.target.value)} />
          </Labeled>
          <Labeled label="Location">
            <input className={inputCls} value={coverLetter.senderLocation} onChange={(e) => update("senderLocation", e.target.value)} />
          </Labeled>
          <Labeled label="Date">
            <input className={inputCls} value={coverLetter.date} onChange={(e) => update("date", e.target.value)} />
          </Labeled>
        </div>
      </Field>

      <Field label="Recipient">
        <div className="grid grid-cols-2 gap-3">
          <Labeled label="Recipient name">
            <input className={inputCls} value={coverLetter.recipientName} onChange={(e) => update("recipientName", e.target.value)} />
          </Labeled>
          <Labeled label="Company">
            <input className={inputCls} value={coverLetter.companyName} onChange={(e) => update("companyName", e.target.value)} />
          </Labeled>
        </div>
      </Field>

      <Field label="Salutation">
        <input
          className={inputCls}
          placeholder="Dear Hiring Manager,"
          value={coverLetter.salutation}
          onChange={(e) => update("salutation", e.target.value)}
        />
      </Field>

      <Field label="Letter body">
        <textarea
          rows={14}
          className={inputCls}
          value={coverLetter.body}
          onChange={(e) => update("body", e.target.value)}
        />
        <p className="mt-1.5 text-xs text-ink-soft">Separate paragraphs with a blank line.</p>
      </Field>

      <Field label="Closing">
        <input
          className={inputCls}
          placeholder="Sincerely,"
          value={coverLetter.closing}
          onChange={(e) => update("closing", e.target.value)}
        />
      </Field>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <section>
      <h3 className="mb-3 font-display text-lg font-bold text-ink">{label}</h3>
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
