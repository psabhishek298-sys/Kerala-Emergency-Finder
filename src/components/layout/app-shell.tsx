import type { PropsWithChildren } from "react";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="relative overflow-hidden">
      <div className="mx-auto max-w-[2200px] px-4 pb-8 pt-0 sm:px-6 lg:px-8 2xl:px-10">{children}</div>
    </div>
  );
}
