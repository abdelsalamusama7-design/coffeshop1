import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useWorker, WorkerPermissions } from "@/contexts/WorkerContext";
import { Loader2 } from "lucide-react";

interface WorkerRouteProps {
  children: ReactNode;
  requiredPermission?: keyof WorkerPermissions;
  adminOnly?: boolean;
}

const WorkerRoute = ({ children, requiredPermission, adminOnly = false }: WorkerRouteProps) => {
  const { worker, loading, isLoggedIn, isAdmin, hasPermission } = useWorker();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/worker-auth" replace />;
  }

  // التحقق من صلاحية المسؤول
  if (adminOnly && !isAdmin) {
    return <Navigate to="/pos" replace />;
  }

  // التحقق من الصلاحية المطلوبة
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/pos" replace />;
  }

  return <>{children}</>;
};

export default WorkerRoute;
