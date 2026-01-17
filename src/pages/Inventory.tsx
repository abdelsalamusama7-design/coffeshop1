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
import { Plus, Search, Edit, Trash2, Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const initialProducts = [
  { id: 1, name: "كاميرا Hikvision 4MP Dome", sku: "CAM-001", price: 450, stock: 25, category: "كاميرات" },
  { id: 2, name: "كاميرا Hikvision 8MP Bullet", sku: "CAM-002", price: 850, stock: 15, category: "كاميرات" },
  { id: 3, name: "DVR 4 قنوات", sku: "DVR-001", price: 650, stock: 20, category: "أجهزة تسجيل" },
  { id: 4, name: "DVR 8 قنوات", sku: "DVR-002", price: 950, stock: 12, category: "أجهزة تسجيل" },
  { id: 5, name: "DVR 16 قناة", sku: "DVR-003", price: 1450, stock: 8, category: "أجهزة تسجيل" },
  { id: 6, name: "NVR 8 قنوات PoE", sku: "NVR-001", price: 1200, stock: 10, category: "أجهزة تسجيل" },
  { id: 7, name: "كابل RG59 - 305م", sku: "CAB-001", price: 280, stock: 30, category: "كابلات" },
  { id: 8, name: "كابل Cat6 - 305م", sku: "CAB-002", price: 320, stock: 25, category: "كابلات" },
  { id: 9, name: "محول طاقة 12V 2A", sku: "POW-001", price: 25, stock: 100, category: "ملحقات" },
  { id: 10, name: "هارد ديسك 2TB", sku: "HDD-001", price: 350, stock: 18, category: "تخزين" },
];

const Inventory = () => {
  const [products, setProducts] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    price: "",
    stock: "",
    category: "",
  });

  const filteredProducts = products.filter(
    (product) =>
      product.name.includes(searchTerm) ||
      product.sku.includes(searchTerm) ||
      product.category.includes(searchTerm)
  );

  const handleAddProduct = () => {
    if (newProduct.name && newProduct.sku) {
      setProducts([
        ...products,
        {
          id: products.length + 1,
          name: newProduct.name,
          sku: newProduct.sku,
          price: Number(newProduct.price) || 0,
          stock: Number(newProduct.stock) || 0,
          category: newProduct.category,
        },
      ]);
      setNewProduct({ name: "", sku: "", price: "", stock: "", category: "" });
      setIsDialogOpen(false);
    }
  };

  const handleDeleteProduct = (id: number) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  return (
    <MainLayout title="إدارة المخزون" subtitle="عرض وإدارة جميع الأصناف">
      {/* Actions Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative w-80">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="بحث عن صنف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0">
              <Plus className="w-4 h-4 ml-2" />
              إضافة صنف جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>إضافة صنف جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>اسم الصنف</Label>
                <Input
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  placeholder="أدخل اسم الصنف"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>رمز الصنف (SKU)</Label>
                  <Input
                    value={newProduct.sku}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, sku: e.target.value })
                    }
                    placeholder="CAM-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label>التصنيف</Label>
                  <Input
                    value={newProduct.category}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, category: e.target.value })
                    }
                    placeholder="كاميرات"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>السعر (ر.س)</Label>
                  <Input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, price: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>الكمية</Label>
                  <Input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, stock: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>
              </div>
              <Button onClick={handleAddProduct} className="w-full gradient-primary border-0">
                إضافة الصنف
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Products Table */}
      <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="table-header">
              <TableHead className="text-right">الصنف</TableHead>
              <TableHead className="text-right">رمز الصنف</TableHead>
              <TableHead className="text-right">التصنيف</TableHead>
              <TableHead className="text-right">السعر</TableHead>
              <TableHead className="text-right">المخزون</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id} className="table-row-hover">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-medium">{product.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                <TableCell>
                  <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                    {product.category}
                  </span>
                </TableCell>
                <TableCell className="font-semibold">{product.price.toLocaleString()} ر.س</TableCell>
                <TableCell>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      product.stock < 10
                        ? "bg-destructive/10 text-destructive"
                        : product.stock < 20
                        ? "bg-warning/10 text-warning"
                        : "bg-success/10 text-success"
                    }`}
                  >
                    {product.stock} وحدة
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
                      onClick={() => handleDeleteProduct(product.id)}
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

export default Inventory;
