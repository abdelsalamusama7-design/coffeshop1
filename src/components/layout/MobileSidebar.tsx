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
  Cpu,
  Menu,
  X,
} from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { useState } from "react";

const navItems = [
  { icon: LayoutDashboard, label: "لوحة التحكم", path: "/" },
  { icon: Package, label: "المخزون", path: "/inventory" },
  { icon: FileText, label: "الفواتير", path: "/invoices" },
  { icon: FileSpreadsheet, label: "عروض الأسعار", path: "/quotations" },
  { icon: Receipt, label: "إيصالات القبض", path: "/receipts" },
  { icon: Users, label: "العملاء", path: "/customers" },
  { icon: Cpu, label: "الأجهزة والضمانات", path: "/devices" },
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

const MobileSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { role, loading: roleLoading, canAccess, roleLabel, roleColor, isAdmin } = useUserRole();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "تم تسجيل الخروج",
      description: "إلى اللقاء!",
    });
    setOpen(false);
    navigate("/auth");
  };

  const handleNavClick = () => {
    setOpen(false);
  };

  const filteredNavItems = navItems.filter((item) => canAccess(item.path));

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72 p-0 gradient-sidebar border-l border-sidebar-border">
        {/* Logo */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} alt="المراقب" className="w-10 h-10 rounded-xl object-contain" />
              <div>
                <h1 className="text-base font-bold text-sidebar-foreground">المراقب</h1>
                <p className="text-xs text-sidebar-foreground/60">نظام إدارة المبيعات</p>
              </div>
            </div>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="text-sidebar-foreground/80 hover:text-sidebar-foreground">
                <X className="h-5 w-5" />
              </Button>
            </SheetClose>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)]">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            const isAdminPage = ["/reports", "/users", "/settings"].includes(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
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
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-sidebar-border bg-sidebar space-y-2">
          {user && (
            <Link 
              to="/profile"
              onClick={handleNavClick}
              className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
            >
              <div className="text-xs text-sidebar-foreground/80 text-center truncate w-full px-2">
                {user.email}
              </div>
              {!roleLoading && (
                <Badge className={`${roleColor} text-white flex items-center gap-1 text-xs`}>
                  {roleIcons[role]}
                  {roleLabel}
                </Badge>
              )}
            </Link>
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
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
