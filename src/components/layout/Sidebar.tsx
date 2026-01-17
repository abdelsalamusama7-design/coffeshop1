import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  FileText,
  Users,
  BarChart3,
  Settings,
  Camera,
  Receipt,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "لوحة التحكم", path: "/" },
  { icon: Package, label: "المخزون", path: "/inventory" },
  { icon: FileText, label: "الفواتير", path: "/invoices" },
  { icon: Receipt, label: "إيصالات القبض", path: "/receipts" },
  { icon: Users, label: "العملاء", path: "/customers" },
  { icon: BarChart3, label: "التقارير", path: "/reports" },
  { icon: Settings, label: "الإعدادات", path: "/settings" },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="fixed right-0 top-0 h-screen w-64 gradient-sidebar border-l border-sidebar-border flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Camera className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">المراقب</h1>
            <p className="text-xs text-sidebar-foreground/60">نظام إدارة المبيعات</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${isActive ? "nav-link-active" : ""}`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="text-xs text-sidebar-foreground/50 text-center">
          الإصدار 1.0.0
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
