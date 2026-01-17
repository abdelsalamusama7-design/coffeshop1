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
import { Plus, Search, Edit, Trash2, Phone, Mail, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const initialCustomers = [
  { id: 1, name: "محمد أحمد", phone: "0501234567", email: "mohamed@example.com", balance: 2500, invoices: 12 },
  { id: 2, name: "شركة الأمان للحراسات", phone: "0559876543", email: "info@alaman.com", balance: 0, invoices: 28 },
  { id: 3, name: "أحمد السعيد", phone: "0541112233", email: "ahmed@example.com", balance: 3200, invoices: 8 },
  { id: 4, name: "مؤسسة النور التجارية", phone: "0567778899", email: "sales@alnoor.com", balance: 8700, invoices: 15 },
  { id: 5, name: "خالد العمري", phone: "0532223344", email: "khaled@example.com", balance: 0, invoices: 5 },
  { id: 6, name: "شركة البناء الحديث", phone: "0544445566", email: "info@hadith.com", balance: 22500, invoices: 35 },
  { id: 7, name: "عبدالله الشمري", phone: "0556667788", email: "abdullah@example.com", balance: 0, invoices: 10 },
  { id: 8, name: "مستشفى الرعاية", phone: "0512345678", email: "procurement@hospital.com", balance: 0, invoices: 42 },
];

const Customers = () => {
  const [customers, setCustomers] = useState(initialCustomers);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.includes(searchTerm) ||
      customer.phone.includes(searchTerm) ||
      customer.email.includes(searchTerm)
  );

  const handleAddCustomer = () => {
    if (newCustomer.name && newCustomer.phone) {
      setCustomers([
        ...customers,
        {
          id: customers.length + 1,
          name: newCustomer.name,
          phone: newCustomer.phone,
          email: newCustomer.email,
          balance: 0,
          invoices: 0,
        },
      ]);
      setNewCustomer({ name: "", phone: "", email: "" });
      setIsDialogOpen(false);
    }
  };

  const handleDeleteCustomer = (id: number) => {
    setCustomers(customers.filter((c) => c.id !== id));
  };

  const totalBalance = customers.reduce((sum, c) => sum + c.balance, 0);

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

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0">
              <Plus className="w-4 h-4 ml-2" />
              إضافة عميل جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>إضافة عميل جديد</DialogTitle>
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
              <Button onClick={handleAddCustomer} className="w-full gradient-primary border-0">
                إضافة العميل
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
              <TableHead className="text-right">عدد الفواتير</TableHead>
              <TableHead className="text-right">الرصيد المستحق</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((customer) => (
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
                    <span>{customer.phone}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>{customer.email}</span>
                  </div>
                </TableCell>
                <TableCell>{customer.invoices} فاتورة</TableCell>
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
                    <Button variant="ghost" size="icon" className="h-8 w-8">
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
            ))}
          </TableBody>
        </Table>
      </div>
    </MainLayout>
  );
};

export default Customers;
