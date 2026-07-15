export function SectionHeader({ eyebrow, title, subtitle, align = "left" }) {
  const alignment = align === "center" ? "mx-auto text-center" : "";

  return (
    <div className={`max-w-3xl ${alignment}`}>
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-sky-300/80">
        {eyebrow}
      </p>
      <h2 className="text-balance text-3xl font-semibold tracking-normal text-white sm:text-4xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg">{subtitle}</p>
      ) : null}
    </div>
  );
}
