import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useBackupSchedule } from "./useBackupSchedule";

interface BackupData {
  version: string;
  created_at: string;
  products: any[];
  customers: any[];
  invoices: any[];
  invoice_items: any[];
  receipts: any[];
}

export const useBackup = () => {
  const { toast } = useToast();
  const { logBackup, updateLastBackup } = useBackupSchedule();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const exportBackup = async () => {
    setIsExporting(true);
    try {
      // Fetch all data from tables
      const [products, customers, invoices, invoiceItems, receipts] = await Promise.all([
        supabase.from("products").select("*"),
        supabase.from("customers").select("*"),
        supabase.from("invoices").select("*"),
        supabase.from("invoice_items").select("*"),
        supabase.from("receipts").select("*"),
      ]);

      if (products.error) throw products.error;
      if (customers.error) throw customers.error;
      if (invoices.error) throw invoices.error;
      if (invoiceItems.error) throw invoiceItems.error;
      if (receipts.error) throw receipts.error;

      const backupData: BackupData = {
        version: "1.0",
        created_at: new Date().toISOString(),
        products: products.data || [],
        customers: customers.data || [],
        invoices: invoices.data || [],
        invoice_items: invoiceItems.data || [],
        receipts: receipts.data || [],
      };

      // Create and download the backup file
      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const date = new Date().toISOString().split("T")[0];
      link.download = `backup-almuraqib-${date}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      const recordsCount = {
        products: products.data?.length || 0,
        customers: customers.data?.length || 0,
        invoices: invoices.data?.length || 0,
        receipts: receipts.data?.length || 0,
      };

      // Log successful backup
      await logBackup("success", "manual", recordsCount, blob.size);
      await updateLastBackup();

      toast({
        title: "تم التصدير بنجاح",
        description: `تم تصدير ${recordsCount.products} منتج، ${recordsCount.customers} عميل، ${recordsCount.invoices} فاتورة، ${recordsCount.receipts} إيصال`,
      });
    } catch (error) {
      console.error("Export error:", error);
      await logBackup("failed", "manual", undefined, undefined, error instanceof Error ? error.message : "Unknown error");
      toast({
        title: "خطأ في التصدير",
        description: "فشل في تصدير البيانات",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const importBackup = async (file: File): Promise<boolean> => {
    setIsImporting(true);
    try {
      const text = await file.text();
      const backupData: BackupData = JSON.parse(text);

      // Validate backup structure
      if (!backupData.version || !backupData.created_at) {
        throw new Error("ملف النسخة الاحتياطية غير صالح");
      }

      let importedProducts = 0;
      let importedCustomers = 0;
      let importedInvoices = 0;
      let importedReceipts = 0;

      // Import customers first (they may be referenced by invoices)
      if (backupData.customers && backupData.customers.length > 0) {
        for (const customer of backupData.customers) {
          const { id, created_at, updated_at, ...customerData } = customer;
          const { error } = await supabase
            .from("customers")
            .upsert({ ...customerData, id }, { onConflict: "id" });
          if (!error) importedCustomers++;
        }
      }

      // Import products
      if (backupData.products && backupData.products.length > 0) {
        for (const product of backupData.products) {
          const { id, created_at, updated_at, ...productData } = product;
          const { error } = await supabase
            .from("products")
            .upsert({ ...productData, id }, { onConflict: "id" });
          if (!error) importedProducts++;
        }
      }

      // Import invoices
      if (backupData.invoices && backupData.invoices.length > 0) {
        for (const invoice of backupData.invoices) {
          const { id, created_at, updated_at, ...invoiceData } = invoice;
          const { error } = await supabase
            .from("invoices")
            .upsert({ ...invoiceData, id }, { onConflict: "id" });
          if (!error) importedInvoices++;
        }
      }

      // Import invoice items
      if (backupData.invoice_items && backupData.invoice_items.length > 0) {
        for (const item of backupData.invoice_items) {
          const { id, created_at, ...itemData } = item;
          await supabase
            .from("invoice_items")
            .upsert({ ...itemData, id }, { onConflict: "id" });
        }
      }

      // Import receipts
      if (backupData.receipts && backupData.receipts.length > 0) {
        for (const receipt of backupData.receipts) {
          const { id, created_at, ...receiptData } = receipt;
          const { error } = await supabase
            .from("receipts")
            .upsert({ ...receiptData, id }, { onConflict: "id" });
          if (!error) importedReceipts++;
        }
      }

      toast({
        title: "تم الاستيراد بنجاح",
        description: `تم استيراد ${importedProducts} منتج، ${importedCustomers} عميل، ${importedInvoices} فاتورة، ${importedReceipts} إيصال`,
      });

      return true;
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "خطأ في الاستيراد",
        description: error instanceof Error ? error.message : "فشل في استيراد البيانات",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsImporting(false);
    }
  };

  return {
    exportBackup,
    importBackup,
    isExporting,
    isImporting,
  };
};
