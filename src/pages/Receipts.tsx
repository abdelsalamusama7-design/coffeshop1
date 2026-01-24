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
import { Plus, Search, Printer, Download, Receipt, X, Eye, Loader2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import ReceiptPrint from "@/components/receipts/ReceiptPrint";
import { useReceipts, Receipt as ReceiptType } from "@/hooks/useReceipts";
import { useCustomers } from "@/hooks/useCustomers";
import { useInvoices } from "@/hooks/useInvoices";

const paymentMethods = ["نقدي", "تحويل بنكي", "شبكة مدى", "شيك"];

const Receipts = () => {
  const { receipts, loading, addReceipt } = useReceipts();
  const { customers } = useCustomers();
  const { invoices } = useInvoices();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptType | null>(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [newReceipt, setNewReceipt] = useState({
    customer: "",
    customer_id: "",
    amount: "",
    paymentMethod: "",
    invoiceRef: "",
    invoice_id: "",
    notes: "",
  });

  const filteredReceipts = receipts.filter(
    (receipt) =>
      receipt.receipt_number.includes(searchTerm) ||
      receipt.customer_name.includes(searchTerm)
  );

  const totalReceived = receipts.reduce((sum, r) => sum + r.amount, 0);

  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    if (customer) {
      setNewReceipt({ ...newReceipt, customer: customer.name, customer_id: customer.id });
    }
  };

  const handleInvoiceSelect = (invoiceId: string) => {
    const invoice = invoices.find((i) => i.id === invoiceId);
    if (invoice) {
      setNewReceipt({ 
        ...newReceipt, 
        invoiceRef: invoice.invoice_number, 
        invoice_id: invoice.id,
        amount: String(invoice.total),
        customer: invoice.customer_name,
        customer_id: invoice.customer_id || ""
      });
    }
  };

  const handleCreateReceipt = async () => {
    if (newReceipt.customer && newReceipt.amount && newReceipt.paymentMethod) {
      await addReceipt({
        customer_id: newReceipt.customer_id || undefined,
        customer_name: newReceipt.customer,
        invoice_id: newReceipt.invoice_id || undefined,
        invoice_number: newReceipt.invoiceRef || undefined,
        amount: Number(newReceipt.amount),
        payment_method: newReceipt.paymentMethod,
        notes: newReceipt.notes || undefined,
      });
      setNewReceipt({ customer: "", customer_id: "", amount: "", paymentMethod: "", invoiceRef: "", invoice_id: "", notes: "" });
      setIsDialogOpen(false);
    }
  };

  const handlePrint = (receipt: ReceiptType) => {
    setSelectedReceipt(receipt);
    setShowPrintPreview(true);
  };

  const handlePrintAction = () => {
    window.print();
  };

  // Convert Receipt to format expected by ReceiptPrint
  const convertToReceiptPrintFormat = (receipt: ReceiptType) => ({
    id: receipt.receipt_number,
    customer: receipt.customer_name,
    amount: receipt.amount,
    date: new Date(receipt.created_at).toLocaleDateString("ar-SA"),
    paymentMethod: receipt.payment_method,
    invoiceRef: receipt.invoice_number || undefined,
    notes: receipt.notes || undefined,
  });

  if (loading) {
    return (
      <MainLayout title="إيصالات القبض" subtitle="إدارة إيصالات القبض المالية">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="إيصالات القبض" subtitle="إدارة إيصالات القبض المالية">
      {/* Print Preview Modal */}
      {showPrintPreview && selectedReceipt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="font-bold text-lg">معاينة الإيصال</h3>
              <div className="flex items-center gap-2">
                <Button onClick={handlePrintAction} className="gradient-primary border-0">
                  <Printer className="w-4 h-4 ml-2" />
                  طباعة
                </Button>
                <Button onClick={handlePrintAction} variant="outline">
                  <Download className="w-4 h-4 ml-2" />
                  تحميل PDF
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setShowPrintPreview(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <ReceiptPrint receipt={convertToReceiptPrintFormat(selectedReceipt)} />
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl gradient-success flex items-center justify-center">
              <Receipt className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">إجمالي المقبوضات</p>
              <p className="text-2xl font-bold">{totalReceived.toLocaleString()} د.ل</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <span className="text-lg font-bold text-primary-foreground">#</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">عدد الإيصالات</p>
              <p className="text-2xl font-bold">{receipts.length}</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl gradient-warning flex items-center justify-center">
              <span className="text-lg font-bold text-primary-foreground">د.ل</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">إجمالي المستحقات</p>
              <p className="text-2xl font-bold">
                {customers.reduce((sum, c) => sum + c.balance, 0).toLocaleString()} د.ل
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative w-80">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="بحث عن إيصال..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0">
              <Plus className="w-4 h-4 ml-2" />
              إنشاء إيصال قبض
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>إنشاء إيصال قبض جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>العميل</Label>
                <Select onValueChange={handleCustomerSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر العميل" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        <div className="flex justify-between items-center w-full">
                          <span>{customer.name}</span>
                          {customer.balance > 0 && (
                            <span className="text-xs text-warning mr-2">
                              (مستحق: {customer.balance.toLocaleString()} د.ل)
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>ربط بفاتورة (اختياري)</Label>
                <Select onValueChange={handleInvoiceSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفاتورة" />
                  </SelectTrigger>
                  <SelectContent>
                    {invoices.filter(i => i.status !== "paid").map((invoice) => (
                      <SelectItem key={invoice.id} value={invoice.id}>
                        {invoice.invoice_number} - {invoice.customer_name} ({invoice.total.toLocaleString()} د.ل)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>المبلغ (د.ل)</Label>
                  <Input
                    type="number"
                    value={newReceipt.amount}
                    onChange={(e) =>
                      setNewReceipt({ ...newReceipt, amount: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>طريقة الدفع</Label>
                  <Select
                    value={newReceipt.paymentMethod}
                    onValueChange={(value) =>
                      setNewReceipt({ ...newReceipt, paymentMethod: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>ملاحظات (اختياري)</Label>
                <Textarea
                  value={newReceipt.notes}
                  onChange={(e) =>
                    setNewReceipt({ ...newReceipt, notes: e.target.value })
                  }
                  placeholder="أي ملاحظات إضافية..."
                  rows={2}
                />
              </div>

              <Button
                onClick={handleCreateReceipt}
                className="w-full gradient-primary border-0"
                disabled={!newReceipt.customer || !newReceipt.amount || !newReceipt.paymentMethod}
              >
                إنشاء الإيصال
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Receipts Table */}
      <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="table-header">
              <TableHead className="text-right">رقم الإيصال</TableHead>
              <TableHead className="text-right">العميل</TableHead>
              <TableHead className="text-right">التاريخ</TableHead>
              <TableHead className="text-right">المبلغ</TableHead>
              <TableHead className="text-right">طريقة الدفع</TableHead>
              <TableHead className="text-right">الفاتورة</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReceipts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  لا توجد إيصالات. قم بإنشاء إيصال جديد.
                </TableCell>
              </TableRow>
            ) : (
              filteredReceipts.map((receipt) => (
                <TableRow key={receipt.id} className="table-row-hover">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                        <Receipt className="w-5 h-5 text-success" />
                      </div>
                      <span className="font-medium">{receipt.receipt_number}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{receipt.customer_name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(receipt.created_at).toLocaleDateString("ar-SA")}
                  </TableCell>
                  <TableCell className="font-bold text-success">
                    +{receipt.amount.toLocaleString()} د.ل
                  </TableCell>
                  <TableCell>
                    <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                      {receipt.payment_method}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {receipt.invoice_number || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handlePrint(receipt)}
                      >
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handlePrint(receipt)}
                      >
                        <Printer className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handlePrint(receipt)}
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
    </MainLayout>
  );
};

export default Receipts;
