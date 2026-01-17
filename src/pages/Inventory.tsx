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
import { Plus, Search, Edit, Trash2, Package, BarChart3, AlertTriangle, Download } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  category: string;
}

const initialProducts: Product[] = [
  { id: 1, name: "كاميرا Hikvision 4MP Dome", sku: "CAM-001", price: 450, cost: 320, stock: 25, minStock: 10, category: "كاميرات" },
  { id: 2, name: "كاميرا Hikvision 8MP Bullet", sku: "CAM-002", price: 850, cost: 620, stock: 15, minStock: 5, category: "كاميرات" },
  { id: 3, name: "DVR 4 قنوات", sku: "DVR-001", price: 650, cost: 480, stock: 20, minStock: 5, category: "أجهزة تسجيل" },
  { id: 4, name: "DVR 8 قنوات", sku: "DVR-002", price: 950, cost: 720, stock: 12, minStock: 5, category: "أجهزة تسجيل" },
  { id: 5, name: "DVR 16 قناة", sku: "DVR-003", price: 1450, cost: 1100, stock: 3, minStock: 5, category: "أجهزة تسجيل" },
  { id: 6, name: "NVR 8 قنوات PoE", sku: "NVR-001", price: 1200, cost: 900, stock: 10, minStock: 5, category: "أجهزة تسجيل" },
  { id: 7, name: "كابل RG59 - 305م", sku: "CAB-001", price: 280, cost: 200, stock: 5, minStock: 15, category: "كابلات" },
  { id: 8, name: "كابل Cat6 - 305م", sku: "CAB-002", price: 320, cost: 240, stock: 25, minStock: 10, category: "كابلات" },
  { id: 9, name: "محول طاقة 12V 2A", sku: "POW-001", price: 25, cost: 15, stock: 8, minStock: 20, category: "ملحقات" },
  { id: 10, name: "هارد ديسك 2TB", sku: "HDD-001", price: 350, cost: 280, stock: 18, minStock: 10, category: "تخزين" },
];

const categories = ["كاميرات", "أجهزة تسجيل", "كابلات", "ملحقات", "تخزين"];

