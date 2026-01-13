import { ReactNode } from 'react';

interface RequireAuthProps {
  children: ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  // Auth bypass for demo/development - always allow access
  return children as any;
}


