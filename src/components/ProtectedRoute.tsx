import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, ShieldX } from 'lucide-react';
import { isDevMode } from '@/config/dev-mode';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'creator' | 'user';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [hasRequiredRole, setHasRequiredRole] = useState<boolean | null>(null);
  const [roleCheckError, setRoleCheckError] = useState<string | null>(null);

  useEffect(() => {
    const checkRole = async () => {
      if (!user || !requiredRole) {
        setHasRequiredRole(true);
        setIsChecking(false);
        return;
      }

      try {
        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Role check timeout')), 10000); // 10 second timeout
        });

        const roleCheckPromise = async () => {
          if (requiredRole === 'admin') {
            // Check if user is super admin
            const { data, error } = await supabase.rpc('check_user_admin_status', {
              user_id: user.id
            });

            if (error) {
              console.error('Error checking admin status:', error);
              setRoleCheckError('Failed to verify admin status');
              setHasRequiredRole(false);
            } else {
              setHasRequiredRole(data === true);
            }
          } else if (requiredRole === 'creator') {
            // Check if user has a creator profile
            const { data, error } = await supabase
              .from('creators')
              .select('id')
              .eq('user_id', user.id)
              .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
              console.error('Error checking creator status:', error);
              setRoleCheckError('Failed to verify creator status');
              setHasRequiredRole(false);
            } else {
              setHasRequiredRole(!!data);
            }
          } else {
            // For 'user' role, any authenticated user is allowed
            setHasRequiredRole(true);
          }
        };

        await Promise.race([roleCheckPromise(), timeoutPromise]);
      } catch (error) {
        console.error('Error in role check:', error);
        setRoleCheckError('Failed to verify user role');
        setHasRequiredRole(false);
      } finally {
        setIsChecking(false);
      }
    };

    // Give a small delay to ensure auth state is loaded
    const timer = setTimeout(() => {
      checkRole();
    }, 500);

    return () => clearTimeout(timer);
  }, [user, requiredRole]);

  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

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
              Unable to verify your access level. Please try again or contact support.
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

export default ProtectedRoute;







