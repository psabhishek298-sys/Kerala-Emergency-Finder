import { LocateFixed, MapPinned, TriangleAlert } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Coordinates } from "@/types";

export function LocationStatusCard({
  error,
  isLoading,
  onRetry,
  permissionState,
  position,
}: {
  error: string | null;
  isLoading: boolean;
  onRetry: () => void;
  permissionState: string;
  position: Coordinates | null;
}) {
  return (
    <Card className="relative overflow-hidden bg-hero-grid">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
        initial={{ opacity: 0, y: 18 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <LocateFixed className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Current position</p>
            <h3 className="text-xl font-semibold tracking-tight">
              {position ? "Location captured" : "Waiting for permission"}
            </h3>
          </div>
        </div>

        {position ? (
          <div className="rounded-[1.5rem] border border-white/20 bg-white/60 p-4 dark:bg-slate-950/30">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPinned className="h-4 w-4" />
              Auto-detected browser coordinates
            </div>
            <p className="mt-2 text-sm font-medium">
              {position.latitude.toFixed(5)}, {position.longitude.toFixed(5)}
            </p>
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-border bg-background/50 p-4 text-sm text-muted-foreground">
            {isLoading
              ? "Requesting access to your current position so nearby emergency services can be loaded."
              : error ??
                "Location access is needed to show emergency services near you."}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={onRetry} variant={position ? "outline" : "default"}>
            <LocateFixed className="h-4 w-4" />
            {position ? "Refresh location" : "Allow location"}
          </Button>
          <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <TriangleAlert className="h-3.5 w-3.5" />
            Permission: {permissionState}
          </span>
        </div>
      </motion.div>
    </Card>
  );
}
