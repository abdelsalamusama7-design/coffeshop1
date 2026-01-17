import { useState } from "react";
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
import { Plus, Search, Eye, Printer, Download, FileText } from "lucide-react";
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

const initialInvoices = [
  { id: "INV-2024-001", customer: "محمد أحمد", date: "2024-01-15", total: 2500, status: "paid", items: 3 },
  { id: "INV-2024-002", customer: "شركة الأمان للحراسات", date: "2024-01-14", total: 15000, status: "pending", items: 8 },
  { id: "INV-2024-003", customer: "أحمد السعيد", date: "2024-01-13", total: 3200, status: "paid", items: 4 },
  { id: "INV-2024-004", customer: "مؤسسة النور التجارية", date: "2024-01-12", total: 8700, status: "overdue", items: 6 },
  { id: "INV-2024-005", customer: "خالد العمري", date: "2024-01-11", total: 1800, status: "paid", items: 2 },
  { id: "INV-2024-006", customer: "شركة البناء الحديث", date: "2024-01-10", total: 22500, status: "pending", items: 12 },
  { id: "INV-2024-007", customer: "عبدالله الشمري", date: "2024-01-09", total: 4500, status: "paid", items: 5 },
  { id: "INV-2024-008", customer: "مستشفى الرعاية", date: "2024-01-08", total: 35000, status: "paid", items: 20 },
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

const Invoices = () => {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    customer: "",
    items: [] as { name: string; qty: number; price: number }[],
  });
  const [newItem, setNewItem] = useState({ name: "", qty: 1, price: 0 });

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

  const calculateTotal = () => {
    return newInvoice.items.reduce((sum, item) => sum + item.qty * item.price, 0);
  };

  const handleCreateInvoice = () => {
    if (newInvoice.customer && newInvoice.items.length > 0) {
      const invoice = {
        id: `INV-2024-${String(invoices.length + 1).padStart(3, "0")}`,
        customer: newInvoice.customer,
        date: new Date().toISOString().split("T")[0],
        total: calculateTotal(),
        status: "pending" as const,
        items: newInvoice.items.length,
      };
      setInvoices([invoice, ...invoices]);
      setNewInvoice({ customer: "", items: [] });
      setIsDialogOpen(false);
    }
  };

  return (
    <MainLayout title="إدارة الفواتير" subtitle="إنشاء وإدارة فواتير البيع">
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
          <DialogContent className="sm:max-w-2xl">
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
                  <Input
                    placeholder="اسم الصنف"
                    value={newItem.name}
                    onChange={(e) =>
                      setNewItem({ ...newItem, name: e.target.value })
                    }
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="الكمية"
                    value={newItem.qty}
                    onChange={(e) =>
                      setNewItem({ ...newItem, qty: Number(e.target.value) })
                    }
                    className="w-24"
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
                    {newInvoice.items.map((item, index) => (
                      <div key={index} className="p-3 flex items-center justify-between">
                        <span className="font-medium">{item.name}</span>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{item.qty} x</span>
                          <span>{item.price} ر.س</span>
                          <span className="font-semibold text-foreground">
                            = {item.qty * item.price} ر.س
                          </span>
                        </div>
                      </div>
                    ))}
                    <div className="p-3 bg-muted/50 flex items-center justify-between">
                      <span className="font-bold">الإجمالي</span>
                      <span className="font-bold text-lg text-primary">
                        {calculateTotal().toLocaleString()} ر.س
                      </span>
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
                <TableCell>{invoice.items} أصناف</TableCell>
                <TableCell className="font-bold">{invoice.total.toLocaleString()} ر.س</TableCell>
                <TableCell>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      statusStyles[invoice.status as keyof typeof statusStyles]
                    }`}
                  >
                    {statusLabels[invoice.status as keyof typeof statusLabels]}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Printer className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </MainLayout>
  );
};

export default Invoices;
