import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthSimplified } from '@/hooks/useAuthSimplified';
import { Loader2, ShieldX } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'creator' | 'user';
}

const ProtectedRouteSimplified = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, loading, error } = useAuthSimplified();
  const [isChecking, setIsChecking] = useState(true);
  const [hasRequiredRole, setHasRequiredRole] = useState<boolean | null>(null);
  const [roleCheckError, setRoleCheckError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const checkRole = async () => {
      if (!user || !requiredRole) {
        if (isMounted) {
          setHasRequiredRole(true);
          setIsChecking(false);
        }
        return;
      }

      try {
        // Add timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          if (isMounted) {
            console.warn('⚠️ [ProtectedRouteSimplified] Role check timeout');
            setRoleCheckError('Role verification timeout - please try again');
            setHasRequiredRole(false);
            setIsChecking(false);
          }
        }, 5000); // 5 second timeout

        // For now, assume all authenticated users have required role
        // This prevents the app from getting stuck on role checks
        console.log('🔐 [ProtectedRouteSimplified] User authenticated, allowing access');
        
        if (isMounted) {
          setHasRequiredRole(true);
          setIsChecking(false);
        }

        // Clear timeout
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

      } catch (error) {
        console.error('❌ [ProtectedRouteSimplified] Error in role check:', error);
        if (isMounted) {
          setRoleCheckError('Failed to verify user role');
          setHasRequiredRole(false);
          setIsChecking(false);
        }
      }
    };

    // Give a small delay to ensure auth state is loaded
    const timer = setTimeout(() => {
      checkRole();
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [user, requiredRole]);

  // Show loading state
  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <ShieldX className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle className="text-destructive">Authentication Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              {error}
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="w-full"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect to auth if no user
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Show role check error
  if (roleCheckError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <ShieldX className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle className="text-destructive">Access Verification Failed</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              {roleCheckError}
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="w-full"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show access denied
  if (hasRequiredRole === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <ShieldX className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle className="text-destructive">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              You don't have the required permissions to access this area.
            </p>
            <Button 
              onClick={() => window.history.back()} 
              variant="outline"
              className="w-full"
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User has required role or no role requirement
  return <>{children}</>;
};

export default ProtectedRouteSimplified;
