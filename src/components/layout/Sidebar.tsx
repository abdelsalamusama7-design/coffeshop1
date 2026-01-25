import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  FileText,
  Users,
  BarChart3,
  Settings,
  Receipt,
  LogOut,
  Shield,
  ShoppingCart,
  Wrench,
  Eye,
  HardHat,
  User,
  FileSpreadsheet,
} from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { icon: LayoutDashboard, label: "لوحة التحكم", path: "/" },
  { icon: Package, label: "المخزون", path: "/inventory" },
  { icon: FileText, label: "الفواتير", path: "/invoices" },
  { icon: FileSpreadsheet, label: "عروض الأسعار", path: "/quotations" },
  { icon: Receipt, label: "إيصالات القبض", path: "/receipts" },
  { icon: Users, label: "العملاء", path: "/customers" },
  { icon: BarChart3, label: "التقارير", path: "/reports" },
  { icon: Users, label: "المستخدمين", path: "/users" },
  { icon: Settings, label: "إعدادات المنظومة", path: "/settings" },
];

const roleIcons: Record<string, React.ReactNode> = {
  admin: <Shield className="h-3 w-3" />,
  supervisor: <Eye className="h-3 w-3" />,
  sales: <ShoppingCart className="h-3 w-3" />,
  technical: <Wrench className="h-3 w-3" />,
  maintenance: <HardHat className="h-3 w-3" />,
  worker: <User className="h-3 w-3" />,
  user: <User className="h-3 w-3" />,
};

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { role, loading: roleLoading, canAccess, roleLabel, roleColor, isAdmin } = useUserRole();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "تم تسجيل الخروج",
      description: "إلى اللقاء!",
    });
    navigate("/auth");
  };

  // Filter nav items based on user permissions
  const filteredNavItems = navItems.filter((item) => canAccess(item.path));

  return (
    <aside className="fixed right-0 top-0 h-screen w-64 gradient-sidebar border-l border-sidebar-border flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <img src={logo} alt="المراقب" className="w-12 h-12 rounded-xl object-contain" />
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">المراقب</h1>
            <p className="text-xs text-sidebar-foreground/60">نظام إدارة المبيعات</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          const isAdminPage = ["/reports", "/users", "/settings"].includes(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${isActive ? "nav-link-active" : ""}`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
              {isAdminPage && isAdmin && (
                <Shield className="w-3 h-3 mr-auto text-sidebar-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="p-4 border-t border-sidebar-border space-y-3">
        {user && (
          <a 
            href="/profile" 
            className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-sidebar-accent transition-colors cursor-pointer"
          >
            <div className="text-sm text-sidebar-foreground/80 text-center truncate w-full px-2">
              {user.email}
            </div>
            {!roleLoading && (
              <Badge 
                className={`${roleColor} text-white flex items-center gap-1`}
              >
                {roleIcons[role]}
                {roleLabel}
              </Badge>
            )}
          </a>
        )}
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sidebar-foreground/80 hover:text-destructive hover:bg-destructive/10"
          onClick={handleSignOut}
        >
          <LogOut className="w-5 h-5" />
          <span>تسجيل الخروج</span>
        </Button>
        <div className="text-xs text-sidebar-foreground/50 text-center">
          الإصدار 1.0.0
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
