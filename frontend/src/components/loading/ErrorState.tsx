import React from 'react';
import { Button } from '@/components/forms';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onContactSupport?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message = "We encountered an error while loading this content. Please try again.",
  onRetry,
  onContactSupport,
  className = ''
}) => {
  const ErrorIcon = (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );

  return (
    <div className={`flex flex-col items-center justify-center text-center max-w-[400px] mx-auto py-16 ${className}`}>
      <div className="w-16 h-16 mb-6 flex items-center justify-center text-error">
        {ErrorIcon}
      </div>
      
      <h2 className="heading text-2xl font-bold text-black mb-4">
        {title}
      </h2>
      
      <p className="body text-base text-gray-600 mb-8">
        {message}
      </p>
      
      <div className="flex gap-4">
        {onRetry && (
          <Button onClick={onRetry}>
            Try Again
          </Button>
        )}
        {onContactSupport && (
          <Button variant="tertiary" onClick={onContactSupport}>
            Contact Support
          </Button>
        )}
      </div>
    </div>
  );
};

// Specific error state variants
export const NetworkError: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <ErrorState
    title="Connection Error"
    message="Unable to connect to the server. Please check your internet connection and try again."
    onRetry={onRetry}
  />
);

export const NotFoundError: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <ErrorState
    title="Not Found"
    message="The requested content could not be found. It may have been moved or deleted."
    onRetry={onRetry}
  />
);

export const ServerError: React.FC<{ onRetry?: () => void; onContactSupport?: () => void }> = ({ 
  onRetry, 
  onContactSupport 
}) => (
  <ErrorState
    title="Server Error"
    message="Something went wrong on our end. Please try again in a few moments."
    onRetry={onRetry}
    onContactSupport={onContactSupport}
  />
);
