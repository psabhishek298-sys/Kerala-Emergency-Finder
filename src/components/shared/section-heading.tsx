import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  className,
  eyebrow,
  title,
  description,
  action,
}: {
  action?: ReactNode;
  className?: string;
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className={cn("flex items-end justify-between gap-4", className)}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/80">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground sm:text-base">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}
