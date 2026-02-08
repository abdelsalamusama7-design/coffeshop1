// Role-based permissions configuration
export type AppRole = "admin" | "user" | "sales" | "technical" | "supervisor" | "maintenance" | "worker" | "sales_manager" | "accountant" | "financial_manager";

// Define which roles can access which pages
export const rolePermissions: Record<AppRole, string[]> = {
  admin: [
    "/",
    "/home",
    "/dashboard",
    "/inventory",
    "/invoices",
    "/customers",
    "/reports",
    "/settings",
    "/users",
    "/profile",
  ],
  supervisor: [
    "/",
    "/home",
    "/dashboard",
    "/inventory",
    "/invoices",
    "/customers",
    "/reports",
    "/profile",
  ],
  sales_manager: [
    "/",
    "/home",
    "/dashboard",
    "/inventory",
    "/invoices",
    "/customers",
    "/reports",
    "/profile",
  ],
  financial_manager: [
    "/",
    "/home",
    "/dashboard",
    "/invoices",
    "/customers",
    "/reports",
    "/profile",
  ],
  accountant: [
    "/",
    "/home",
    "/dashboard",
    "/invoices",
    "/customers",
    "/reports",
    "/profile",
  ],
  sales: [
    "/",
    "/home",
    "/dashboard",
    "/invoices",
    "/customers",
    "/profile",
  ],
  technical: [
    "/",
    "/home",
    "/dashboard",
    "/inventory",
    "/profile",
  ],
  maintenance: [
    "/",
    "/home",
    "/dashboard",
    "/inventory",
    "/profile",
  ],
  worker: [
    "/",
    "/profile",
  ],
  user: [
    "/",
    "/profile",
  ],
};

// Role display information
export const roleInfo: Record<AppRole, { label: string; color: string }> = {
  admin: { label: "مسؤول", color: "bg-primary" },
  supervisor: { label: "مشرف", color: "bg-orange-500" },
  sales_manager: { label: "مدير المبيعات", color: "bg-emerald-500" },
  financial_manager: { label: "المدير المالي", color: "bg-indigo-500" },
  accountant: { label: "المحاسب", color: "bg-cyan-500" },
  sales: { label: "مبيعات", color: "bg-blue-500" },
  technical: { label: "تقني", color: "bg-purple-500" },
  maintenance: { label: "صيانة", color: "bg-yellow-500" },
  worker: { label: "عامل", color: "bg-gray-500" },
  user: { label: "مستخدم", color: "bg-secondary" },
};

// Check if a role can access a specific path
export const canAccessPath = (role: AppRole, path: string): boolean => {
  const allowedPaths = rolePermissions[role] || rolePermissions.user;
  return allowedPaths.includes(path);
};

// Get all allowed paths for a role
export const getAllowedPaths = (role: AppRole): string[] => {
  return rolePermissions[role] || rolePermissions.user;
};
