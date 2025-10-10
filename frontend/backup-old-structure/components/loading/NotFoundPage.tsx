import React from 'react';
import { Button } from '@/components/ui';
import Link from 'next/link';

interface NotFoundPageProps {
  title?: string;
  message?: string;
  description?: string;
  showHomeButton?: boolean;
  className?: string;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  title = "404",
  message = "Page not found",
  description = "The page you're looking for doesn't exist or has been moved.",
  showHomeButton = true,
  className = ''
}) => {
  return (
    <div className={`min-h-screen bg-white flex items-center justify-center px-4 ${className}`}>
      <div className="text-center max-w-md">
        <h1 className="heading text-[120px] font-bold text-black mb-4 leading-none">
          {title}
        </h1>
        
        <h2 className="heading text-2xl font-bold text-black mb-4">
          {message}
        </h2>
        
        <p className="body text-base text-gray-600 mb-8">
          {description}
        </p>
        
        {showHomeButton && (
          <Link href="/">
            <Button>
              Go Home
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};
