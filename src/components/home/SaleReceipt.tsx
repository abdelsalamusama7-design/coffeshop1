import { useRef } from "react";
import { Printer, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useReactToPrint } from "react-to-print";
import { useCompanySettings } from "@/hooks/useCompanySettings";

interface CartItem {
  product: {
    id: string;
    name: string;
    price: number;
    cost: number;
    unit: string;
  };
  quantity: number;
}

interface SaleReceiptProps {
  items: CartItem[];
  total: number;
  workerName: string;
  onClose: () => void;
}

const SaleReceipt = ({ items, total, workerName, onClose }: SaleReceiptProps) => {
  const printRef = useRef<HTMLDivElement>(null);
  const { settings } = useCompanySettings();

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `إيصال-بيع-${new Date().toLocaleDateString("ar-EG")}`,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ar-EG", {
      style: "currency",
      currency: "EGP",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="space-y-4">
      {/* Printable Receipt */}
      <div ref={printRef} className="bg-white p-6 space-y-4 print:p-4">
        {/* Header */}
        <div className="text-center space-y-1">
          <h2 className="font-bold text-xl">{settings?.company_name || "شركة العميد الاردني"}</h2>
          {settings?.phone && <p className="text-sm text-muted-foreground">{settings.phone}</p>}
          {settings?.address && <p className="text-sm text-muted-foreground">{settings.address}</p>}
        </div>

        <Separator />

        {/* Date & Worker */}
        <div className="text-sm space-y-1">
          <p>
            <span className="text-muted-foreground">التاريخ:</span>{" "}
            {formatDate(new Date())}
          </p>
          <p>
            <span className="text-muted-foreground">البائع:</span> {workerName}
          </p>
        </div>

        <Separator />

        {/* Items */}
        <div className="space-y-2">
          <h3 className="font-bold text-sm">المنتجات:</h3>
          {items.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span>
                {item.product.name} × {item.quantity}
              </span>
              <span>{formatCurrency(item.product.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <Separator />

        {/* Total */}
        <div className="flex justify-between font-bold text-lg">
          <span>الإجمالي:</span>
          <span>{formatCurrency(total)}</span>
        </div>

        <Separator />

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground space-y-1">
          <p>شكراً لزيارتكم</p>
          <p>نتمنى لكم يوماً سعيداً</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={() => handlePrint()} variant="outline" className="flex-1 gap-2">
          <Printer className="w-4 h-4" />
          طباعة
        </Button>
        <Button onClick={onClose} className="flex-1 gap-2">
          <Check className="w-4 h-4" />
          تم
        </Button>
      </div>
    </div>
  );
};

export default SaleReceipt;
