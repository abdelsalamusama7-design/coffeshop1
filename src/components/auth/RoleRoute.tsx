import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface RoleRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

const RoleRoute = ({ children, allowedRoles }: RoleRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading, canAccess, roleLabel } = useUserRole();
  const location = useLocation();

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if user has permission to access this path
  const hasAccess = allowedRoles 
    ? allowedRoles.includes(role) 
    : canAccess(location.pathname);

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md shadow-card border-destructive/20">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldAlert className="h-8 w-8 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-xl text-destructive">غير مصرح</CardTitle>
              <CardDescription className="mt-2">
                ليس لديك صلاحية للوصول إلى هذه الصفحة.
                <br />
                <span className="text-sm">صلاحيتك الحالية: <strong>{roleLabel}</strong></span>
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="text-center space-x-2 space-x-reverse">
            <Button variant="outline" onClick={() => window.history.back()}>
              العودة للخلف
            </Button>
            <Button onClick={() => window.location.href = "/"}>
              الصفحة الرئيسية
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleRoute;
