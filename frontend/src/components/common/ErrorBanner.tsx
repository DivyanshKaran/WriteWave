import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TriangleAlert } from "lucide-react";

interface ErrorBannerProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorBanner({ title = "Something went wrong", message, onRetry, retryLabel = "Retry" }: ErrorBannerProps) {
  return (
    <Alert variant="destructive" className="flex items-start justify-between">
      <div className="flex items-start gap-3">
        <TriangleAlert className="h-5 w-5 mt-0.5" />
        <div>
          <AlertTitle>{title}</AlertTitle>
          {message && <AlertDescription className="mt-1 text-sm">{message}</AlertDescription>}
        </div>
      </div>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </Alert>
  );
}


