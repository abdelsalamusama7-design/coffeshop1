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
import { Plus, Search, Edit, Trash2, Phone, Mail, User, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCustomers, Customer, CustomerInput, CustomerStatus, CUSTOMER_STATUSES } from "@/hooks/useCustomers";
import CustomerStatusBadge from "@/components/customers/CustomerStatusBadge";

const Customers = () => {
  const { customers, loading, addCustomer, updateCustomer, deleteCustomer } = useCustomers();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
    status: "جديد" as CustomerStatus,
  });

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.includes(searchTerm) ||
      (customer.phone && customer.phone.includes(searchTerm)) ||
      (customer.email && customer.email.includes(searchTerm));
    
    const matchesStatus = statusFilter === "all" || customer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleAddCustomer = async () => {
    if (newCustomer.name) {
      const customerData: CustomerInput = {
        name: newCustomer.name,
        phone: newCustomer.phone || undefined,
        email: newCustomer.email || undefined,
        address: newCustomer.address || undefined,
        notes: newCustomer.notes || undefined,
        status: newCustomer.status,
      };

      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, customerData);
      } else {
        await addCustomer(customerData);
      }

      setNewCustomer({ name: "", phone: "", email: "", address: "", notes: "", status: "جديد" });
      setEditingCustomer(null);
      setIsDialogOpen(false);
    }
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setNewCustomer({
      name: customer.name,
      phone: customer.phone || "",
      email: customer.email || "",
      address: customer.address || "",
      notes: customer.notes || "",
      status: customer.status,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteCustomer = async (id: string) => {
    await deleteCustomer(id);
  };

  const handleStatusChange = async (customerId: string, newStatus: CustomerStatus) => {
    await updateCustomer(customerId, { status: newStatus });
  };

  const totalBalance = customers.reduce((sum, c) => sum + c.balance, 0);

  // Count customers by status
  const statusCounts = CUSTOMER_STATUSES.reduce((acc, status) => {
    acc[status.value] = customers.filter(c => c.status === status.value).length;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <MainLayout title="إدارة العملاء" subtitle="عرض وإدارة بيانات العملاء">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="إدارة العملاء" subtitle="عرض وإدارة بيانات العملاء">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <User className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">إجمالي العملاء</p>
              <p className="text-2xl font-bold">{customers.length}</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl gradient-warning flex items-center justify-center">
              <span className="text-xl font-bold text-primary-foreground">د.ل</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">إجمالي المستحقات</p>
              <p className="text-2xl font-bold">{totalBalance.toLocaleString()} د.ل</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl gradient-success flex items-center justify-center">
              <span className="text-xl font-bold text-primary-foreground">✓</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">تم التركيب</p>
              <p className="text-2xl font-bold">{statusCounts['تم التركيب'] || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Filter Chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            statusFilter === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          الكل ({customers.length})
        </button>
        {CUSTOMER_STATUSES.map((status) => (
          <button
            key={status.value}
            onClick={() => setStatusFilter(status.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              statusFilter === status.value
                ? `${status.color} text-white`
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {status.label} ({statusCounts[status.value] || 0})
          </button>
        ))}
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative w-80">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="بحث عن عميل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingCustomer(null);
            setNewCustomer({ name: "", phone: "", email: "", address: "", notes: "", status: "جديد" });
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0">
              <Plus className="w-4 h-4 ml-2" />
              إضافة عميل جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingCustomer ? "تعديل العميل" : "إضافة عميل جديد"}</DialogTitle>
              <DialogDescription>
                {editingCustomer ? "قم بتعديل بيانات العميل" : "أدخل بيانات العميل الجديد"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>اسم العميل</Label>
                <Input
                  value={newCustomer.name}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, name: e.target.value })
                  }
                  placeholder="أدخل اسم العميل"
                />
              </div>
              <div className="space-y-2">
                <Label>حالة العميل</Label>
                <Select
                  value={newCustomer.status}
                  onValueChange={(value: CustomerStatus) =>
                    setNewCustomer({ ...newCustomer, status: value })
                  }
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="اختر الحالة" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border shadow-lg z-50">
                    {CUSTOMER_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${status.color}`} />
                          {status.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>رقم الهاتف</Label>
                <Input
                  value={newCustomer.phone}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, phone: e.target.value })
                  }
                  placeholder="09xxxxxxxx"
                />
              </div>
              <div className="space-y-2">
                <Label>البريد الإلكتروني</Label>
                <Input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, email: e.target.value })
                  }
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>العنوان</Label>
                <Input
                  value={newCustomer.address}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, address: e.target.value })
                  }
                  placeholder="أدخل العنوان"
                />
              </div>
              <div className="space-y-2">
                <Label>ملاحظات</Label>
                <Textarea
                  value={newCustomer.notes}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, notes: e.target.value })
                  }
                  placeholder="ملاحظات إضافية..."
                  rows={2}
                />
              </div>
              <Button onClick={handleAddCustomer} className="w-full gradient-primary border-0">
                {editingCustomer ? "حفظ التعديلات" : "إضافة العميل"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Customers Table */}
      <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="table-header">
              <TableHead className="text-right">العميل</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">رقم الهاتف</TableHead>
              <TableHead className="text-right">البريد الإلكتروني</TableHead>
              <TableHead className="text-right">العنوان</TableHead>
              <TableHead className="text-right">الرصيد المستحق</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  لا يوجد عملاء. قم بإضافة عميل جديد.
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow key={customer.id} className="table-row-hover">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-medium">{customer.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <CustomerStatusBadge
                      status={customer.status}
                      onStatusChange={(newStatus) => handleStatusChange(customer.id, newStatus)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{customer.phone || "-"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span>{customer.email || "-"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {customer.address || "-"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`font-bold ${
                        customer.balance > 0 ? "text-warning" : "text-success"
                      }`}
                    >
                      {customer.balance.toLocaleString()} د.ل
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleEditCustomer(customer)}
                      >
                        <Edit className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDeleteCustomer(customer.id)}
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
    </MainLayout>
  );
};

export default Customers;
