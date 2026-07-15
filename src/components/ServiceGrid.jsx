import { motion } from "framer-motion";
import { AnimatedSection } from "./AnimatedSection";
import { Icon } from "./IconMap";
import { SectionHeader } from "./SectionHeader";

export function ServiceGrid({ t, onSelect }) {
  return (
    <AnimatedSection id="services" className="px-5 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle} />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {t.items.map((service, index) => (
            <motion.button
              type="button"
              key={service.id}
              onClick={() => onSelect(service)}
              className="glass-panel group min-h-44 rounded-2xl p-5 text-left transition duration-300 hover:border-sky-300/45 hover:bg-sky-400/[0.075]"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.28 }}
              transition={{ duration: 0.45, delay: index * 0.04 }}
              whileHover={{ y: -4 }}
            >
              <span className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-sky-300/20 bg-sky-400/10 text-sky-200 transition group-hover:border-sky-200/40 group-hover:bg-sky-300/15">
                <Icon name={service.icon} className="h-5 w-5" />
              </span>
              <span className="block text-xl font-semibold text-white">{service.title}</span>
              <span className="mt-3 block leading-7 text-slate-300">{service.summary}</span>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-sky-200">
                {t.modal.details}
                <Icon name="ChevronRight" className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
