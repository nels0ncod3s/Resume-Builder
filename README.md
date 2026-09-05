# Resume Pilot

Resume Pilot is a browser-based toolkit for building a resume, creating a matching cover letter, and reviewing a resume for structure, readability, achievement language, and job-description keyword overlap.

## Product areas

- Resume builder with live A4 preview, section reordering, PDF import, autosave, and PDF/PNG export
- Matching cover-letter builder and export flow
- Rules-based ATS readiness review with optional job-description comparison
- Four distinct, coordinated resume and cover-letter templates
- Local browser storage with no account required

## Development

```bash
npm install
npm run dev
```

Run the production checks with:

```bash
npm run lint
npm run build
```

The ATS score is an on-device heuristic, not a prediction from any specific employer or applicant tracking system.
