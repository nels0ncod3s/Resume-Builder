import Hero from "../components/landing/Hero.jsx";
import SocialProof from "../components/landing/SocialProof.jsx";
import FeatureDemo from "../components/landing/FeatureDemo.jsx";

export default function Landing() {
  return (
    <div className="min-h-screen bg-canvas">
      <Hero />
      <SocialProof />
      <FeatureDemo />
      <footer className="border-t border-line px-6 py-8 text-center text-xs text-ink-soft">
        Resumely — no account needed, your data stays in your browser.
      </footer>
    </div>
  );
}
