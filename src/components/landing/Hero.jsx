import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

export default function Hero() {
  return (
    <section className="relative min-h-[590px] overflow-hidden bg-ink text-white">
      <img
        src="/og-image.png"
        alt="Resume Pilot workspace showing a resume and ATS review"
        className="absolute inset-0 h-full w-full object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-black/65" aria-hidden="true" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <a href="/" className="font-display text-xl font-bold text-white">
          Resume Pilot
        </a>
        <nav className="hidden items-center gap-7 text-xs font-semibold text-white/70 sm:flex">
          <a href="#workflow" className="transition-colors hover:text-white">How it works</a>
          <a href="#templates" className="transition-colors hover:text-white">Templates</a>
          <Link to="/app/ats-checker" className="transition-colors hover:text-white">ATS check</Link>
        </nav>
        <Link
          to="/app/builder"
          className="flex min-h-[40px] items-center gap-2 border border-white/40 px-4 text-xs font-semibold text-white transition-colors hover:bg-white hover:text-ink"
        >
          Open workspace <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </header>

      <motion.div
        initial="hidden"
        animate="show"
        transition={{ staggerChildren: 0.1, delayChildren: 0.08 }}
        className="relative z-10 mx-auto flex min-h-[490px] max-w-6xl flex-col justify-center px-6 pb-16 pt-10"
      >
        <motion.p variants={item} className="mb-5 flex items-center gap-2 text-xs font-bold uppercase text-white/70">
          <ShieldCheck size={15} aria-hidden="true" />
          Private, browser-based application toolkit
        </motion.p>
        <motion.h1 variants={item} className="max-w-3xl font-display text-5xl font-bold leading-[1.02] sm:text-6xl md:text-7xl">
          Resume Pilot
        </motion.h1>
        <motion.p variants={item} className="mt-5 max-w-2xl font-display text-2xl leading-tight text-white sm:text-3xl">
          Build, tailor, and check every application in one focused workspace.
        </motion.p>
        <motion.p variants={item} className="mt-5 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">
          Create a polished resume and matching cover letter, compare your wording with a target role,
          and export clean documents without creating an account.
        </motion.p>
        <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            to="/app/builder"
            className="flex min-h-[48px] items-center gap-2 bg-white px-6 text-sm font-bold text-ink transition-colors hover:bg-canvas"
          >
            Start building <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link
            to="/app/ats-checker"
            className="flex min-h-[48px] items-center border border-white/40 px-6 text-sm font-semibold text-white transition-colors hover:border-white"
          >
            Check a resume
          </Link>
        </motion.div>
        <motion.p variants={item} className="mt-4 text-xs text-white/55">
          Free to use. No sign-up. Nothing is uploaded to an account.
        </motion.p>
      </motion.div>
    </section>
  );
}
