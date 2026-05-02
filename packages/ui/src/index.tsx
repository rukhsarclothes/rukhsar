import type { PropsWithChildren } from "react";

type SectionProps = PropsWithChildren<{
  title: string;
  eyebrow?: string;
  className?: string;
}>;

export function SectionHeading({ title, eyebrow, className, children }: SectionProps) {
  return (
    <div className={className}>
      {eyebrow ? <p className="text-xs uppercase tracking-[0.35em] text-stone-500">{eyebrow}</p> : null}
      <h2 className="mt-3 font-serif text-3xl text-[color:var(--rukhsar-maroon)]">{title}</h2>
      {children ? <div className="mt-4 max-w-2xl text-sm text-stone-600">{children}</div> : null}
    </div>
  );
}
