import { Component } from "react";

/**
 * Last line of defense against the "blank page" symptom.
 *
 * Without something like this, any uncaught error thrown during render
 * (anywhere in the tree) unmounts the whole app and leaves an empty
 * `<div id="root">` on screen with nothing but a console error to explain
 * it — exactly what happened when `crypto.randomUUID()` threw on the
 * Builder page in an insecure context. That root cause is now fixed (see
 * lib/id.js), but this boundary stays in as a safety net for whatever the
 * *next* unexpected error turns out to be, so people always see a recovery
 * screen instead of silence.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Surfaced in the console for debugging; swap for real error-reporting
    // (Sentry, etc.) if/when this app has one wired up.
    console.error("Resume Pilot crashed:", error, info?.componentStack);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
          <h1 className="font-display text-2xl font-bold text-ink">Something went wrong.</h1>
          <p className="max-w-md text-sm text-ink-soft">
            This page hit an unexpected error and couldn't render. Your resume data is saved in
            your browser, so it should still be there — try reloading, or head back to the
            homepage.
          </p>
          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Reload page
            </button>
            <a
              href="/"
              className="rounded-full border border-line bg-paper px-6 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink"
            >
              Back to homepage
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
