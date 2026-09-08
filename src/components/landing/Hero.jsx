import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

export default function Hero() {
  return (
    <section className="border-b border-line bg-paper text-ink">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <a href="/" className="font-display text-xl font-bold text-ink">
          Resume Pilot
        </a>
        <nav className="hidden items-center gap-7 text-sm font-medium text-ink-soft sm:flex">
          <a href="#workflow" className="transition-colors hover:text-ink">How it works</a>
          <a href="#templates" className="transition-colors hover:text-ink">Templates</a>
          <Link to="/app/ats-checker" className="transition-colors hover:text-ink">ATS check</Link>
        </nav>
        <Link
          to="/app/builder"
          className="flex min-h-[42px] items-center gap-2 border border-ink px-4 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-white"
        >
          Build a resume <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </header>

      <motion.div
        initial="hidden"
        animate="show"
        transition={{ staggerChildren: 0.1, delayChildren: 0.08 }}
        className="mx-auto flex min-h-[500px] max-w-5xl flex-col items-center justify-center px-6 py-20 text-center sm:py-24"
      >
        <motion.p variants={item} className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-ink-soft">
          Resume builder · Cover letters · ATS review
        </motion.p>
        <motion.h1 variants={item} className="max-w-4xl font-display text-5xl font-bold leading-[1.03] sm:text-6xl md:text-7xl">
          A clearer resume starts here.
        </motion.h1>
        <motion.p variants={item} className="mt-6 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">
          Write, tailor, and export a polished application in one focused workspace. No account,
          no clutter, and your documents stay in your browser.
        </motion.p>
        <motion.div variants={item} className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/app/builder"
            className="flex min-h-[48px] items-center gap-2 bg-ink px-6 text-sm font-bold text-white transition-opacity hover:opacity-85"
          >
            Start building <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link
            to="/app/ats-checker"
            className="flex min-h-[48px] items-center border border-line px-6 text-sm font-semibold text-ink transition-colors hover:border-ink"
          >
            Check a resume
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
