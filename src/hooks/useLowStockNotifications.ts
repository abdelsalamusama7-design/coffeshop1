import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "./useNotifications";
import { useCompanySettings } from "./useCompanySettings";

export const useLowStockNotifications = () => {
  const { user } = useAuth();
  const { createNotification } = useNotifications();
  const { settings } = useCompanySettings();
  const notifiedProducts = useRef<Set<string>>(new Set());

  const { data: lowStockProducts } = useQuery({
    queryKey: ["low-stock-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, stock, min_stock")
        .filter("stock", "lte", supabase.rpc ? 0 : 999999);

      if (error) throw error;
      
      // Filter products where stock <= min_stock
      return (data || []).filter(p => p.stock <= p.min_stock);
    },
    enabled: !!user?.id && settings?.low_stock_alert !== false,
    refetchInterval: 60000, // Check every minute
  });

  useEffect(() => {
    if (!lowStockProducts || !user?.id || settings?.low_stock_alert === false) return;

    lowStockProducts.forEach((product) => {
      // Only notify once per product per session
      if (!notifiedProducts.current.has(product.id)) {
        notifiedProducts.current.add(product.id);
        
        createNotification({
          title: "تنبيه نقص المخزون",
          message: `المنتج "${product.name}" وصل للحد الأدنى (${product.stock} من ${product.min_stock})`,
          type: "warning",
          link: "/inventory",
        });
      }
    });
  }, [lowStockProducts, user?.id, createNotification, settings?.low_stock_alert]);

  return { lowStockProducts };
};
