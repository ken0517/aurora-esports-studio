import { motion } from "framer-motion";
import { AnimatedSection } from "./AnimatedSection";
import { Icon } from "./IconMap";
import { SectionHeader } from "./SectionHeader";

export function OrderFlow({ t }) {
  return (
    <AnimatedSection className="px-5 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle} align="center" />
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {t.steps.map((step, index) => (
            <motion.div
              key={step.title}
              className="glass-panel relative rounded-2xl p-5"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.28 }}
              transition={{ duration: 0.45, delay: index * 0.05 }}
            >
              <div className="mb-5 flex items-center justify-between">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-sky-300/20 bg-sky-400/10 text-sky-200">
                  <Icon name={step.icon} className="h-5 w-5" />
                </span>
                <span className="text-sm font-semibold text-slate-500">0{index + 1}</span>
              </div>
              <h3 className="text-lg font-semibold text-white">{step.title}</h3>
              <p className="mt-3 leading-7 text-slate-400">{step.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
