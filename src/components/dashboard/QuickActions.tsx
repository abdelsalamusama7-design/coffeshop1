import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShoppingCart,
  RotateCcw,
  Package,
  Truck,
  PackageX,
  Trash2,
  Receipt,
  Wallet,
  FileText,
  CreditCard,
  UserCheck,
  UserMinus,
  Users,
  Shield,
  Database,
  HardDrive,
  AlertTriangle,
  Clock,
  CheckCircle,
} from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";

interface QuickAction {
  icon: React.ElementType;
  label: string;
  path: string;
  color: string;
  bgColor: string;
  category: "operations" | "treasury" | "services";
}

const allActions: QuickAction[] = [
  // Operations
  {
    icon: ShoppingCart,
    label: "مبيعات",
    path: "/invoices",
    color: "text-blue-600",
    bgColor: "bg-blue-50 hover:bg-blue-100",
    category: "operations",
  },
  {
    icon: RotateCcw,
    label: "إرجاع مبيعات",
    path: "/invoices",
    color: "text-orange-600",
    bgColor: "bg-orange-50 hover:bg-orange-100",
    category: "operations",
  },
  {
    icon: Package,
    label: "إعادة الترصيد",
    path: "/inventory",
    color: "text-green-600",
    bgColor: "bg-green-50 hover:bg-green-100",
    category: "operations",
  },
  {
    icon: Truck,
    label: "مشتريات",
    path: "/inventory",
    color: "text-purple-600",
    bgColor: "bg-purple-50 hover:bg-purple-100",
    category: "operations",
  },
  {
    icon: PackageX,
    label: "إرجاع مشتريات",
    path: "/inventory",
    color: "text-red-600",
    bgColor: "bg-red-50 hover:bg-red-100",
    category: "operations",
  },
  {
    icon: Trash2,
    label: "التالف",
    path: "/inventory",
    color: "text-gray-600",
    bgColor: "bg-gray-50 hover:bg-gray-100",
    category: "operations",
  },
  // Treasury
  {
    icon: Receipt,
    label: "إيصال قبض",
    path: "/receipts",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 hover:bg-emerald-100",
    category: "treasury",
  },
  {
    icon: Wallet,
    label: "مصروفات",
    path: "/receipts",
    color: "text-amber-600",
    bgColor: "bg-amber-50 hover:bg-amber-100",
    category: "treasury",
  },
  {
    icon: FileText,
    label: "التقرير العام",
    path: "/reports",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50 hover:bg-indigo-100",
    category: "treasury",
  },
  {
    icon: CreditCard,
    label: "سند صرف",
    path: "/receipts",
    color: "text-rose-600",
    bgColor: "bg-rose-50 hover:bg-rose-100",
    category: "treasury",
  },
  {
    icon: UserMinus,
    label: "سند صرف لموظف",
    path: "/receipts",
    color: "text-pink-600",
    bgColor: "bg-pink-50 hover:bg-pink-100",
    category: "treasury",
  },
  {
    icon: UserCheck,
    label: "سند قبض من موظف",
    path: "/receipts",
    color: "text-teal-600",
    bgColor: "bg-teal-50 hover:bg-teal-100",
    category: "treasury",
  },
  // Services
  {
    icon: HardDrive,
    label: "نسخ احتياطي",
    path: "/settings",
    color: "text-cyan-600",
    bgColor: "bg-cyan-50 hover:bg-cyan-100",
    category: "services",
  },
  {
    icon: Database,
    label: "استرداد بيانات",
    path: "/settings",
    color: "text-sky-600",
    bgColor: "bg-sky-50 hover:bg-sky-100",
    category: "services",
  },
  {
    icon: Users,
    label: "المستخدمين",
    path: "/users",
    color: "text-violet-600",
    bgColor: "bg-violet-50 hover:bg-violet-100",
    category: "services",
  },
  {
    icon: Shield,
    label: "صلاحيات المستخدمين",
    path: "/users",
    color: "text-fuchsia-600",
    bgColor: "bg-fuchsia-50 hover:bg-fuchsia-100",
    category: "services",
  },
  {
    icon: AlertTriangle,
    label: "أصناف منتهية الصلاحية",
    path: "/inventory",
    color: "text-red-600",
    bgColor: "bg-red-50 hover:bg-red-100",
    category: "services",
  },
  {
    icon: Clock,
    label: "أصناف قريبة الصلاحية",
    path: "/inventory",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50 hover:bg-yellow-100",
    category: "services",
  },
  {
    icon: CheckCircle,
    label: "الصلاحية",
    path: "/inventory",
    color: "text-lime-600",
    bgColor: "bg-lime-50 hover:bg-lime-100",
    category: "services",
  },
];

const categoryLabels = {
  operations: "العمليات",
  treasury: "الخزينة",
  services: "الخدمات",
};

const QuickActions = () => {
  const { canAccess } = useUserRole();

  // Filter actions based on user permissions
  const filteredActions = allActions.filter((action) => canAccess(action.path));

  // Group actions by category
  const groupedActions = filteredActions.reduce((acc, action) => {
    if (!acc[action.category]) {
      acc[action.category] = [];
    }
    acc[action.category].push(action);
    return acc;
  }, {} as Record<string, QuickAction[]>);

  const categories = ["operations", "treasury", "services"] as const;

  return (
    <div className="space-y-6">
      {categories.map((category) => {
        const actions = groupedActions[category];
        if (!actions || actions.length === 0) return null;

        return (
          <Card key={category} className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">
                {categoryLabels[category]}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {actions.map((action, index) => (
                  <Link
                    key={index}
                    to={action.path}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-border ${action.bgColor} transition-all duration-200 hover:scale-105 hover:shadow-md`}
                  >
                    <action.icon className={`w-8 h-8 ${action.color}`} />
                    <span className="text-sm font-medium text-foreground text-center leading-tight">
                      {action.label}
                    </span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default QuickActions;
