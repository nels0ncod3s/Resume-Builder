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
        className="font-display text-5xl font-bold leading-[1.05] tracking-tight text-ink md:text-7xl"
      >

        Build the résumé recruiters
        <br className="hidden md:block" /> actually read.
      </motion.h1>

      <motion.p
        variants={item}
        className="mt-6 max-w-xl text-base text-ink-soft md:text-lg"
      >
        Design a clean, professional résumé in minutes, then scan it with our ATS 
        checker to uncover formatting, missing keyword issues, and mistakes that
        gets resumes silently rejected before recruiters even reads them.
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
        <Link to="/app/ats-checker">
          <motion.span
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="inline-block rounded-full border border-line px-7 py-3.5 text-sm font-semibold text-ink transition-colors hover:border-ink"
          >
            Try the ATS Checker
          </motion.span>
        </Link>
      </motion.div>
    </motion.section>
  );
}
