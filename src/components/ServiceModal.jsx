import { useEffect } from "react";
import { motion } from "framer-motion";
import { Icon } from "./IconMap";

export function ServiceModal({ service, labels, contact, onClose }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="service-modal-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={onClose}
    >
      <motion.div
        className="glass-panel blue-glow w-full max-w-2xl rounded-3xl p-6 sm:p-8"
        initial={{ opacity: 0, y: 36, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 28, scale: 0.98 }}
        transition={{ duration: 0.28 }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-5">
          <div>
            <span className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-300/20 bg-sky-400/10 text-sky-200">
              <Icon name={service.icon} className="h-6 w-6" />
            </span>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300/80">{labels.details}</p>
            <h3 id="service-modal-title" className="mt-3 text-3xl font-semibold text-white">
              {service.title}
            </h3>
          </div>
          <button
            type="button"
            aria-label={labels.close}
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.045] text-slate-200 transition hover:border-sky-300/45 hover:bg-sky-400/10"
          >
            <Icon name="X" className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-6 leading-8 text-slate-300">{service.detail}</p>

        <div className="mt-7">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">{labels.includes}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {service.points.map((point) => (
              <div key={point} className="rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm text-slate-200">
                {point}
              </div>
            ))}
          </div>
        </div>

        <a
          href={contact.instagram}
          target="_blank"
          rel="noreferrer"
          className="blue-glow mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-sky-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 sm:w-auto"
        >
          <Icon name="Instagram" className="h-5 w-5" />
          {labels.cta}
        </a>
      </motion.div>
    </motion.div>
  );
}
