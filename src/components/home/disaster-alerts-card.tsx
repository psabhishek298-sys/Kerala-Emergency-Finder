import { ExternalLink, Siren } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DisasterAlert } from "@/types";

export function DisasterAlertsCard({
  alerts,
  isLoading,
}: {
  alerts: DisasterAlert[];
  isLoading: boolean;
}) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Kerala disaster alerts</p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight">Official KSDMA warnings</h3>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
          <Siren className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {isLoading &&
          Array.from({ length: 3 }).map((_, index) => (
            <Skeleton className="h-24 w-full rounded-[1.25rem]" key={index} />
          ))}
        {!isLoading && alerts.length === 0 && (
          <div className="rounded-[1.25rem] border border-border bg-background/60 p-4 text-sm text-muted-foreground">
            No alert entries could be parsed right now. Open the official KSDMA site for the latest warning bulletins.
          </div>
        )}
        {alerts.map((alert) => (
          <a
            className="block rounded-[1.25rem] border border-border bg-background/60 p-4 transition hover:bg-background"
            href={alert.link}
            key={alert.link}
            rel="noreferrer"
            target="_blank"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{alert.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{alert.description}</p>
              </div>
              <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
            </div>
          </a>
        ))}
      </div>
    </Card>
  );
}
