import { AnimatedSection } from "./AnimatedSection";
import { SectionHeader } from "./SectionHeader";

export function FAQSection({ t }) {
  return (
    <AnimatedSection className="px-5 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.82fr_1.18fr]">
        <SectionHeader eyebrow={t.eyebrow} title={t.title} />
        <div className="space-y-3">
          {t.items.map((item) => (
            <details key={item.question} className="glass-panel group rounded-2xl p-5 open:border-sky-300/30">
              <summary className="cursor-pointer list-none text-lg font-semibold text-white">
                <span className="flex items-start justify-between gap-5">
                  {item.question}
                  <span className="mt-1 h-5 w-5 shrink-0 rounded-full border border-slate-600 text-center text-xs leading-[18px] text-sky-200 group-open:bg-sky-400/15">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-4 leading-7 text-slate-300">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
