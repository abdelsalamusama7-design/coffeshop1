import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Share2, MessageCircle, Mail } from "lucide-react";
import { toast } from "sonner";

interface ShareData {
  title: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  documentNumber: string;
  amount?: number;
  date: string;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  notes?: string;
}

interface ShareButtonsProps {
  data: ShareData;
  type: "invoice" | "receipt" | "quotation" | "report";
}

const formatCurrency = (amount: number) => {
  return `${amount.toLocaleString()} ج.م`;
};

const generateWhatsAppMessage = (data: ShareData, type: string): string => {
  let message = "";
  
  switch (type) {
    case "invoice":
      message = `📄 *فاتورة رقم: ${data.documentNumber}*\n`;
      message += `👤 العميل: ${data.customerName}\n`;
      message += `📅 التاريخ: ${data.date}\n`;
      if (data.items && data.items.length > 0) {
        message += `\n📦 *المنتجات:*\n`;
        data.items.forEach((item, index) => {
          message += `${index + 1}. ${item.name} × ${item.quantity} = ${formatCurrency(item.total)}\n`;
        });
      }
      if (data.amount !== undefined) {
        message += `\n💰 *المجموع: ${formatCurrency(data.amount)}*`;
      }
      break;
      
    case "receipt":
      message = `🧾 *إيصال قبض رقم: ${data.documentNumber}*\n`;
      message += `👤 العميل: ${data.customerName}\n`;
      message += `📅 التاريخ: ${data.date}\n`;
      if (data.amount !== undefined) {
        message += `💰 *المبلغ: ${formatCurrency(data.amount)}*`;
      }
      break;
      
    case "quotation":
      message = `📋 *عرض سعر رقم: ${data.documentNumber}*\n`;
      message += `👤 العميل: ${data.customerName}\n`;
      message += `📅 التاريخ: ${data.date}\n`;
      if (data.items && data.items.length > 0) {
        message += `\n📦 *البنود:*\n`;
        data.items.forEach((item, index) => {
          message += `${index + 1}. ${item.name} × ${item.quantity} = ${formatCurrency(item.total)}\n`;
        });
      }
      if (data.amount !== undefined) {
        message += `\n💰 *المجموع: ${formatCurrency(data.amount)}*`;
      }
      break;
      
    case "report":
      message = `📊 *${data.title}*\n`;
      message += `📅 التاريخ: ${data.date}\n`;
      if (data.amount !== undefined) {
        message += `💰 *الإجمالي: ${formatCurrency(data.amount)}*`;
      }
      break;
  }
  
  if (data.notes) {
    message += `\n\n📝 ملاحظات: ${data.notes}`;
  }
  
  message += `\n\n---\nشركة العميد الاردني`;
  
  return message;
};

const generateEmailSubject = (data: ShareData, type: string): string => {
  switch (type) {
    case "invoice":
      return `فاتورة رقم ${data.documentNumber} - ${data.customerName}`;
    case "receipt":
      return `إيصال قبض رقم ${data.documentNumber} - ${data.customerName}`;
    case "quotation":
      return `عرض سعر رقم ${data.documentNumber} - ${data.customerName}`;
    case "report":
      return `${data.title} - ${data.date}`;
    default:
      return data.title;
  }
};

const generateEmailBody = (data: ShareData, type: string): string => {
  let body = "";
  
  switch (type) {
    case "invoice":
      body = `فاتورة رقم: ${data.documentNumber}\n`;
      body += `العميل: ${data.customerName}\n`;
      body += `التاريخ: ${data.date}\n`;
      if (data.items && data.items.length > 0) {
        body += `\nالمنتجات:\n`;
        data.items.forEach((item, index) => {
          body += `${index + 1}. ${item.name} × ${item.quantity} = ${formatCurrency(item.total)}\n`;
        });
      }
      if (data.amount !== undefined) {
        body += `\nالمجموع: ${formatCurrency(data.amount)}`;
      }
      break;
      
    case "receipt":
      body = `إيصال قبض رقم: ${data.documentNumber}\n`;
      body += `العميل: ${data.customerName}\n`;
      body += `التاريخ: ${data.date}\n`;
      if (data.amount !== undefined) {
        body += `المبلغ: ${formatCurrency(data.amount)}`;
      }
      break;
      
    case "quotation":
      body = `عرض سعر رقم: ${data.documentNumber}\n`;
      body += `العميل: ${data.customerName}\n`;
      body += `التاريخ: ${data.date}\n`;
      if (data.items && data.items.length > 0) {
        body += `\nالبنود:\n`;
        data.items.forEach((item, index) => {
          body += `${index + 1}. ${item.name} × ${item.quantity} = ${formatCurrency(item.total)}\n`;
        });
      }
      if (data.amount !== undefined) {
        body += `\nالمجموع: ${formatCurrency(data.amount)}`;
      }
      break;
      
    case "report":
      body = `${data.title}\n`;
      body += `التاريخ: ${data.date}\n`;
      if (data.amount !== undefined) {
        body += `الإجمالي: ${formatCurrency(data.amount)}`;
      }
      break;
  }
  
  if (data.notes) {
    body += `\n\nملاحظات: ${data.notes}`;
  }
  
  body += `\n\n---\nشركة العميد الاردني`;
  
  return body;
};

export const ShareButtons = ({ data, type }: ShareButtonsProps) => {
  const handleWhatsAppShare = () => {
    const message = generateWhatsAppMessage(data, type);
    const encodedMessage = encodeURIComponent(message);
    
    // If customer has phone, send directly to them
    if (data.customerPhone) {
      // Clean phone number - remove spaces and ensure it starts with country code
      let phone = data.customerPhone.replace(/\s+/g, "").replace(/^0/, "20");
      if (!phone.startsWith("+") && !phone.startsWith("20")) {
        phone = "20" + phone;
      }
      window.open(`https://wa.me/${phone}?text=${encodedMessage}`, "_blank");
    } else {
      // Open WhatsApp without specific number
      window.open(`https://wa.me/?text=${encodedMessage}`, "_blank");
    }
    
    toast.success("تم فتح واتساب للمشاركة");
  };

  const handleEmailShare = () => {
    const subject = generateEmailSubject(data, type);
    const body = generateEmailBody(data, type);
    
    const mailtoLink = `mailto:${data.customerEmail || ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    
    toast.success("تم فتح البريد الإلكتروني للمشاركة");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="w-4 h-4 ml-2" />
          مشاركة
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleWhatsAppShare} className="cursor-pointer">
          <MessageCircle className="w-4 h-4 ml-2 text-success" />
          واتساب
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEmailShare} className="cursor-pointer">
          <Mail className="w-4 h-4 ml-2 text-primary" />
          بريد إلكتروني
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareButtons;
