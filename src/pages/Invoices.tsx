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
import { Plus, Search, Eye, Printer, Download, FileText, X, Loader2, ScanLine, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import ShareButtons from "@/components/shared/ShareButtons";
import { useInvoices, Invoice } from "@/hooks/useInvoices";
import { useProducts } from "@/hooks/useProducts";
import { useCustomers } from "@/hooks/useCustomers";
import { useCompanySettings } from "@/hooks/useCompanySettings";
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
  const { invoices, loading, addInvoice, updateInvoice, deleteInvoice } = useInvoices();
  const { products } = useProducts();
  const { customers } = useCustomers();
  const { settings: companySettings } = useCompanySettings();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
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
    const product = products.find((p) => p.sku === code || p.name === code || p.id === code);
    if (product) {
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

  // Calculate discount amount from percentage (can be positive or negative)
  const calculateDiscountAmount = () => {
    const subtotal = calculateSubtotal();
    return (subtotal * newInvoice.discount) / 100;
  };

  const calculateTax = () => {
    return (calculateSubtotal() - calculateDiscountAmount()) * 0.15;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscountAmount() + calculateTax();
  };

  const resetForm = () => {
    setNewInvoice({ customer: "", customer_id: "", items: [], discount: 0 });
    setNewItem({ name: "", qty: 1, price: 0, product_id: "" });
    setEditingInvoice(null);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setNewInvoice({
      customer: invoice.customer_name,
      customer_id: invoice.customer_id || "",
      items: (invoice.items || []).map((item) => ({
        name: item.product_name,
        qty: item.quantity,
        price: item.unit_price,
      })),
      discount: invoice.discount,
    });
    setIsDialogOpen(true);
  };

  const handleCreateOrUpdateInvoice = async () => {
    if (newInvoice.customer && newInvoice.items.length > 0) {
      const invoiceData = {
        customer_id: newInvoice.customer_id || undefined,
        customer_name: newInvoice.customer,
        subtotal: calculateSubtotal(),
        discount: calculateDiscountAmount(), // Store actual discount amount
        tax: calculateTax(),
        total: calculateTotal(),
        items: newInvoice.items.map((item) => ({
          product_name: item.name,
          quantity: item.qty,
          unit_price: item.price,
          total: item.qty * item.price,
        })),
      };

      if (editingInvoice) {
        await updateInvoice(editingInvoice.id, invoiceData);
      } else {
        await addInvoice(invoiceData);
      }
      
      resetForm();
      setIsDialogOpen(false);
    }
  };

  const handleDeleteClick = (invoiceId: string) => {
    setInvoiceToDelete(invoiceId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (invoiceToDelete) {
      await deleteInvoice(invoiceToDelete);
      setInvoiceToDelete(null);
    }
    setDeleteDialogOpen(false);
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
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف الفاتورة؟</AlertDialogTitle>
            <AlertDialogDescription>
              لا يمكن التراجع عن هذا الإجراء. سيتم حذف الفاتورة وجميع بنودها نهائياً.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
              <InvoicePrint invoice={convertToInvoicePrintFormat(selectedInvoice)} companySettings={companySettings} />
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

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0">
              <Plus className="w-4 h-4 ml-2" />
              إنشاء فاتورة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>{editingInvoice ? "تعديل الفاتورة" : "إنشاء فاتورة جديدة"}</DialogTitle>
              <DialogDescription>
                {editingInvoice ? `تعديل الفاتورة رقم ${editingInvoice.invoice_number}` : "أدخل بيانات الفاتورة الجديدة"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              {/* Customer Selection */}
              <div className="space-y-2">
                <Label>اختر العميل</Label>
                <Select 
                  value={newInvoice.customer_id} 
                  onValueChange={handleCustomerSelect}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="اختر العميل" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border shadow-lg z-50">
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
                    <SelectTrigger className="flex-1 bg-background">
                      <SelectValue placeholder="اختر الصنف" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border shadow-lg z-50">
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - {product.price} ج.م
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
                        <span>{item.price} ج.م</span>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{item.qty * item.price} ج.م</span>
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
                        <span>{calculateSubtotal().toLocaleString()} ج.م</span>
                      </div>
                      <div className="flex justify-between text-sm items-center">
                        <span>خصم الصكوك (%)</span>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={newInvoice.discount || ""}
                            onChange={(e) =>
                              setNewInvoice({ ...newInvoice, discount: Number(e.target.value) })
                            }
                            className="w-24 h-8"
                            placeholder="0"
                            step="0.1"
                          />
                          <span className="text-muted-foreground text-xs w-24 text-left">
                            {calculateDiscountAmount() >= 0 ? "-" : "+"}{Math.abs(calculateDiscountAmount()).toLocaleString()} ج.م
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        (قيمة موجبة = خصم، قيمة سالبة = زيادة)
                      </p>
                      <div className="flex justify-between text-sm">
                        <span>الضريبة</span>
                        <span>{calculateTax().toLocaleString()} ج.م</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg pt-2 border-t">
                        <span>الإجمالي</span>
                        <span className="text-primary">{calculateTotal().toLocaleString()} ج.م</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Button
                onClick={handleCreateOrUpdateInvoice}
                className="w-full gradient-primary border-0"
                disabled={!newInvoice.customer || newInvoice.items.length === 0}
              >
                {editingInvoice ? "حفظ التعديلات" : "إنشاء الفاتورة"}
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
                  <TableCell className="font-bold">{invoice.total.toLocaleString()} ج.م</TableCell>
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
                        title="معاينة"
                      >
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleEditInvoice(invoice)}
                        title="تعديل"
                      >
                        <Edit className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handlePrint(invoice)}
                        title="طباعة"
                      >
                        <Printer className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <ShareButtons
                        type="invoice"
                        data={{
                          title: "فاتورة",
                          customerName: invoice.customer_name,
                          customerPhone: customers.find(c => c.id === invoice.customer_id)?.phone,
                          customerEmail: customers.find(c => c.id === invoice.customer_id)?.email || undefined,
                          documentNumber: invoice.invoice_number,
                          amount: invoice.total,
                          date: new Date(invoice.created_at).toLocaleDateString("ar-SA"),
                          items: (invoice.items || []).map(item => ({
                            name: item.product_name,
                            quantity: item.quantity,
                            price: item.unit_price,
                            total: item.total,
                          })),
                          notes: invoice.notes || undefined,
                        }}
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleDeleteClick(invoice.id)}
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
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
