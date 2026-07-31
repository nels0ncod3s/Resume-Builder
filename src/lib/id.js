/**
 * Safe, environment-tolerant unique ID generator.
 *
 * `crypto.randomUUID()` only exists in "secure contexts" — HTTPS, or
 * `localhost`. Plenty of real-world preview/staging setups (a plain-http
 * custom domain, a LAN/IP address, some sandboxed webview previews) are
 * NOT secure contexts even though `window.crypto` itself exists, so
 * `crypto.randomUUID` is silently `undefined` there. Calling it throws
 * `TypeError: crypto.randomUUID is not a function`.
 *
 * That matters a lot here: every list item in the resume/cover-letter data
 * (education, experience, projects, achievements, skills) gets its `id`
 * from this call, including the very first render of the Builder page
 * (default resume is created synchronously the first time someone visits
 * with an empty localStorage). With no error boundary around the app,
 * one uncaught throw during that first render is enough to unmount the
 * whole page — the app just goes blank.
 *
 * This helper degrades gracefully instead of throwing:
 *   1. `crypto.randomUUID()` when available (secure contexts).
 *   2. A UUID v4 built from `crypto.getRandomValues()`, which — unlike
 *      `randomUUID` — is NOT restricted to secure contexts, so this still
 *      gives a cryptographically random id almost everywhere.
 *   3. A `Math.random()`-based fallback as a last resort for very old or
 *      unusual environments. It's not cryptographically strong, but these
 *      ids are only ever used as local React keys / storage keys, never
 *      for anything security-sensitive, so that's an acceptable trade-off
 *      for "never crash the app" over "never collide, ever".
 */
export function generateId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    try {
      return crypto.randomUUID();
    } catch {
      // Fall through to the next strategy below.
    }
  }

  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10
    const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
