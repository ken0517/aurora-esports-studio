import { motion } from "framer-motion";
import { Icon } from "./IconMap";

export function HeroSection({ t, contact }) {
  return (
    <section className="relative overflow-hidden px-5 pb-16 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:min-h-[760px] lg:grid-cols-[1fr_0.82fr]">
        <div>
          <motion.p
            className="mb-5 inline-flex rounded-full border border-sky-300/15 bg-sky-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-sky-200"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            {t.eyebrow}
          </motion.p>
          <motion.h1
            className="text-balance text-5xl font-semibold tracking-normal text-white sm:text-6xl lg:text-7xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08 }}
          >
            {t.brand}
          </motion.h1>
          <motion.p
            className="mt-6 max-w-3xl text-balance text-3xl font-medium leading-tight text-slate-100 sm:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16 }}
          >
            {t.headline}
          </motion.p>
          <motion.p
            className="mt-6 max-w-2xl text-lg leading-8 text-slate-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24 }}
          >
            {t.subheadline}
          </motion.p>

          <motion.div
            className="mt-8 flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.32 }}
          >
            {t.badges.map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-sm text-slate-200 shadow-lg shadow-black/10"
              >
                {badge}
              </span>
            ))}
          </motion.div>

          <motion.div
            className="mt-10 flex flex-col gap-3 sm:flex-row"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.4 }}
          >
            <a
              href={contact.instagram}
              target="_blank"
              rel="noreferrer"
              className="blue-glow inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-sky-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
            >
              <Icon name="Instagram" className="h-5 w-5" />
              {t.primaryCta}
            </a>
            <a
              href="#services"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.045] px-6 py-3 text-sm font-semibold text-white transition hover:border-sky-300/45 hover:bg-sky-400/10"
            >
              {t.secondaryCta}
              <Icon name="ChevronRight" className="h-4 w-4" />
            </a>
          </motion.div>
        </div>

        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.97, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="absolute -inset-5 rounded-[2rem] bg-sky-400/10 blur-3xl" aria-hidden="true" />
          <div className="glass-panel relative overflow-hidden rounded-3xl p-3">
            <img
              src="./assets/brand/aurora-dashboard.png"
              alt={t.mediaLabel}
              className="aspect-[4/3] w-full rounded-2xl object-cover"
              loading="eager"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
