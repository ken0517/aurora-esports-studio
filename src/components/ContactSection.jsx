import { motion } from "framer-motion";
import { AnimatedSection } from "./AnimatedSection";
import { Icon } from "./IconMap";
import { SectionHeader } from "./SectionHeader";

export function ContactSection({ t }) {
  return (
    <AnimatedSection id="contact" className="px-5 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="glass-panel blue-glow overflow-hidden rounded-3xl p-6 sm:p-8 lg:p-10">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
            <div>
              <SectionHeader eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle} />
              <p className="mt-6 inline-flex rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-sm text-slate-300">
                {t.noPricing}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={t.links.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="blue-glow inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-sky-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
                >
                  <Icon name="Instagram" className="h-5 w-5" />
                  {t.primary}
                </a>
                <a
                  href={t.links.discord}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.045] px-6 py-3 text-sm font-semibold text-white transition hover:border-sky-300/45 hover:bg-sky-400/10"
                >
                  <Icon name="Gamepad2" className="h-5 w-5" />
                  {t.secondary}
                </a>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {t.channels.map((channel, index) => (
                <motion.a
                  key={channel.key}
                  href={t.links[channel.key]}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 transition hover:border-sky-300/45 hover:bg-sky-400/10"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 0.42, delay: index * 0.04 }}
                  whileHover={{ y: -3 }}
                >
                  <span className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-sky-300/20 bg-sky-400/10 text-sky-200">
                      <Icon name={channel.icon} className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block font-semibold text-white">{channel.label}</span>
                      <span className="mt-1 block text-sm text-slate-400">{channel.body}</span>
                    </span>
                  </span>
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
