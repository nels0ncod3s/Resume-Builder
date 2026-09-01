import { useEffect } from "react";
import Hero from "../components/landing/Hero.jsx";
import SocialProof from "../components/landing/SocialProof.jsx";
import FeatureDemo from "../components/landing/FeatureDemo.jsx";

export default function Landing() {
  useEffect(() => {
    document.title = "Resume Pilot | Resume, Cover Letter & ATS Toolkit";
  }, []);

  return (
    <div className="min-h-screen bg-canvas">
      <Hero />
      <SocialProof />
      <FeatureDemo />
      <footer className="flex flex-col items-center justify-between gap-2 border-t border-line px-6 py-8 text-xs text-ink-soft sm:flex-row sm:px-10">
        <span className="font-display text-base font-bold text-ink">Resume Pilot</span>
        <span>No account required. Your documents stay in this browser.</span>
      </footer>
    </div>
  );
}
