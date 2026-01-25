import { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Search,
  FileText,
  Printer,
  Trash2,
  Edit,
  MoreVertical,
  MessageCircle,
  Eye,
  FileSpreadsheet,
  Send,
} from "lucide-react";
import { useQuotations, Quotation, QuotationInput, QUOTATION_STATUSES } from "@/hooks/useQuotations";
import { useCustomers } from "@/hooks/useCustomers";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import QuotationForm from "@/components/quotations/QuotationForm";
import QuotationPrint from "@/components/quotations/QuotationPrint";
import { toast } from "sonner";

const Quotations = () => {
  const { quotations, loading, addQuotation, updateQuotation, deleteQuotation, getQuotationWithItems } = useQuotations();
  const { customers } = useCustomers();
  const { settings } = useCompanySettings();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
  const [viewingQuotation, setViewingQuotation] = useState<(Quotation & { items?: any[] }) | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  const filteredQuotations = quotations.filter(
    q =>
      q.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.quotation_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddQuotation = async (data: QuotationInput) => {
    const result = await addQuotation(data);
    if (result) {
      setIsFormOpen(false);
    }
  };

  const handleEditQuotation = async (data: QuotationInput) => {
    if (editingQuotation) {
      const result = await updateQuotation(editingQuotation.id, data);
      if (result) {
        setEditingQuotation(null);
        setIsFormOpen(false);
      }
    }
  };

  const handleDeleteQuotation = async () => {
    if (deleteId) {
      await deleteQuotation(deleteId);
      setDeleteId(null);
    }
  };

  const handleViewQuotation = async (id: string) => {
    const quotation = await getQuotationWithItems(id);
    if (quotation) {
      setViewingQuotation(quotation);
    }
  };

  const handlePrintQuotation = async (id: string) => {
    const quotation = await getQuotationWithItems(id);
    if (quotation) {
      setViewingQuotation(quotation);
      setTimeout(() => {
        handlePrint();
      }, 100);
    }
  };

  const handleSendWhatsApp = (quotation: Quotation) => {
    if (!quotation.customer_phone) {
      toast.error("لا يوجد رقم هاتف للعميل");
      return;
    }

    const phone = quotation.customer_phone.replace(/[^0-9]/g, "");
    const message = encodeURIComponent(
      `مرحباً ${quotation.customer_name}،\n\n` +
      `نرفق لكم عرض السعر رقم: ${quotation.quotation_number}\n` +
      `الإجمالي: ${quotation.total.toFixed(2)} د.ل\n\n` +
      `شركة المراقب لكاميرات المراقبة\n` +
      `${settings?.phone || ""}`
    );
    
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    await updateQuotation(id, { status });
  };

  const getStatusBadge = (status: string) => {
    const statusInfo = QUOTATION_STATUSES.find(s => s.value === status);
    return (
      <Badge className={`${statusInfo?.color || "bg-gray-500"} text-white`}>
        {statusInfo?.label || status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-LY", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Stats
  const totalQuotations = quotations.length;
  const draftCount = quotations.filter(q => q.status === "draft").length;
  const sentCount = quotations.filter(q => q.status === "sent").length;
  const acceptedCount = quotations.filter(q => q.status === "accepted").length;
  const totalValue = quotations.reduce((sum, q) => sum + q.total, 0);

  return (
    <MainLayout title="عروض الأسعار" subtitle="إنشاء وإدارة عروض أسعار أنظمة المراقبة">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-end">
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="ml-2 h-4 w-4" />
            عرض سعر جديد
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">إجمالي العروض</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalQuotations}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">مسودات</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-500">{draftCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">تم الإرسال</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-500">{sentCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">مقبولة</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-500">{acceptedCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">إجمالي القيمة</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalValue.toFixed(0)} د.ل</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث بالعميل أو رقم العرض..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم العرض</TableHead>
                  <TableHead>العميل</TableHead>
                  <TableHead>الكاميرات</TableHead>
                  <TableHead>الإجمالي</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead className="w-[100px]">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      جاري التحميل...
                    </TableCell>
                  </TableRow>
                ) : filteredQuotations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      لا توجد عروض أسعار
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredQuotations.map(quotation => (
                    <TableRow key={quotation.id}>
                      <TableCell className="font-medium">{quotation.quotation_number}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{quotation.customer_name}</p>
                          {quotation.customer_phone && (
                            <p className="text-xs text-muted-foreground">{quotation.customer_phone}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {quotation.camera_count} × {quotation.camera_type}
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold">{quotation.total.toFixed(2)} د.ل</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="cursor-pointer">
                              {getStatusBadge(quotation.status)}
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            {QUOTATION_STATUSES.map(status => (
                              <DropdownMenuItem
                                key={status.value}
                                onClick={() => handleUpdateStatus(quotation.id, status.value)}
                              >
                                <Badge className={`${status.color} text-white ml-2`}>
                                  {status.label}
                                </Badge>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(quotation.created_at)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewQuotation(quotation.id)}>
                              <Eye className="ml-2 h-4 w-4" />
                              عرض
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePrintQuotation(quotation.id)}>
                              <Printer className="ml-2 h-4 w-4" />
                              طباعة PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSendWhatsApp(quotation)}>
                              <MessageCircle className="ml-2 h-4 w-4" />
                              إرسال واتساب
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingQuotation(quotation);
                                setIsFormOpen(true);
                              }}
                            >
                              <Edit className="ml-2 h-4 w-4" />
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteId(quotation.id)}
                            >
                              <Trash2 className="ml-2 h-4 w-4" />
                              حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={open => {
        setIsFormOpen(open);
        if (!open) setEditingQuotation(null);
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingQuotation ? "تعديل عرض السعر" : "إنشاء عرض سعر جديد"}
            </DialogTitle>
          </DialogHeader>
          <QuotationForm
            customers={customers}
            onSubmit={editingQuotation ? handleEditQuotation : handleAddQuotation}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingQuotation(null);
            }}
            initialData={editingQuotation || undefined}
            isEditing={!!editingQuotation}
          />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewingQuotation} onOpenChange={open => !open && setViewingQuotation(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>عرض السعر - {viewingQuotation?.quotation_number}</DialogTitle>
          </DialogHeader>
          {viewingQuotation && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={() => handlePrint()}>
                  <Printer className="ml-2 h-4 w-4" />
                  طباعة
                </Button>
                <Button variant="outline" onClick={() => handleSendWhatsApp(viewingQuotation)}>
                  <MessageCircle className="ml-2 h-4 w-4" />
                  إرسال واتساب
                </Button>
              </div>
              <div className="border rounded-lg overflow-auto max-h-[60vh]">
                <QuotationPrint
                  ref={printRef}
                  quotation={viewingQuotation}
                  companySettings={settings}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف عرض السعر هذا؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteQuotation} className="bg-destructive text-destructive-foreground">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Hidden Print Component */}
      <div className="hidden">
        {viewingQuotation && (
          <QuotationPrint
            ref={printRef}
            quotation={viewingQuotation}
            companySettings={settings}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default Quotations;
