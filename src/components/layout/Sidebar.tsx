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
} from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { icon: LayoutDashboard, label: "لوحة التحكم", path: "/", adminOnly: false },
  { icon: Package, label: "المخزون", path: "/inventory", adminOnly: false },
  { icon: FileText, label: "الفواتير", path: "/invoices", adminOnly: false },
  { icon: Receipt, label: "إيصالات القبض", path: "/receipts", adminOnly: false },
  { icon: Users, label: "العملاء", path: "/customers", adminOnly: false },
  { icon: BarChart3, label: "التقارير", path: "/reports", adminOnly: true },
  { icon: Users, label: "المستخدمين", path: "/users", adminOnly: true },
  { icon: Settings, label: "الإعدادات", path: "/settings", adminOnly: true },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "تم تسجيل الخروج",
      description: "إلى اللقاء!",
    });
    navigate("/auth");
  };

  const filteredNavItems = navItems.filter(
    (item) => !item.adminOnly || isAdmin
  );

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
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${isActive ? "nav-link-active" : ""}`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
              {item.adminOnly && (
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
                variant={isAdmin ? "default" : "secondary"}
                className={isAdmin ? "bg-sidebar-primary text-sidebar-primary-foreground" : ""}
              >
                {isAdmin ? "مسؤول" : "مستخدم"}
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
