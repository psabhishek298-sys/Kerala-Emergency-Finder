import { PhoneCall } from "lucide-react";
import { EMERGENCY_NUMBERS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function EmergencyNumbersCard() {
  return (
    <Card>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Emergency numbers</p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight">Direct response lines</h3>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <PhoneCall className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {EMERGENCY_NUMBERS.map((item) => (
          <div
            className="rounded-[1.25rem] border border-border bg-background/60 p-4"
            key={item.number}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
              </div>
              <Button asChild size="sm">
                <a href={`tel:${item.number}`}>{item.number}</a>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
