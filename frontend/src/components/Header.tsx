import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";

interface HeaderProps {
  isAuthenticated?: boolean;
}

export const Header = ({ isAuthenticated: isAuthenticatedProp }: HeaderProps) => {
  const location = useLocation();
  const isLanding = location.pathname === "/";
  const isAuthenticatedStore = useAuthStore((state) => state.isAuthenticated);
  
  // Use prop if provided, otherwise use store
  const isAuthenticated = isAuthenticatedProp !== undefined ? isAuthenticatedProp : isAuthenticatedStore;
  
  // Check if we're on an auth page (login, signup, forgot-password, etc.)
  const authPages = ['/login', '/signup', '/verify-email', '/forgot-password', '/reset-password'];
  const isAuthPage = authPages.includes(location.pathname);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between">
        <Link to="/" className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight">
          WriteWave
        </Link>

        <nav className="flex items-center gap-3 sm:gap-4 md:gap-6">
          {isLanding ? (
            <>
              <Link to="/login" className="text-xs sm:text-sm font-medium hover:text-accent transition-colors">
                Login
              </Link>
              <Button asChild size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground text-xs sm:text-sm">
                <Link to="/signup">Get Started</Link>
              </Button>
            </>
          ) : isAuthPage ? (
            <>
              {/* Show minimal navigation on auth pages */}
              <Link to="/" className="text-xs sm:text-sm font-medium hover:text-accent transition-colors">
                Home
              </Link>
            </>
          ) : (
            <>
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="text-xs sm:text-sm font-medium hover:text-accent transition-colors">
                    Dashboard
                  </Link>
                  <Link to="/me" className="text-xs sm:text-sm font-medium hover:text-accent transition-colors">
                    Profile
                  </Link>
                </>
              ) : (
                <Link to="/login" className="text-xs sm:text-sm font-medium hover:text-accent transition-colors">
                  Login
                </Link>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