const Inventory = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    price: "",
    cost: "",
    stock: "",
    minStock: "",
    category: "",
  });

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.includes(searchTerm) ||
      product.sku.includes(searchTerm) ||
      product.category.includes(searchTerm);
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const lowStockProducts = products.filter((p) => p.stock <= p.minStock);
  const totalValue = products.reduce((sum, p) => sum + p.stock * p.cost, 0);
  const totalItems = products.reduce((sum, p) => sum + p.stock, 0);

  const handleAddProduct = () => {
    if (newProduct.name && newProduct.sku) {
      const product: Product = {
        id: editingProduct?.id || products.length + 1,
        name: newProduct.name,
        sku: newProduct.sku,
        price: Number(newProduct.price) || 0,
        cost: Number(newProduct.cost) || 0,
        stock: Number(newProduct.stock) || 0,
        minStock: Number(newProduct.minStock) || 0,
        category: newProduct.category,
      };

      if (editingProduct) {
        setProducts(products.map((p) => (p.id === editingProduct.id ? product : p)));
      } else {
        setProducts([...products, product]);
      }

      setNewProduct({ name: "", sku: "", price: "", cost: "", stock: "", minStock: "", category: "" });
      setEditingProduct(null);
      setIsDialogOpen(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      sku: product.sku,
      price: String(product.price),
      cost: String(product.cost),
      stock: String(product.stock),
      minStock: String(product.minStock),
      category: product.category,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteProduct = (id: number) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const handleExportInventory = () => {
    const csvContent = [
      ["رمز الصنف", "اسم الصنف", "التصنيف", "سعر البيع", "التكلفة", "الكمية", "الحد الأدنى", "قيمة المخزون"],
      ...products.map((p) => [
        p.sku,
        p.name,
        p.category,
        p.price,
        p.cost,
        p.stock,
        p.minStock,
        p.stock * p.cost,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `جرد_المخزون_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  return (
    <MainLayout title="إدارة المخزون" subtitle="عرض وإدارة جميع الأصناف والجرد">
      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="bg-card border">
          <TabsTrigger value="products" className="gap-2">
            <Package className="w-4 h-4" />
            الأصناف
          </TabsTrigger>
          <TabsTrigger value="inventory" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            الجرد
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            التنبيهات
            {lowStockProducts.length > 0 && (
              <span className="bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full">
                {lowStockProducts.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          {/* Actions Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative w-80">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="بحث عن صنف..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="التصنيف" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع التصنيفات</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setEditingProduct(null);
                setNewProduct({ name: "", sku: "", price: "", cost: "", stock: "", minStock: "", category: "" });
              }
            }}>
              <DialogTrigger asChild>
                <Button className="gradient-primary border-0">
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة صنف جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>{editingProduct ? "تعديل الصنف" : "إضافة صنف جديد"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>اسم الصنف</Label>
                    <Input
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      placeholder="أدخل اسم الصنف"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>رمز الصنف (SKU)</Label>
                      <Input
                        value={newProduct.sku}
                        onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                        placeholder="CAM-001"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>التصنيف</Label>
                      <Select
                        value={newProduct.category}
                        onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>سعر البيع (ر.س)</Label>
                      <Input
                        type="number"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>التكلفة (ر.س)</Label>
                      <Input
                        type="number"
                        value={newProduct.cost}
                        onChange={(e) => setNewProduct({ ...newProduct, cost: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>الكمية المتوفرة</Label>
                      <Input
                        type="number"
                        value={newProduct.stock}
                        onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>الحد الأدنى للتنبيه</Label>
                      <Input
                        type="number"
                        value={newProduct.minStock}
                        onChange={(e) => setNewProduct({ ...newProduct, minStock: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddProduct} className="w-full gradient-primary border-0">
                    {editingProduct ? "حفظ التعديلات" : "إضافة الصنف"}
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
                  <TableHead className="text-right">سعر البيع</TableHead>
                  <TableHead className="text-right">التكلفة</TableHead>
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
                    <TableCell className="text-muted-foreground">{product.cost.toLocaleString()} ر.س</TableCell>
                    <TableCell>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          product.stock <= product.minStock
                            ? "bg-destructive/10 text-destructive"
                            : product.stock <= product.minStock * 2
                            ? "bg-warning/10 text-warning"
                            : "bg-success/10 text-success"
                        }`}
                      >
                        {product.stock} وحدة
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditProduct(product)}
                        >
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
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="stat-card">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                  <Package className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">عدد الأصناف</p>
                  <p className="text-2xl font-bold">{products.length}</p>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl gradient-success flex items-center justify-center">
                  <span className="text-lg font-bold text-primary-foreground">#</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي الوحدات</p>
                  <p className="text-2xl font-bold">{totalItems.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl gradient-warning flex items-center justify-center">
                  <span className="text-lg font-bold text-primary-foreground">ر.س</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">قيمة المخزون</p>
                  <p className="text-2xl font-bold">{totalValue.toLocaleString()} ر.س</p>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl gradient-danger flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">أصناف منخفضة</p>
                  <p className="text-2xl font-bold">{lowStockProducts.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Export Button */}
          <div className="flex justify-end">
            <Button onClick={handleExportInventory} variant="outline">
              <Download className="w-4 h-4 ml-2" />
              تصدير تقرير الجرد
            </Button>
          </div>

          {/* Full Inventory Table */}
          <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
            <div className="p-4 border-b bg-muted/30">
              <h3 className="font-bold">تقرير الجرد الكامل</h3>
              <p className="text-sm text-muted-foreground">تاريخ التقرير: {new Date().toLocaleDateString('ar-SA')}</p>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="table-header">
                  <TableHead className="text-right">رمز الصنف</TableHead>
                  <TableHead className="text-right">اسم الصنف</TableHead>
                  <TableHead className="text-right">التصنيف</TableHead>
                  <TableHead className="text-right">الكمية</TableHead>
                  <TableHead className="text-right">التكلفة</TableHead>
                  <TableHead className="text-right">قيمة المخزون</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} className="table-row-hover">
                    <TableCell className="font-mono">{product.sku}</TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell className="font-semibold">{product.stock}</TableCell>
                    <TableCell>{product.cost.toLocaleString()} ر.س</TableCell>
                    <TableCell className="font-bold">{(product.stock * product.cost).toLocaleString()} ر.س</TableCell>
                    <TableCell>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          product.stock <= product.minStock
                            ? "bg-destructive/10 text-destructive"
                            : product.stock <= product.minStock * 2
                            ? "bg-warning/10 text-warning"
                            : "bg-success/10 text-success"
                        }`}
                      >
                        {product.stock <= product.minStock
                          ? "منخفض"
                          : product.stock <= product.minStock * 2
                          ? "متوسط"
                          : "جيد"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell colSpan={3}>الإجمالي</TableCell>
                  <TableCell>{totalItems}</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>{totalValue.toLocaleString()} ر.س</TableCell>
                  <TableCell>-</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          {lowStockProducts.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-success" />
              </div>
              <h3 className="font-bold text-lg mb-2">لا توجد تنبيهات</h3>
              <p className="text-muted-foreground">جميع الأصناف متوفرة بكميات كافية</p>
            </div>
          ) : (
            <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
              <div className="p-4 border-b bg-destructive/10">
                <h3 className="font-bold text-destructive flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  أصناف تحتاج إعادة طلب ({lowStockProducts.length})
                </h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="table-header">
                    <TableHead className="text-right">الصنف</TableHead>
                    <TableHead className="text-right">رمز الصنف</TableHead>
                    <TableHead className="text-right">الكمية الحالية</TableHead>
                    <TableHead className="text-right">الحد الأدنى</TableHead>
                    <TableHead className="text-right">الكمية المطلوبة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockProducts.map((product) => (
                    <TableRow key={product.id} className="table-row-hover bg-destructive/5">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-destructive" />
                          </div>
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                      <TableCell className="font-bold text-destructive">{product.stock}</TableCell>
                      <TableCell>{product.minStock}</TableCell>
                      <TableCell className="font-bold">
                        {Math.max(product.minStock * 2 - product.stock, 0)} وحدة
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default Inventory;
