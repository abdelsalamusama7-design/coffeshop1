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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCustomers, Customer, CustomerInput } from "@/hooks/useCustomers";

const Customers = () => {
  const { customers, loading, addCustomer, updateCustomer, deleteCustomer } = useCustomers();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.includes(searchTerm) ||
      (customer.phone && customer.phone.includes(searchTerm)) ||
      (customer.email && customer.email.includes(searchTerm))
  );

  const handleAddCustomer = async () => {
    if (newCustomer.name) {
      const customerData: CustomerInput = {
        name: newCustomer.name,
        phone: newCustomer.phone || undefined,
        email: newCustomer.email || undefined,
        address: newCustomer.address || undefined,
        notes: newCustomer.notes || undefined,
      };

      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, customerData);
      } else {
        await addCustomer(customerData);
      }

      setNewCustomer({ name: "", phone: "", email: "", address: "", notes: "" });
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
    });
    setIsDialogOpen(true);
  };

  const handleDeleteCustomer = async (id: string) => {
    await deleteCustomer(id);
  };

  const totalBalance = customers.reduce((sum, c) => sum + c.balance, 0);

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
              <span className="text-xl font-bold text-primary-foreground">ر.س</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">إجمالي المستحقات</p>
              <p className="text-2xl font-bold">{totalBalance.toLocaleString()} ر.س</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl gradient-success flex items-center justify-center">
              <span className="text-xl font-bold text-primary-foreground">%</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">عملاء بدون مستحقات</p>
              <p className="text-2xl font-bold">
                {customers.filter((c) => c.balance === 0).length}
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
            setNewCustomer({ name: "", phone: "", email: "", address: "", notes: "" });
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
                <Label>رقم الهاتف</Label>
                <Input
                  value={newCustomer.phone}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, phone: e.target.value })
                  }
                  placeholder="05xxxxxxxx"
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
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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
                      {customer.balance.toLocaleString()} ر.س
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
