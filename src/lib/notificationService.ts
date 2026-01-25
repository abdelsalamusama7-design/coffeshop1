import { supabase } from "@/integrations/supabase/client";

interface NotificationData {
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
  link?: string;
}

export const createSystemNotification = async (
  userId: string,
  notification: NotificationData
) => {
  try {
    const { error } = await supabase.from("notifications").insert({
      user_id: userId,
      title: notification.title,
      message: notification.message,
      type: notification.type || "info",
      link: notification.link,
    });

    if (error) {
      console.error("Error creating notification:", error);
    }
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};

// Notification templates
export const notifyInvoiceCreated = (userId: string, invoiceNumber: string, customerName: string, total: number) => {
  return createSystemNotification(userId, {
    title: "فاتورة جديدة",
    message: `تم إنشاء الفاتورة ${invoiceNumber} للعميل ${customerName} بمبلغ ${total.toLocaleString()} د.ل`,
    type: "success",
    link: "/invoices",
  });
};

export const notifyReceiptCreated = (userId: string, receiptNumber: string, customerName: string, amount: number) => {
  return createSystemNotification(userId, {
    title: "إيصال قبض جديد",
    message: `تم إنشاء الإيصال ${receiptNumber} من ${customerName} بمبلغ ${amount.toLocaleString()} د.ل`,
    type: "success",
    link: "/receipts",
  });
};

export const notifyProductAdded = (userId: string, productName: string) => {
  return createSystemNotification(userId, {
    title: "منتج جديد",
    message: `تم إضافة المنتج "${productName}" إلى المخزون`,
    type: "info",
    link: "/inventory",
  });
};

export const notifyProductUpdated = (userId: string, productName: string) => {
  return createSystemNotification(userId, {
    title: "تحديث منتج",
    message: `تم تحديث بيانات المنتج "${productName}"`,
    type: "info",
    link: "/inventory",
  });
};

export const notifyLowStock = (userId: string, productName: string, currentStock: number, minStock: number) => {
  return createSystemNotification(userId, {
    title: "تنبيه نقص المخزون",
    message: `المنتج "${productName}" وصل للحد الأدنى (${currentStock} من ${minStock})`,
    type: "warning",
    link: "/inventory",
  });
};

export const notifyCustomerAdded = (userId: string, customerName: string) => {
  return createSystemNotification(userId, {
    title: "عميل جديد",
    message: `تم إضافة العميل "${customerName}"`,
    type: "info",
    link: "/customers",
  });
};
