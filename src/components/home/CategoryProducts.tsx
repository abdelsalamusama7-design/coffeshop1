import { useState, useEffect } from "react";
import { ArrowRight, Plus, Minus, ShoppingCart, Package, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useWorker } from "@/contexts/WorkerContext";
import SaleReceipt from "./SaleReceipt";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  cost: number;
  stock: number;
  category: string;
  image_url: string | null;
  unit: string;
  is_prepared: boolean;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface CategoryProductsProps {
  category: string;
  onBack: () => void;
}

const CategoryProducts = ({ category, onBack }: CategoryProductsProps) => {
  const { worker } = useWorker();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState<{ items: CartItem[]; total: number } | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category", category)
        .order("name");

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast.error("خطأ في تحميل المنتجات");
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast.error("المنتج غير متوفر في المخزون");
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast.error("لا يمكن إضافة المزيد - الكمية المطلوبة تتجاوز المخزون");
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === productId);
      if (existing && existing.quantity > 1) {
        return prev.map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prev.filter((item) => item.product.id !== productId);
    });
  };

  const getCartQuantity = (productId: string) => {
    return cart.find((item) => item.product.id === productId)?.quantity || 0;
  };

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  };

  const getTotalProfit = () => {
    return cart.reduce(
      (sum, item) => sum + (item.product.price - item.product.cost) * item.quantity,
      0
    );
  };

  const handleSale = async () => {
    if (cart.length === 0) {
      toast.error("السلة فارغة");
      return;
    }

    try {
      // Insert sales records
      for (const item of cart) {
        const profit = (item.product.price - item.product.cost) * item.quantity;
        
        const { error: saleError } = await supabase.from("quick_sales").insert({
          product_id: item.product.id,
          product_name: item.product.name,
          category: item.product.category,
          quantity: item.quantity,
          unit_price: item.product.price,
          cost_price: item.product.cost,
          total: item.product.price * item.quantity,
          profit: profit,
          worker_id: worker?.id || null,
        });

        if (saleError) throw saleError;

        // Update stock
        const { error: stockError } = await supabase
          .from("products")
          .update({ stock: item.product.stock - item.quantity })
          .eq("id", item.product.id);

        if (stockError) throw stockError;
      }

      // Save for receipt
      setLastSale({ items: [...cart], total: getTotalAmount() });
      setShowReceipt(true);
      
      toast.success("تم تسجيل البيع بنجاح");
      setCart([]);
      fetchProducts(); // Refresh stock
    } catch (error: any) {
      toast.error("خطأ في تسجيل البيع");
      console.error("Error recording sale:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ar-EG", {
      style: "currency",
      currency: "EGP",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowRight className="w-5 h-5" />
          رجوع
        </Button>
        <h1 className="text-2xl font-bold text-foreground">{category}</h1>
        <div className="w-20" />
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-lg">لا توجد منتجات في هذا القسم</p>
          <p className="text-muted-foreground text-sm mt-2">
            يمكنك إضافة منتجات من صفحة المخزون
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => {
            const cartQty = getCartQuantity(product.id);
            const profit = product.price - product.cost;
            const profitPercentage = product.cost > 0 ? ((profit / product.cost) * 100).toFixed(0) : 0;

            return (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Product Image */}
                <div className="aspect-video bg-muted flex items-center justify-center">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-12 h-12 text-muted-foreground" />
                  )}
                </div>

                <CardContent className="p-4 space-y-3">
                  {/* Product Info */}
                  <div>
                    <h3 className="font-bold text-lg text-foreground">{product.name}</h3>
                    {product.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {product.description}
                      </p>
                    )}
                  </div>

                  {/* Pricing */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">سعر البيع:</span>
                        <span className="font-bold text-primary">{formatCurrency(product.price)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">التكلفة:</span>
                        <span className="text-foreground">{formatCurrency(product.cost)}</span>
                      </div>
                    </div>
                    <div className="text-left">
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        ربح: {formatCurrency(profit)}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        نسبة {profitPercentage}%
                      </p>
                    </div>
                  </div>

                  {/* Stock */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">المخزون:</span>
                    <Badge variant={product.stock > 5 ? "default" : product.stock > 0 ? "secondary" : "destructive"}>
                      {product.stock} {product.unit}
                    </Badge>
                  </div>

                  {/* Add to Cart */}
                  <div className="flex items-center justify-between pt-2">
                    {cartQty > 0 ? (
                      <div className="flex items-center gap-3 w-full justify-between">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeFromCart(product.id)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="font-bold text-lg">{cartQty}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addToCart(product)}
                          disabled={cartQty >= product.stock}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        className="w-full gap-2"
                        onClick={() => addToCart(product)}
                        disabled={product.stock <= 0}
                      >
                        <Plus className="w-4 h-4" />
                        إضافة للسلة
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Cart Summary */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 md:right-64 bg-background border-t shadow-lg p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)} منتجات
                </span>
                <span className="text-green-600 font-medium">
                  ربح: {formatCurrency(getTotalProfit())}
                </span>
              </div>
              <p className="font-bold text-xl text-foreground">
                الإجمالي: {formatCurrency(getTotalAmount())}
              </p>
            </div>
            <Button size="lg" onClick={handleSale} className="gap-2">
              <ShoppingCart className="w-5 h-5" />
              تأكيد البيع
            </Button>
          </div>
        </div>
      )}

      {/* Receipt Dialog */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">إيصال البيع</DialogTitle>
          </DialogHeader>
          {lastSale && (
            <SaleReceipt
              items={lastSale.items}
              total={lastSale.total}
              workerName={worker?.name || "غير معروف"}
              onClose={() => setShowReceipt(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoryProducts;
