import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface QuotationItem {
  id: string;
  quotation_id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  total: number;
  created_at: string;
}

export interface Quotation {
  id: string;
  quotation_number: string;
  customer_id: string | null;
  customer_name: string;
  customer_phone: string | null;
  camera_count: number;
  camera_type: string;
  dvr_type: string;
  hard_disk: string;
  cable_length: number;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items?: QuotationItem[];
}

export interface QuotationInput {
  customer_id?: string;
  customer_name: string;
  customer_phone?: string;
  camera_count: number;
  camera_type: string;
  dvr_type: string;
  hard_disk: string;
  cable_length: number;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status?: string;
  notes?: string;
  items?: Omit<QuotationItem, 'id' | 'quotation_id' | 'created_at'>[];
}

// Camera types with prices
export const CAMERA_TYPES = [
  { value: "2MP Indoor", label: "كاميرا داخلية 2MP", price: 120 },
  { value: "2MP Outdoor", label: "كاميرا خارجية 2MP", price: 150 },
  { value: "5MP Indoor", label: "كاميرا داخلية 5MP", price: 180 },
  { value: "5MP Outdoor", label: "كاميرا خارجية 5MP", price: 220 },
  { value: "IP 2MP", label: "كاميرا IP 2MP", price: 250 },
  { value: "IP 4MP", label: "كاميرا IP 4MP", price: 320 },
  { value: "IP 8MP", label: "كاميرا IP 8MP", price: 450 },
];

export const DVR_TYPES = [
  { value: "DVR 4CH", label: "DVR 4 قنوات", price: 350 },
  { value: "DVR 8CH", label: "DVR 8 قنوات", price: 500 },
  { value: "DVR 16CH", label: "DVR 16 قناة", price: 750 },
  { value: "NVR 4CH", label: "NVR 4 قنوات", price: 450 },
  { value: "NVR 8CH", label: "NVR 8 قنوات", price: 650 },
  { value: "NVR 16CH", label: "NVR 16 قناة", price: 950 },
  { value: "NVR 32CH", label: "NVR 32 قناة", price: 1400 },
];

export const HARD_DISK_TYPES = [
  { value: "500GB", label: "500GB", price: 150 },
  { value: "1TB", label: "1TB", price: 220 },
  { value: "2TB", label: "2TB", price: 350 },
  { value: "4TB", label: "4TB", price: 550 },
  { value: "6TB", label: "6TB", price: 750 },
];

export const ACCESSORIES = [
  { name: "Power Supply", label: "محول كهرباء", price: 25 },
  { name: "BNC Connector", label: "موصل BNC", price: 5 },
  { name: "Power Cable", label: "سلك كهرباء (متر)", price: 3 },
  { name: "HDMI Cable", label: "كيبل HDMI", price: 35 },
  { name: "Monitor 19\"", label: "شاشة 19 بوصة", price: 450 },
  { name: "Monitor 22\"", label: "شاشة 22 بوصة", price: 550 },
  { name: "UPS", label: "UPS", price: 350 },
  { name: "Cabinet", label: "صندوق معدني", price: 120 },
  { name: "Installation", label: "أجرة التركيب", price: 200 },
];

export const QUOTATION_STATUSES = [
  { value: "draft", label: "مسودة", color: "bg-gray-500" },
  { value: "sent", label: "تم الإرسال", color: "bg-blue-500" },
  { value: "accepted", label: "مقبول", color: "bg-green-500" },
  { value: "rejected", label: "مرفوض", color: "bg-red-500" },
  { value: "converted", label: "تم التحويل لفاتورة", color: "bg-purple-500" },
];

export const useQuotations = () => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("quotations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setQuotations(data || []);
    } catch (error: any) {
      toast.error("خطأ في تحميل عروض الأسعار");
      console.error("Error fetching quotations:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateQuotationNumber = async (): Promise<string> => {
    const { data, error } = await supabase.rpc("generate_quotation_number");
    if (error) throw error;
    return data;
  };

  const addQuotation = async (quotation: QuotationInput) => {
    try {
      const quotationNumber = await generateQuotationNumber();
      
      const { items, ...quotationData } = quotation;
      
      const { data, error } = await supabase
        .from("quotations")
        .insert([{ ...quotationData, quotation_number: quotationNumber }])
        .select()
        .single();

      if (error) throw error;

      // Add items if any
      if (items && items.length > 0) {
        const itemsWithQuotationId = items.map(item => ({
          ...item,
          quotation_id: data.id,
        }));
        
        const { error: itemsError } = await supabase
          .from("quotation_items")
          .insert(itemsWithQuotationId);
          
        if (itemsError) throw itemsError;
      }

      setQuotations([data, ...quotations]);
      toast.success("تم إنشاء عرض السعر بنجاح");
      return data;
    } catch (error: any) {
      toast.error("خطأ في إنشاء عرض السعر");
      console.error("Error adding quotation:", error);
      return null;
    }
  };

  const updateQuotation = async (id: string, quotation: Partial<QuotationInput>) => {
    try {
      const { items, ...quotationData } = quotation;
      
      const { data, error } = await supabase
        .from("quotations")
        .update(quotationData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Update items if provided
      if (items) {
        // Delete existing items
        await supabase.from("quotation_items").delete().eq("quotation_id", id);
        
        // Add new items
        if (items.length > 0) {
          const itemsWithQuotationId = items.map(item => ({
            ...item,
            quotation_id: id,
          }));
          
          const { error: itemsError } = await supabase
            .from("quotation_items")
            .insert(itemsWithQuotationId);
            
          if (itemsError) throw itemsError;
        }
      }

      setQuotations(quotations.map((q) => (q.id === id ? data : q)));
      toast.success("تم تحديث عرض السعر بنجاح");
      return data;
    } catch (error: any) {
      toast.error("خطأ في تحديث عرض السعر");
      console.error("Error updating quotation:", error);
      return null;
    }
  };

  const deleteQuotation = async (id: string) => {
    try {
      const { error } = await supabase.from("quotations").delete().eq("id", id);
      if (error) throw error;
      setQuotations(quotations.filter((q) => q.id !== id));
      toast.success("تم حذف عرض السعر بنجاح");
      return true;
    } catch (error: any) {
      toast.error("خطأ في حذف عرض السعر");
      console.error("Error deleting quotation:", error);
      return false;
    }
  };

  const getQuotationWithItems = async (id: string): Promise<Quotation | null> => {
    try {
      const { data: quotation, error } = await supabase
        .from("quotations")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      const { data: items, error: itemsError } = await supabase
        .from("quotation_items")
        .select("*")
        .eq("quotation_id", id);

      if (itemsError) throw itemsError;

      return { ...quotation, items: items || [] };
    } catch (error: any) {
      toast.error("خطأ في تحميل عرض السعر");
      console.error("Error fetching quotation:", error);
      return null;
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  return {
    quotations,
    loading,
    fetchQuotations,
    addQuotation,
    updateQuotation,
    deleteQuotation,
    getQuotationWithItems,
    generateQuotationNumber,
  };
};
