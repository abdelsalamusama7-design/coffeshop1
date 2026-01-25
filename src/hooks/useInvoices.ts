import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { notifyInvoiceCreated } from "@/lib/notificationService";

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string | null;
  customer_name: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items?: InvoiceItem[];
}

export interface InvoiceInput {
  customer_id?: string;
  customer_name: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status?: string;
  notes?: string;
  items: {
    product_id?: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total: number;
  }[];
}

export const useInvoices = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const { data: invoicesData, error: invoicesError } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false });

      if (invoicesError) throw invoicesError;

      // Fetch items for each invoice
      const invoicesWithItems = await Promise.all(
        (invoicesData || []).map(async (invoice) => {
          const { data: items } = await supabase
            .from("invoice_items")
            .select("*")
            .eq("invoice_id", invoice.id);
          return { ...invoice, items: items || [] };
        })
      );

      setInvoices(invoicesWithItems);
    } catch (error: any) {
      toast.error("خطأ في تحميل الفواتير");
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateInvoiceNumber = async (): Promise<string> => {
    const { data, error } = await supabase.rpc("generate_invoice_number");
    if (error) {
      // Fallback if function fails
      const now = new Date();
      const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      return `INV-${yearMonth}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`;
    }
    return data;
  };

  const addInvoice = async (input: InvoiceInput) => {
    try {
      const invoiceNumber = await generateInvoiceNumber();

      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert([
          {
            invoice_number: invoiceNumber,
            customer_id: input.customer_id,
            customer_name: input.customer_name,
            subtotal: input.subtotal,
            discount: input.discount,
            tax: input.tax,
            total: input.total,
            status: input.status || "pending",
            notes: input.notes,
          },
        ])
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create invoice items
      const itemsToInsert = input.items.map((item) => ({
        invoice_id: invoice.id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.total,
      }));

      const { data: items, error: itemsError } = await supabase
        .from("invoice_items")
        .insert(itemsToInsert)
        .select();

      if (itemsError) throw itemsError;

      const newInvoice = { ...invoice, items: items || [] };
      setInvoices([newInvoice, ...invoices]);
      toast.success("تم إنشاء الفاتورة بنجاح");
      
      // Send notification
      if (user?.id) {
        notifyInvoiceCreated(user.id, invoice.invoice_number, input.customer_name, input.total);
      }
      
      return newInvoice;
    } catch (error: any) {
      toast.error("خطأ في إنشاء الفاتورة");
      console.error("Error adding invoice:", error);
      return null;
    }
  };

  const updateInvoiceStatus = async (id: string, status: string) => {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      setInvoices(invoices.map((inv) => (inv.id === id ? { ...inv, status } : inv)));
      toast.success("تم تحديث حالة الفاتورة");
      return data;
    } catch (error: any) {
      toast.error("خطأ في تحديث الفاتورة");
      console.error("Error updating invoice:", error);
      return null;
    }
  };

  const updateInvoice = async (id: string, input: InvoiceInput) => {
    try {
      // Update invoice details
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .update({
          customer_id: input.customer_id,
          customer_name: input.customer_name,
          subtotal: input.subtotal,
          discount: input.discount,
          tax: input.tax,
          total: input.total,
          status: input.status || "pending",
          notes: input.notes,
        })
        .eq("id", id)
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Delete existing items
      const { error: deleteError } = await supabase
        .from("invoice_items")
        .delete()
        .eq("invoice_id", id);

      if (deleteError) throw deleteError;

      // Insert new items
      const itemsToInsert = input.items.map((item) => ({
        invoice_id: id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.total,
      }));

      const { data: items, error: itemsError } = await supabase
        .from("invoice_items")
        .insert(itemsToInsert)
        .select();

      if (itemsError) throw itemsError;

      const updatedInvoice = { ...invoice, items: items || [] };
      setInvoices(invoices.map((inv) => (inv.id === id ? updatedInvoice : inv)));
      toast.success("تم تحديث الفاتورة بنجاح");
      return updatedInvoice;
    } catch (error: any) {
      toast.error("خطأ في تحديث الفاتورة");
      console.error("Error updating invoice:", error);
      return null;
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      const { error } = await supabase.from("invoices").delete().eq("id", id);

      if (error) throw error;
      setInvoices(invoices.filter((inv) => inv.id !== id));
      toast.success("تم حذف الفاتورة بنجاح");
      return true;
    } catch (error: any) {
      toast.error("خطأ في حذف الفاتورة");
      console.error("Error deleting invoice:", error);
      return false;
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return {
    invoices,
    loading,
    fetchInvoices,
    addInvoice,
    updateInvoice,
    updateInvoiceStatus,
    deleteInvoice,
  };
};
