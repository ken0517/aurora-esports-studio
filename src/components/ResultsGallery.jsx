import { AnimatePresence, motion } from "framer-motion";
import { AnimatedSection } from "./AnimatedSection";
import { Icon } from "./IconMap";
import { SectionHeader } from "./SectionHeader";

export function ResultsGallery({ t, selected, onPreview, onClose }) {
  return (
    <AnimatedSection className="px-5 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle} />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.items.map((item, index) => (
            <motion.button
              type="button"
              key={item.src}
              onClick={() => onPreview(item)}
              className="glass-panel group overflow-hidden rounded-2xl text-left transition hover:border-sky-300/45"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.45, delay: index * 0.05 }}
              whileHover={{ y: -4 }}
            >
              <div className="overflow-hidden">
                <img
                  src={item.src}
                  alt={item.title}
                  className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.035]"
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-white">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-400">{item.meta}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-sky-200">
                  {t.preview}
                  <Icon name="ExternalLink" className="h-4 w-4" />
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selected ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/78 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={onClose}
          >
            <motion.div
              className="w-full max-w-5xl"
              initial={{ opacity: 0, scale: 0.98, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 18 }}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="mb-3 flex justify-end">
                <button
                  type="button"
                  aria-label={t.close}
                  onClick={onClose}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white transition hover:bg-sky-400/15"
                >
                  <Icon name="X" className="h-5 w-5" />
                </button>
              </div>
              <img
                src={selected.src}
                alt={selected.title}
                className="w-full rounded-3xl border border-white/10 object-contain shadow-2xl shadow-black/40"
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </AnimatedSection>
  );
}
