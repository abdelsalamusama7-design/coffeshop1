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
import { Plus, Search, Edit, Trash2, Package, BarChart3, AlertTriangle, Download, Loader2 } from "lucide-react";
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
import { useProducts, Product, ProductInput } from "@/hooks/useProducts";

const categories = ["كاميرات", "أجهزة تسجيل", "كابلات", "ملحقات", "تخزين", "عام"];

const Inventory = () => {
  const { products, loading, addProduct, updateProduct, deleteProduct } = useProducts();
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
    min_stock: "",
    category: "",
  });

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.includes(searchTerm) ||
      (product.sku && product.sku.includes(searchTerm)) ||
      product.category.includes(searchTerm);
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const lowStockProducts = products.filter((p) => p.stock <= p.min_stock);
  const totalValue = products.reduce((sum, p) => sum + p.stock * p.cost, 0);
  const totalItems = products.reduce((sum, p) => sum + p.stock, 0);

  const handleAddProduct = async () => {
    if (newProduct.name) {
      const productData: ProductInput = {
        name: newProduct.name,
        sku: newProduct.sku || undefined,
        price: Number(newProduct.price) || 0,
        cost: Number(newProduct.cost) || 0,
        stock: Number(newProduct.stock) || 0,
        min_stock: Number(newProduct.min_stock) || 5,
        category: newProduct.category || "عام",
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await addProduct(productData);
      }

      setNewProduct({ name: "", sku: "", price: "", cost: "", stock: "", min_stock: "", category: "" });
      setEditingProduct(null);
      setIsDialogOpen(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      sku: product.sku || "",
      price: String(product.price),
      cost: String(product.cost),
      stock: String(product.stock),
      min_stock: String(product.min_stock),
      category: product.category,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    await deleteProduct(id);
  };

  const handleExportInventory = () => {
    const csvContent = [
      ["رمز الصنف", "اسم الصنف", "التصنيف", "سعر البيع", "التكلفة", "الكمية", "الحد الأدنى", "قيمة المخزون"],
      ...products.map((p) => [
        p.sku || "",
        p.name,
        p.category,
        p.price,
        p.cost,
        p.stock,
        p.min_stock,
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

  if (loading) {
    return (
      <MainLayout title="إدارة المخزون" subtitle="عرض وإدارة جميع الأصناف والجرد">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

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
                setNewProduct({ name: "", sku: "", price: "", cost: "", stock: "", min_stock: "", category: "" });
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
                      <Label>سعر البيع (د.ل)</Label>
                      <Input
                        type="number"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>التكلفة (د.ل)</Label>
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
                        value={newProduct.min_stock}
                        onChange={(e) => setNewProduct({ ...newProduct, min_stock: e.target.value })}
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
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      لا توجد أصناف. قم بإضافة صنف جديد.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id} className="table-row-hover">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Package className="w-5 h-5 text-primary" />
                          </div>
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{product.sku || "-"}</TableCell>
                      <TableCell>
                        <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                          {product.category}
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold">{product.price.toLocaleString()} د.ل</TableCell>
                      <TableCell className="text-muted-foreground">{product.cost.toLocaleString()} د.ل</TableCell>
                      <TableCell>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            product.stock <= product.min_stock
                              ? "bg-destructive/10 text-destructive"
                              : product.stock <= product.min_stock * 2
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
                  ))
                )}
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
                  <span className="text-lg font-bold text-primary-foreground">د.ل</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">قيمة المخزون</p>
                  <p className="text-2xl font-bold">{totalValue.toLocaleString()} د.ل</p>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">أصناف منخفضة</p>
                  <p className="text-2xl font-bold text-destructive">{lowStockProducts.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Export Button */}
          <div className="flex justify-end">
            <Button onClick={handleExportInventory} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              تصدير تقرير الجرد
            </Button>
          </div>

          {/* Inventory Table */}
          <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="table-header">
                  <TableHead className="text-right">الصنف</TableHead>
                  <TableHead className="text-right">التصنيف</TableHead>
                  <TableHead className="text-right">التكلفة</TableHead>
                  <TableHead className="text-right">الكمية</TableHead>
                  <TableHead className="text-right">قيمة المخزون</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} className="table-row-hover">
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.cost.toLocaleString()} ر.س</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell className="font-semibold">
                      {(product.stock * product.cost).toLocaleString()} ر.س
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          product.stock <= product.min_stock
                            ? "bg-destructive/10 text-destructive"
                            : product.stock <= product.min_stock * 2
                            ? "bg-warning/10 text-warning"
                            : "bg-success/10 text-success"
                        }`}
                      >
                        {product.stock <= product.min_stock
                          ? "منخفض"
                          : product.stock <= product.min_stock * 2
                          ? "متوسط"
                          : "متوفر"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <div className="bg-card rounded-xl shadow-card border border-border/50 p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              أصناف تحتاج لإعادة الطلب
            </h3>
            {lowStockProducts.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                لا توجد أصناف منخفضة المخزون 🎉
              </p>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-4 bg-destructive/5 rounded-lg border border-destructive/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                        <Package className="w-5 h-5 text-destructive" />
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-destructive font-bold">{product.stock} وحدة متبقية</p>
                      <p className="text-sm text-muted-foreground">الحد الأدنى: {product.min_stock}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default Inventory;
