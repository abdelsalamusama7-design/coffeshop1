import { useEffect } from "react";
import { useLowStockNotifications } from "@/hooks/useLowStockNotifications";

const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize low stock notifications monitoring
  useLowStockNotifications();

  return <>{children}</>;
};

export default NotificationProvider;
