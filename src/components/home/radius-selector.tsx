import { RADIUS_OPTIONS } from "@/lib/constants";
import type { RadiusOption } from "@/types";
import { cn } from "@/lib/utils";

export function RadiusSelector({
  onChange,
  value,
}: {
  onChange: (radius: RadiusOption) => void;
  value: RadiusOption;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {RADIUS_OPTIONS.map((radius) => (
        <button
          className={cn(
            "rounded-full border px-4 py-2 text-sm font-medium transition",
            value === radius
              ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20"
              : "border-border bg-background/70 text-muted-foreground hover:bg-background",
          )}
          key={radius}
          onClick={() => onChange(radius)}
          type="button"
        >
          {radius} km
        </button>
      ))}
    </div>
  );
}
