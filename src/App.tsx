import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import RoleRoute from "@/components/auth/RoleRoute";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/"
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
                <RoleRoute>
                  <Reports />
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
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
