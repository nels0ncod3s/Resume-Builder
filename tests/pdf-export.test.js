import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
// Load the actual PDF library before installing browser API stubs.
import 'jspdf';
import { downloadAsPdf as resumePdf } from '../src/lib/resumeExport.js';
import { downloadAsPdf as letterPdf } from '../src/lib/coverLetterExport.js';
import { createDefaultResume } from '../src/data/defaultResume.js';
import { createDefaultCoverLetter } from '../src/data/defaultCoverLetter.js';
import { TEMPLATES } from '../src/data/templates.js';

afterEach(() => {
  delete globalThis.window;
  delete globalThis.document;
});

for (const [label, exportPdf, makeData] of [
  ['CV', resumePdf, createDefaultResume],
  ['cover letter', letterPdf, createDefaultCoverLetter],
]) {
  for (const mode of ['native', 'unsupported', 'NotAllowedError', 'SecurityError']) {
    test(`${label}: valid PDFs for every template with ${mode} save`, async () => {
      const written = [];
      const clicked = [];
      globalThis.window = {};
      if (mode === 'native') {
        window.showSaveFilePicker = async () => ({
          createWritable: async () => ({
            write: async blob => written.push(blob),
            close: async () => {},
          }),
        });
      } else if (mode !== 'unsupported') {
        window.showSaveFilePicker = async () => { throw new DOMException('Unavailable', mode); };
      }
      globalThis.document = {
        body: { appendChild: link => { link.attached = true; } },
        createElement: () => ({
          style: {},
          click() { assert.ok(this.attached); clicked.push(this); },
          remove() { this.attached = false; },
        }),
      };
      for (const template of TEMPLATES) {
        const result = await exportPdf({ ...makeData(), template: template.id });
        assert.ok(result.saved);
        const blob = mode === 'native' ? written.at(-1) : await (await fetch(result.url)).blob();
        assert.equal(blob.type, 'application/pdf');
        const contents = await blob.text();
        assert.match(contents, /^%PDF-/);
        assert.match(contents, /%%EOF/);
        assert.match(contents, /Your Name/);
        if (result.url) {
          assert.match(result.filename, /\.pdf$/);
          assert.equal(clicked.at(-1).download, result.filename);
          URL.revokeObjectURL(result.url);
        }
      }
    });
  }
  test(`${label}: cancelling the dialog does not trigger a download`, async () => {
    globalThis.window = { showSaveFilePicker: async () => { throw new DOMException('Cancelled', 'AbortError'); } };
    assert.equal(await exportPdf(makeData()), null);
  });
  test(`${label}: disk write errors reach the UI instead of reporting success`, async () => {
    globalThis.window = { showSaveFilePicker: async () => ({
      createWritable: async () => { throw new Error('Disk full'); },
    }) };
    await assert.rejects(exportPdf(makeData()), /Disk full/);
  });
}
