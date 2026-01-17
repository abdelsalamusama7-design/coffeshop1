import { useState, useRef } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Eye, Printer, Download, FileText, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import InvoicePrint from "@/components/invoices/InvoicePrint";

interface InvoiceItem {
  name: string;
  qty: number;
  price: number;
}

interface Invoice {
  id: string;
  customer: string;
  date: string;
  total: number;
  status: "paid" | "pending" | "overdue";
  items: InvoiceItem[];
  tax: number;
  discount: number;
}

const initialInvoices: Invoice[] = [
  { id: "INV-2024-001", customer: "محمد أحمد", date: "2024-01-15", total: 2500, status: "paid", items: [{ name: "كاميرا Hikvision 4MP", qty: 2, price: 450 }, { name: "DVR 4 قنوات", qty: 1, price: 650 }, { name: "كابل RG59", qty: 3, price: 150 }], tax: 375, discount: 0 },
  { id: "INV-2024-002", customer: "شركة الأمان للحراسات", date: "2024-01-14", total: 15000, status: "pending", items: [{ name: "كاميرا Hikvision 8MP", qty: 10, price: 850 }, { name: "NVR 8 قنوات", qty: 2, price: 1200 }, { name: "هارد ديسك 2TB", qty: 4, price: 350 }], tax: 2250, discount: 500 },
  { id: "INV-2024-003", customer: "أحمد السعيد", date: "2024-01-13", total: 3200, status: "paid", items: [{ name: "DVR 8 قنوات", qty: 2, price: 950 }, { name: "محول طاقة 12V", qty: 10, price: 25 }], tax: 480, discount: 0 },
  { id: "INV-2024-004", customer: "مؤسسة النور التجارية", date: "2024-01-12", total: 8700, status: "overdue", items: [{ name: "كاميرا Hikvision 4MP", qty: 8, price: 450 }, { name: "DVR 16 قناة", qty: 2, price: 1450 }, { name: "كابل Cat6", qty: 5, price: 320 }], tax: 1305, discount: 200 },
  { id: "INV-2024-005", customer: "خالد العمري", date: "2024-01-11", total: 1800, status: "paid", items: [{ name: "كاميرا Hikvision 4MP", qty: 4, price: 450 }], tax: 270, discount: 0 },
];

const statusLabels = {
  paid: "مدفوعة",
  pending: "معلقة",
  overdue: "متأخرة",
};

const statusStyles = {
  paid: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  overdue: "bg-destructive/10 text-destructive",
};

const customers = [
  "محمد أحمد",
  "شركة الأمان للحراسات",
  "أحمد السعيد",
  "مؤسسة النور التجارية",
  "خالد العمري",
];

const products = [
  { name: "كاميرا Hikvision 4MP Dome", price: 450 },
  { name: "كاميرا Hikvision 8MP Bullet", price: 850 },
  { name: "DVR 4 قنوات", price: 650 },
  { name: "DVR 8 قنوات", price: 950 },
  { name: "DVR 16 قناة", price: 1450 },
  { name: "NVR 8 قنوات PoE", price: 1200 },
  { name: "كابل RG59 - 305م", price: 280 },
  { name: "كابل Cat6 - 305م", price: 320 },
  { name: "محول طاقة 12V 2A", price: 25 },
  { name: "هارد ديسك 2TB", price: 350 },
];

const Invoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    customer: "",
    items: [] as InvoiceItem[],
    discount: 0,
  });
  const [newItem, setNewItem] = useState({ name: "", qty: 1, price: 0 });
  const printRef = useRef<HTMLDivElement>(null);

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.id.includes(searchTerm) ||
      invoice.customer.includes(searchTerm)
  );

  const handleAddItem = () => {
    if (newItem.name && newItem.qty > 0 && newItem.price > 0) {
      setNewInvoice({
        ...newInvoice,
        items: [...newInvoice.items, newItem],
      });
      setNewItem({ name: "", qty: 1, price: 0 });
    }
  };

  const handleRemoveItem = (index: number) => {
    setNewInvoice({
      ...newInvoice,
      items: newInvoice.items.filter((_, i) => i !== index),
    });
  };

  const handleProductSelect = (productName: string) => {
    const product = products.find((p) => p.name === productName);
    if (product) {
      setNewItem({ ...newItem, name: product.name, price: product.price });
    }
  };

  const calculateSubtotal = () => {
    return newInvoice.items.reduce((sum, item) => sum + item.qty * item.price, 0);
  };

  const calculateTax = () => {
    return (calculateSubtotal() - newInvoice.discount) * 0.15;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - newInvoice.discount + calculateTax();
  };

  const handleCreateInvoice = () => {
    if (newInvoice.customer && newInvoice.items.length > 0) {
      const invoice: Invoice = {
        id: `INV-2024-${String(invoices.length + 1).padStart(3, "0")}`,
        customer: newInvoice.customer,
        date: new Date().toISOString().split("T")[0],
        total: calculateTotal(),
        status: "pending",
        items: newInvoice.items,
        tax: calculateTax(),
        discount: newInvoice.discount,
      };
      setInvoices([invoice, ...invoices]);
      setNewInvoice({ customer: "", items: [], discount: 0 });
      setIsDialogOpen(false);
    }
  };

  const handlePrint = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowPrintPreview(true);
  };

  const handlePrintAction = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <MainLayout title="إدارة الفواتير" subtitle="إنشاء وإدارة فواتير البيع">
      {/* Print Preview Modal */}
      {showPrintPreview && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="font-bold text-lg">معاينة الفاتورة</h3>
              <div className="flex items-center gap-2">
                <Button onClick={handlePrintAction} className="gradient-primary border-0">
                  <Printer className="w-4 h-4 ml-2" />
                  طباعة
                </Button>
                <Button onClick={handleDownloadPDF} variant="outline">
                  <Download className="w-4 h-4 ml-2" />
                  تحميل PDF
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setShowPrintPreview(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <div ref={printRef}>
              <InvoicePrint invoice={selectedInvoice} />
            </div>
          </div>
        </div>
      )}

      {/* Actions Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative w-80">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="بحث عن فاتورة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0">
              <Plus className="w-4 h-4 ml-2" />
              إنشاء فاتورة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>إنشاء فاتورة جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              {/* Customer Selection */}
              <div className="space-y-2">
                <Label>اختر العميل</Label>
                <Select
                  value={newInvoice.customer}
                  onValueChange={(value) =>
                    setNewInvoice({ ...newInvoice, customer: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر العميل" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer} value={customer}>
                        {customer}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Add Items */}
              <div className="space-y-4">
                <Label>إضافة الأصناف</Label>
                <div className="flex gap-3">
                  <Select onValueChange={handleProductSelect}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="اختر الصنف" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.name} value={product.name}>
                          {product.name} - {product.price} ر.س
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="الكمية"
                    value={newItem.qty}
                    onChange={(e) =>
                      setNewItem({ ...newItem, qty: Number(e.target.value) })
                    }
                    className="w-24"
                    min={1}
                  />
                  <Input
                    type="number"
                    placeholder="السعر"
                    value={newItem.price || ""}
                    onChange={(e) =>
                      setNewItem({ ...newItem, price: Number(e.target.value) })
                    }
                    className="w-32"
                  />
                  <Button type="button" onClick={handleAddItem} variant="secondary">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Items List */}
                {newInvoice.items.length > 0 && (
                  <div className="border rounded-lg divide-y">
                    <div className="p-3 bg-muted/30 grid grid-cols-5 gap-4 text-sm font-semibold">
                      <span className="col-span-2">الصنف</span>
                      <span>الكمية</span>
                      <span>السعر</span>
                      <span>الإجمالي</span>
                    </div>
                    {newInvoice.items.map((item, index) => (
                      <div key={index} className="p-3 grid grid-cols-5 gap-4 items-center text-sm">
                        <span className="col-span-2 font-medium">{item.name}</span>
                        <span>{item.qty}</span>
                        <span>{item.price} ر.س</span>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{item.qty * item.price} ر.س</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <X className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {/* Totals */}
                    <div className="p-3 bg-muted/20 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>المجموع الفرعي</span>
                        <span>{calculateSubtotal().toLocaleString()} ر.س</span>
                      </div>
                      <div className="flex justify-between text-sm items-center">
                        <span>الخصم</span>
                        <Input
                          type="number"
                          value={newInvoice.discount || ""}
                          onChange={(e) =>
                            setNewInvoice({ ...newInvoice, discount: Number(e.target.value) })
                          }
                          className="w-32 h-8"
                          placeholder="0"
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>ضريبة القيمة المضافة (15%)</span>
                        <span>{calculateTax().toLocaleString()} ر.س</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg pt-2 border-t">
                        <span>الإجمالي</span>
                        <span className="text-primary">{calculateTotal().toLocaleString()} ر.س</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Button
                onClick={handleCreateInvoice}
                className="w-full gradient-primary border-0"
                disabled={!newInvoice.customer || newInvoice.items.length === 0}
              >
                إنشاء الفاتورة
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Invoices Table */}
      <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="table-header">
              <TableHead className="text-right">رقم الفاتورة</TableHead>
              <TableHead className="text-right">العميل</TableHead>
              <TableHead className="text-right">التاريخ</TableHead>
              <TableHead className="text-right">عدد الأصناف</TableHead>
              <TableHead className="text-right">الإجمالي</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.map((invoice) => (
              <TableRow key={invoice.id} className="table-row-hover">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-medium">{invoice.id}</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{invoice.customer}</TableCell>
                <TableCell className="text-muted-foreground">{invoice.date}</TableCell>
                <TableCell>{invoice.items.length} أصناف</TableCell>
                <TableCell className="font-bold">{invoice.total.toLocaleString()} ر.س</TableCell>
                <TableCell>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      statusStyles[invoice.status]
                    }`}
                  >
                    {statusLabels[invoice.status]}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handlePrint(invoice)}
                    >
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handlePrint(invoice)}
                    >
                      <Printer className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handlePrint(invoice)}
                    >
                      <Download className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-content, .print-content * {
            visibility: visible;
          }
          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </MainLayout>
  );
};

export default Invoices;
