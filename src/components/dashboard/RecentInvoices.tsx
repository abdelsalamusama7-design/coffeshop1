import { FileText, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

const invoices = [
  { id: "INV-001", customer: "محمد أحمد", amount: "٢,٥٠٠ د.ل", status: "مدفوعة", date: "٢٠٢٤/٠١/١٥" },
  { id: "INV-002", customer: "شركة الأمان", amount: "١٥,٠٠٠ د.ل", status: "معلقة", date: "٢٠٢٤/٠١/١٤" },
  { id: "INV-003", customer: "أحمد السعيد", amount: "٣,٢٠٠ د.ل", status: "مدفوعة", date: "٢٠٢٤/٠١/١٣" },
  { id: "INV-004", customer: "مؤسسة النور", amount: "٨,٧٠٠ د.ل", status: "متأخرة", date: "٢٠٢٤/٠١/١٢" },
  { id: "INV-005", customer: "خالد العمري", amount: "١,٨٠٠ د.ل", status: "مدفوعة", date: "٢٠٢٤/٠١/١١" },
];

const statusStyles = {
  مدفوعة: "bg-success/10 text-success",
  معلقة: "bg-warning/10 text-warning",
  متأخرة: "bg-destructive/10 text-destructive",
};

const RecentInvoices = () => {
  return (
    <div className="bg-card rounded-xl shadow-card border border-border/50 animate-fade-in">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">آخر الفواتير</h3>
            <p className="text-xs text-muted-foreground">آخر ٥ فواتير</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-primary">
          عرض الكل
        </Button>
      </div>

      <div className="divide-y divide-border">
        {invoices.map((invoice, index) => (
          <div
            key={invoice.id}
            className="p-4 flex items-center justify-between table-row-hover"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center gap-4">
              <div>
                <p className="font-medium text-foreground">{invoice.customer}</p>
                <p className="text-xs text-muted-foreground">{invoice.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-left">
                <p className="font-semibold text-foreground">{invoice.amount}</p>
                <p className="text-xs text-muted-foreground">{invoice.date}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  statusStyles[invoice.status as keyof typeof statusStyles]
                }`}
              >
                {invoice.status}
              </span>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentInvoices;
