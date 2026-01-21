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
import { Plus, Search, Eye, Printer, Download, FileText, X, Loader2, ScanLine } from "lucide-react";
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
import BarcodeScanner from "@/components/scanner/BarcodeScanner";
import { useInvoices, Invoice } from "@/hooks/useInvoices";
import { useProducts } from "@/hooks/useProducts";
import { useCustomers } from "@/hooks/useCustomers";
import { toast } from "sonner";

interface NewInvoiceItem {
  name: string;
  qty: number;
  price: number;
}

const statusLabels: Record<string, string> = {
  paid: "مدفوعة",
  pending: "معلقة",
  overdue: "متأخرة",
};

const statusStyles: Record<string, string> = {
  paid: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  overdue: "bg-destructive/10 text-destructive",
};

const Invoices = () => {
  const { invoices, loading, addInvoice } = useInvoices();
  const { products } = useProducts();
  const { customers } = useCustomers();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    customer: "",
    customer_id: "",
    items: [] as NewInvoiceItem[],
    discount: 0,
  });
  const [newItem, setNewItem] = useState({ name: "", qty: 1, price: 0, product_id: "" });
  const printRef = useRef<HTMLDivElement>(null);

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.invoice_number.includes(searchTerm) ||
      invoice.customer_name.includes(searchTerm)
  );

  const handleAddItem = () => {
    if (newItem.name && newItem.qty > 0 && newItem.price > 0) {
      setNewInvoice({
        ...newInvoice,
        items: [...newInvoice.items, { name: newItem.name, qty: newItem.qty, price: newItem.price }],
      });
      setNewItem({ name: "", qty: 1, price: 0, product_id: "" });
    }
  };

  const handleRemoveItem = (index: number) => {
    setNewInvoice({
      ...newInvoice,
      items: newInvoice.items.filter((_, i) => i !== index),
    });
  };

  const handleProductSelect = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setNewItem({ ...newItem, name: product.name, price: product.price, product_id: product.id });
    }
  };

  const handleBarcodeScan = (code: string) => {
    // Try to find product by SKU or name
    const product = products.find((p) => p.sku === code || p.name === code || p.id === code);
    if (product) {
      // Add directly to items list with qty 1
      setNewInvoice({
        ...newInvoice,
        items: [...newInvoice.items, { name: product.name, qty: 1, price: product.price }],
      });
      toast.success(`تم إضافة: ${product.name}`);
    } else {
      toast.error(`لم يتم العثور على منتج بالكود: ${code}`);
    }
  };

  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    if (customer) {
      setNewInvoice({ ...newInvoice, customer: customer.name, customer_id: customer.id });
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

  const handleCreateInvoice = async () => {
    if (newInvoice.customer && newInvoice.items.length > 0) {
      await addInvoice({
        customer_id: newInvoice.customer_id || undefined,
        customer_name: newInvoice.customer,
        subtotal: calculateSubtotal(),
        discount: newInvoice.discount,
        tax: calculateTax(),
        total: calculateTotal(),
        items: newInvoice.items.map((item) => ({
          product_name: item.name,
          quantity: item.qty,
          unit_price: item.price,
          total: item.qty * item.price,
        })),
      });
      setNewInvoice({ customer: "", customer_id: "", items: [], discount: 0 });
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

  // Convert Invoice to format expected by InvoicePrint
  const convertToInvoicePrintFormat = (invoice: Invoice) => ({
    id: invoice.invoice_number,
    customer: invoice.customer_name,
    date: new Date(invoice.created_at).toLocaleDateString("ar-SA"),
    total: invoice.total,
    status: invoice.status,
    items: (invoice.items || []).map((item) => ({
      name: item.product_name,
      qty: item.quantity,
      price: item.unit_price,
    })),
    tax: invoice.tax,
    discount: invoice.discount,
  });

  if (loading) {
    return (
      <MainLayout title="إدارة الفواتير" subtitle="إنشاء وإدارة فواتير البيع">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="إدارة الفواتير" subtitle="إنشاء وإدارة فواتير البيع">
      {/* Barcode Scanner Modal */}
      {showScanner && (
        <BarcodeScanner
          onScan={handleBarcodeScan}
          onClose={() => setShowScanner(false)}
        />
      )}

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
              <InvoicePrint invoice={convertToInvoicePrintFormat(selectedInvoice)} />
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
                <Select onValueChange={handleCustomerSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر العميل" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Add Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>إضافة الأصناف</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowScanner(true)}
                    className="gap-2"
                  >
                    <ScanLine className="w-4 h-4" />
                    مسح باركود
                  </Button>
                </div>
                <div className="flex gap-3">
                  <Select onValueChange={handleProductSelect}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="اختر الصنف" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - {product.price} د.ل
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
                        <span>{item.price} د.ل</span>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{item.qty * item.price} د.ل</span>
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
                        <span>{calculateSubtotal().toLocaleString()} د.ل</span>
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
                        <span>الضريبة</span>
                        <span>{calculateTax().toLocaleString()} د.ل</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg pt-2 border-t">
                        <span>الإجمالي</span>
                        <span className="text-primary">{calculateTotal().toLocaleString()} د.ل</span>
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
            {filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  لا توجد فواتير. قم بإنشاء فاتورة جديدة.
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id} className="table-row-hover">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-medium">{invoice.invoice_number}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{invoice.customer_name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(invoice.created_at).toLocaleDateString("ar-SA")}
                  </TableCell>
                  <TableCell>{invoice.items?.length || 0} أصناف</TableCell>
                  <TableCell className="font-bold">{invoice.total.toLocaleString()} د.ل</TableCell>
                  <TableCell>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        statusStyles[invoice.status] || statusStyles.pending
                      }`}
                    >
                      {statusLabels[invoice.status] || "معلقة"}
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
              ))
            )}
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
