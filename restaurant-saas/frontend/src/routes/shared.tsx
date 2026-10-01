type RoleDashboardProps = {
  title: string;
  description: string;
  highlights: string[];
};

export function RoleDashboard({ title, description, highlights }: RoleDashboardProps): JSX.Element {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
      <article className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-200">Operational Focus</p>
        <h2 className="mt-4 text-3xl font-bold text-white">{title}</h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">{description}</p>
      </article>

      <article className="rounded-[2rem] border border-white/10 bg-slate-950/45 p-6">
        <p className="text-sm font-semibold text-white">What this baseline now supports</p>
        <ul className="mt-4 space-y-3 text-sm text-slate-300">
          {highlights.map((highlight) => (
            <li key={highlight} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              {highlight}
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}
