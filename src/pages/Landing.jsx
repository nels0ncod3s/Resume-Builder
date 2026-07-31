import { useEffect } from "react";
import Hero from "../components/landing/Hero.jsx";
import SocialProof from "../components/landing/SocialProof.jsx";
import FeatureDemo from "../components/landing/FeatureDemo.jsx";

export default function Landing() {
  // index.html isn't part of this codebase, so the static <title>/meta
  // tags can't be edited directly from here — see the note handed back
  // alongside this change for what to put in index.html's <head> for
  // real SEO (meta description, Open Graph tags, etc.), which a
  // JS-set document.title alone can't cover.
  useEffect(() => {
    document.title = "Resume Pilot – Free ATS-Friendly Resume & Cover Letter Builder";
  }, []);

  return (
    <div className="min-h-screen bg-canvas">
      <Hero />
      <SocialProof />
      <FeatureDemo />
      <footer className="border-t border-line px-6 py-8 text-center text-xs text-ink-soft">
        Resume Pilot — no account needed, your data stays in your browser.
      </footer>
    </div>
  );
}
