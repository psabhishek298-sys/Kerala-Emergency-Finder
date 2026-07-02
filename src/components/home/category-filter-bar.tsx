import type { ComponentType } from "react";
import { Droplets, Flame, Pill, Plus, Shield } from "lucide-react";
import { CATEGORY_META } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { EmergencyCategory } from "@/types";

const categoryIcons = {
  blood_bank: Droplets,
  fire_station: Flame,
  hospital: Plus,
  pharmacy: Pill,
  police: Shield,
} satisfies Record<EmergencyCategory, ComponentType<{ className?: string }>>;

export function CategoryFilterBar({
  onToggle,
  selectedCategory,
}: {
  onToggle: (category: EmergencyCategory) => void;
  selectedCategory: EmergencyCategory | null;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {(Object.keys(CATEGORY_META) as EmergencyCategory[]).map((category) => {
        const meta = CATEGORY_META[category];
        const Icon = categoryIcons[category];
        const isActive = selectedCategory === category;

        return (
          <button
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-white text-slate-950 shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
                : "bg-white/55 text-slate-500 hover:bg-white/80",
            )}
            key={category}
            onClick={() => onToggle(category)}
            style={{
              borderColor: isActive ? `${meta.color}40` : "rgba(193,198,215,.9)",
              color: isActive ? meta.color : undefined,
            }}
            type="button"
          >
            <Icon className="h-4 w-4" />
            {meta.shortLabel}
          </button>
        );
      })}
    </div>
  );
}
