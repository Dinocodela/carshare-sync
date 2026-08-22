import type { ReactNode } from "react";

/** Shared building blocks for the legal pages (Terms, Privacy, etc.). */

export function LegalSection({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-xl font-bold text-foreground mb-4 tracking-tight">
        {title}
      </h2>
      <div className="space-y-3 text-sm text-foreground/85 leading-relaxed">
        {children}
      </div>
    </section>
  );
}

export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li
          key={i}
          className="flex gap-3 text-sm text-foreground/85 leading-relaxed"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function LegalTOC({
  sections,
}: {
  sections: { id: string; title: string }[];
}) {
  return (
    <nav
      aria-label="Contents"
      className="mb-10 rounded-2xl border border-border/60 bg-muted/20 p-5"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
        Contents
      </p>
      <ol className="grid gap-x-6 gap-y-2 sm:grid-cols-2 text-sm">
        {sections.map((s, i) => (
          <li key={s.id} className="flex gap-2">
            <span className="text-muted-foreground tabular-nums">{i + 1}.</span>
            <a
              href={`#${s.id}`}
              className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              {s.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
