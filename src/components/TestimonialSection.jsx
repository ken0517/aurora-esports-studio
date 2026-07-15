import { motion } from "framer-motion";
import { AnimatedSection } from "./AnimatedSection";
import { SectionHeader } from "./SectionHeader";

export function TestimonialSection({ t }) {
  return (
    <AnimatedSection className="px-5 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <div>
          <SectionHeader eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle} />
          <div className="mt-8 space-y-4">
            {t.quotes.map((quote, index) => (
              <motion.figure
                key={quote.name}
                className="glass-panel rounded-2xl p-5"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
              >
                <blockquote className="leading-7 text-slate-200">"{quote.quote}"</blockquote>
                <figcaption className="mt-4 text-sm font-medium text-sky-200">{quote.name}</figcaption>
              </motion.figure>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:pt-12">
          {t.screenshots.map((item, index) => (
            <motion.div
              key={item.src}
              className="glass-panel overflow-hidden rounded-2xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.28 }}
              transition={{ duration: 0.5, delay: index * 0.06 }}
              whileHover={{ y: -4 }}
            >
              <img src={item.src} alt={item.alt} className="aspect-[3/4] w-full object-cover" loading="lazy" />
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
