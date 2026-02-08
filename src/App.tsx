import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { WorkerProvider } from "@/contexts/WorkerContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import RoleRoute from "@/components/auth/RoleRoute";
import WorkerRoute from "@/components/auth/WorkerRoute";
import NotificationProvider from "@/components/notifications/NotificationProvider";

// صفحات النظام الأصلي (للأدمن)
import Index from "./pages/Index";
import Inventory from "./pages/Inventory";
import Invoices from "./pages/Invoices";
import Receipts from "./pages/Receipts";
import Customers from "./pages/Customers";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import UserManagement from "./pages/UserManagement";
import Profile from "./pages/Profile";
import Quotations from "./pages/Quotations";
import Devices from "./pages/Devices";
import NotFound from "./pages/NotFound";
import AIChatbot from "./components/chat/AIChatbot";

// صفحات نظام القهوة الجديد
import POS from "./pages/POS";
import Workers from "./pages/Workers";
import Attendance from "./pages/Attendance";
import CoffeeReports from "./pages/CoffeeReports";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <WorkerProvider>
        <NotificationProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* الصفحة الرئيسية - توجيه لصفحة تسجيل الدخول */}
                <Route path="/" element={<Navigate to="/auth" replace />} />
                
                {/* صفحة تسجيل الدخول الموحدة */}
                <Route path="/auth" element={<Auth />} />
                
                {/* نقطة البيع */}
                <Route
                  path="/pos"
                  element={
                    <WorkerRoute>
                      <POS />
                    </WorkerRoute>
                  }
                />
                
                {/* إدارة العمال */}
                <Route
                  path="/workers"
                  element={
                    <WorkerRoute adminOnly>
                      <Workers />
                    </WorkerRoute>
                  }
                />
                
                {/* الحضور والانصراف */}
                <Route
                  path="/attendance"
                  element={
                    <WorkerRoute>
                      <Attendance />
                    </WorkerRoute>
                  }
                />
                {/* صفحات النظام الأصلي (للأدمن المتقدم) */}
                <Route
                  path="/dashboard"
                  element={
                    <RoleRoute>
                      <Index />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/inventory"
                  element={
                    <RoleRoute>
                      <Inventory />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/invoices"
                  element={
                    <RoleRoute>
                      <Invoices />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/receipts"
                  element={
                    <RoleRoute>
                      <Receipts />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/customers"
                  element={
                    <RoleRoute>
                      <Customers />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <WorkerRoute requiredPermission="can_view_reports">
                      <CoffeeReports />
                    </WorkerRoute>
                  }
                />
                <Route
                  path="/quotations"
                  element={
                    <RoleRoute>
                      <Quotations />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/devices"
                  element={
                    <RoleRoute>
                      <Devices />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <RoleRoute allowedRoles={["admin"]}>
                      <Settings />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/users"
                  element={
                    <RoleRoute allowedRoles={["admin"]}>
                      <UserManagement />
                    </RoleRoute>
                  }
                />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <AIChatbot />
            </BrowserRouter>
          </TooltipProvider>
        </NotificationProvider>
      </WorkerProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
