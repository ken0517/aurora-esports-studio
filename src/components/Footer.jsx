export function Footer({ t }) {
  return (
    <footer className="px-5 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 border-t border-white/10 pt-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-medium text-slate-300">{t.brand}</p>
        <p>{t.note}</p>
      </div>
    </footer>
  );
}
