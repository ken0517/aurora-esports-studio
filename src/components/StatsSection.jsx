import { motion } from "framer-motion";
import { AnimatedSection } from "./AnimatedSection";
import { SectionHeader } from "./SectionHeader";
import { useCountUp } from "../hooks/useCountUp";

function StatCard({ item, index }) {
  const { ref, value } = useCountUp(item.value, 1300 + index * 120);

  return (
    <motion.div
      ref={ref}
      className="glass-panel rounded-2xl p-6"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.36 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <p className="text-4xl font-semibold text-white">
        {value}
        <span className="text-sky-300">{item.suffix}</span>
      </p>
      <h3 className="mt-4 text-lg font-semibold text-slate-100">{item.label}</h3>
      <p className="mt-3 leading-7 text-slate-400">{item.body}</p>
    </motion.div>
  );
}

export function StatsSection({ t }) {
  return (
    <AnimatedSection className="px-5 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <SectionHeader eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle} />
          <div className="flex flex-wrap gap-3 lg:justify-end">
            {t.signals.map((signal) => (
              <span
                key={signal}
                className="rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-sm text-slate-200"
              >
                {signal}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.items.map((item, index) => (
            <StatCard key={item.label} item={item} index={index} />
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
