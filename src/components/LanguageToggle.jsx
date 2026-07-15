import { motion } from "framer-motion";

export function LanguageToggle({ language, onChange, labels }) {
  const nextLanguage = language === "zh" ? "en" : "zh";

  return (
    <div className="fixed right-4 top-4 z-40 sm:right-6 sm:top-6">
      <motion.button
        type="button"
        aria-label={labels.aria}
        onClick={() => onChange(nextLanguage)}
        className="glass-panel inline-flex h-11 items-center gap-2 rounded-full px-2 text-sm font-medium text-slate-100"
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="rounded-full bg-sky-400/15 px-3 py-1.5 text-sky-100">{labels.current}</span>
        <span className="px-2 text-slate-400">{labels.alt}</span>
      </motion.button>
    </div>
  );
}
