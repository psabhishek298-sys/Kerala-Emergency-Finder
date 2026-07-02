import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function ErrorState({
  description,
  title,
}: {
  description?: string;
  title: string;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="max-w-lg text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {description ?? "Please refresh the page and try again."}
        </p>
        <Button
          className="mt-6"
          onClick={() => window.location.reload()}
          variant="outline"
        >
          <RefreshCw className="h-4 w-4" />
          Reload
        </Button>
      </Card>
    </div>
  );
}
