import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  balance: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerInput {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  balance?: number;
  notes?: string;
}

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error: any) {
      toast.error("خطأ في تحميل العملاء");
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const addCustomer = async (customer: CustomerInput) => {
    try {
      const { data, error } = await supabase
        .from("customers")
        .insert([customer])
        .select()
        .single();

      if (error) throw error;
      setCustomers([data, ...customers]);
      toast.success("تم إضافة العميل بنجاح");
      return data;
    } catch (error: any) {
      toast.error("خطأ في إضافة العميل");
      console.error("Error adding customer:", error);
      return null;
    }
  };

  const updateCustomer = async (id: string, customer: Partial<CustomerInput>) => {
    try {
      const { data, error } = await supabase
        .from("customers")
        .update(customer)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      setCustomers(customers.map((c) => (c.id === id ? data : c)));
      toast.success("تم تحديث العميل بنجاح");
      return data;
    } catch (error: any) {
      toast.error("خطأ في تحديث العميل");
      console.error("Error updating customer:", error);
      return null;
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      const { error } = await supabase.from("customers").delete().eq("id", id);

      if (error) throw error;
      setCustomers(customers.filter((c) => c.id !== id));
      toast.success("تم حذف العميل بنجاح");
      return true;
    } catch (error: any) {
      toast.error("خطأ في حذف العميل");
      console.error("Error deleting customer:", error);
      return false;
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return {
    customers,
    loading,
    fetchCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
  };
};
