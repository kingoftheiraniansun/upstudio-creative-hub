export function PageHeader({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return (
    <header className="animate-rise px-5 pt-8 pb-5">
      <p className="text-[11px] tracking-[0.35em] text-gold uppercase">{kicker}</p>
      <h1 className="mt-2 text-3xl font-bold leading-tight">{title}</h1>
      {sub && <p className="mt-2 text-sm leading-7 text-muted-foreground">{sub}</p>}
    </header>
  );
}
