import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function Hero() {
  return (
    <motion.section
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto flex max-w-4xl flex-col items-center px-6 pt-12 pb-20 text-center md:pt-20"
    >
      <motion.span
        variants={item}
        className="mb-6 rounded-full border border-line bg-paper px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-ink-soft"
      >
        Build once. Pass every filter.
      </motion.span>

      <motion.h1
        variants={item}
        className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-ink sm:text-5xl sm:leading-[1.05] md:text-7xl"
      >
        Build the résumé recruiters
        <br className="hidden md:block" /> actually read.
      </motion.h1>

      <motion.p
        variants={item}
        className="mt-6 max-w-xl text-base text-ink-soft md:text-lg"
      >
        Design a clean, professional résumé in minutes, then scan it with our ATS 
        checker to uncover formatting issues, missing keywords, and mistakes that
        get resumes silently rejected before recruiters even read them.
      </motion.p>

      <motion.div variants={item} className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Link to="/app/builder">
          <motion.span
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="inline-block rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-ink/10"
          >
            Build my résumé →
          </motion.span>
        </Link>
        <Link
          to="/app/ats-checker"
          className="text-sm font-semibold text-ink-soft underline underline-offset-4 transition-colors hover:text-ink"
        >
          Try the ATS Checker
        </Link>
      </motion.div>
    </motion.section>
  );
}
