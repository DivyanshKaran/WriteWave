import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface LoadingCardProps {
  className?: string;
}

export function LoadingCard({ className }: LoadingCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-14" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface LoadingGridProps {
  count?: number;
  className?: string;
}

export function LoadingGrid({ count = 3, className }: LoadingGridProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <LoadingCard key={index} />
      ))}
    </div>
  );
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-muted border-t-primary ${sizeClasses[size]} ${className}`} />
  );
}

interface LoadingOverlayProps {
  message?: string;
  className?: string;
}

export function LoadingOverlay({ message = 'Loading...', className }: LoadingOverlayProps) {
  return (
    <div className={`fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 ${className}`}>
      <Card className="p-6">
        <CardContent className="flex flex-col items-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">{message}</p>
        </CardContent>
      </Card>
    </div>
  );
}

interface LoadingButtonProps {
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function LoadingButton({ loading, children, className }: LoadingButtonProps) {
  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-md">
          <LoadingSpinner size="sm" />
        </div>
      )}
      <div className={loading ? 'opacity-50' : ''}>
        {children}
      </div>
    </div>
  );
}
