import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Receipt {
  id: string;
  receipt_number: string;
  customer_id: string | null;
  customer_name: string;
  invoice_id: string | null;
  invoice_number: string | null;
  amount: number;
  payment_method: string;
  notes: string | null;
  created_at: string;
}

export interface ReceiptInput {
  customer_id?: string;
  customer_name: string;
  invoice_id?: string;
  invoice_number?: string;
  amount: number;
  payment_method: string;
  notes?: string;
}

export const useReceipts = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("receipts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReceipts(data || []);
    } catch (error: any) {
      toast.error("خطأ في تحميل الإيصالات");
      console.error("Error fetching receipts:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateReceiptNumber = async (): Promise<string> => {
    const { data, error } = await supabase.rpc("generate_receipt_number");
    if (error) {
      // Fallback if function fails
      const now = new Date();
      const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      return `RCP-${yearMonth}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`;
    }
    return data;
  };

  const addReceipt = async (input: ReceiptInput) => {
    try {
      const receiptNumber = await generateReceiptNumber();

      const { data, error } = await supabase
        .from("receipts")
        .insert([
          {
            receipt_number: receiptNumber,
            customer_id: input.customer_id,
            customer_name: input.customer_name,
            invoice_id: input.invoice_id,
            invoice_number: input.invoice_number,
            amount: input.amount,
            payment_method: input.payment_method,
            notes: input.notes,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      setReceipts([data, ...receipts]);
      toast.success("تم إنشاء الإيصال بنجاح");
      return data;
    } catch (error: any) {
      toast.error("خطأ في إنشاء الإيصال");
      console.error("Error adding receipt:", error);
      return null;
    }
  };

  const deleteReceipt = async (id: string) => {
    try {
      const { error } = await supabase.from("receipts").delete().eq("id", id);

      if (error) throw error;
      setReceipts(receipts.filter((r) => r.id !== id));
      toast.success("تم حذف الإيصال بنجاح");
      return true;
    } catch (error: any) {
      toast.error("خطأ في حذف الإيصال");
      console.error("Error deleting receipt:", error);
      return false;
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  return {
    receipts,
    loading,
    fetchReceipts,
    addReceipt,
    deleteReceipt,
  };
};
