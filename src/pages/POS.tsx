import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWorker } from "@/contexts/WorkerContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Coffee, 
  Leaf, 
  GlassWater, 
  Droplets, 
  Apple, 
  Package,
  LogOut,
  FileText,
  Users,
  Settings,
  Plus,
  Minus,
  ShoppingCart,
  Trash2,
  Clock
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  category: string;
  stock: number;
}

interface CartItem extends Product {
  quantity: number;
}

const categories = [
  { id: "قهوة", name: "قهوة", icon: Coffee, color: "bg-coffee text-coffee-foreground" },
  { id: "شاي", name: "شاي", icon: Leaf, color: "bg-tea text-tea-foreground" },
  { id: "مشروبات باردة", name: "مشروبات باردة", icon: GlassWater, color: "bg-cold-drinks text-cold-drinks-foreground" },
  { id: "مياه", name: "مياه", icon: Droplets, color: "bg-water text-water-foreground" },
  { id: "عصائر", name: "عصائر", icon: Apple, color: "bg-juice text-juice-foreground" },
  { id: "أخرى", name: "أخرى", icon: Package, color: "bg-other text-other-foreground" },
];

const POS = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("قهوة");
  const [cart, setCart] = useState<CartItem[]>([]);
  const { worker, isAdmin, hasPermission, logout } = useWorker();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // جلب المنتجات
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", selectedCategory],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category", selectedCategory)
        .order("name");

      if (error) throw error;
      return data as Product[];
    },
  });

  // إضافة عملية بيع
  const saleMutation = useMutation({
    mutationFn: async (items: CartItem[]) => {
      const sales = items.map((item) => ({
        worker_id: worker?.id,
        product_id: item.id,
        product_name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit_price: item.price,
        cost_price: item.cost,
        total: item.price * item.quantity,
      }));

      const { error } = await supabase.from("quick_sales").insert(sales);
      if (error) throw error;

      // تحديث المخزون
      for (const item of items) {
        await supabase
          .from("products")
          .update({ stock: item.stock - item.quantity })
          .eq("id", item.id);
      }
    },
    onSuccess: () => {
      toast({
        title: "تم البيع بنجاح",
        description: `المجموع: ${cartTotal.toFixed(2)} ر.س`,
      });
      setCart([]);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في تسجيل البيع",
        variant: "destructive",
      });
    },
  });

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast({
        title: "نفذ المخزون",
        description: `${product.name} غير متوفر حالياً`,
        variant: "destructive",
      });
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast({
            title: "تنبيه",
            description: "لا يمكن إضافة المزيد من هذا المنتج",
            variant: "destructive",
          });
          return prev;
        }
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.stock) return item;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartProfit = cart.reduce(
    (sum, item) => sum + (item.price - item.cost) * item.quantity,
    0
  );

  const handleCheckout = () => {
    if (cart.length === 0) return;
    saleMutation.mutate(cart);
  };

  const handleLogout = () => {
    logout();
    navigate("/worker-auth", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
            <Coffee className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-foreground">نقطة البيع</h1>
            <p className="text-xs text-muted-foreground">
              مرحباً {worker?.name} {worker?.is_admin && "👑"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasPermission("can_view_reports") && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/reports")}
              className="gap-1"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">التقارير</span>
            </Button>
          )}
          {isAdmin && (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/attendance")}
                className="gap-1"
              >
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">الحضور</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/workers")}
                className="gap-1"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">العمال</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/inventory")}
                className="gap-1"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">المخزون</span>
              </Button>
            </>
          )}
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1 text-destructive">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">خروج</span>
          </Button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          {/* Categories */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <Button
                  key={cat.id}
                  variant="outline"
                  className={`h-20 flex-col gap-2 ${
                    isActive ? cat.color : "bg-card border-border"
                  }`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-xs font-medium">{cat.name}</span>
                </Button>
              );
            })}
          </div>

          {/* Products Grid */}
          <ScrollArea className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <Clock className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>لا توجد منتجات في هذا القسم</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {products.map((product) => (
                  <Card
                    key={product.id}
                    className={`cursor-pointer transition-all hover:scale-105 hover:shadow-lg ${
                      product.stock <= 0 ? "opacity-50" : ""
                    }`}
                    onClick={() => addToCart(product)}
                  >
                    <CardContent className="p-3 text-center">
                      <h3 className="font-semibold text-foreground truncate mb-1">
                        {product.name}
                      </h3>
                      <p className="text-lg font-bold text-primary">
                        {product.price.toFixed(2)} ر.س
                      </p>
                      {hasPermission("can_view_cost") && (
                        <p className="text-xs text-muted-foreground">
                          تكلفة: {product.cost.toFixed(2)}
                        </p>
                      )}
                      <Badge
                        variant={product.stock <= 5 ? "destructive" : "secondary"}
                        className="mt-2"
                      >
                        المخزون: {product.stock}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Cart Sidebar */}
        <div className="w-full lg:w-80 bg-card border-t lg:border-t-0 lg:border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="font-bold text-foreground flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              سلة المشتريات
            </h2>
          </div>

          <ScrollArea className="flex-1 p-4">
            {cart.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                السلة فارغة
              </p>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="bg-secondary rounded-lg p-3 flex items-center gap-3"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground text-sm">
                        {item.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {item.price.toFixed(2)} × {item.quantity} ={" "}
                        {(item.price * item.quantity).toFixed(2)} ر.س
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center font-medium text-foreground">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="p-4 border-t border-border space-y-3">
            <div className="flex justify-between text-foreground">
              <span>المجموع:</span>
              <span className="font-bold text-lg">{cartTotal.toFixed(2)} ر.س</span>
            </div>
            {hasPermission("can_view_cost") && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">الربح:</span>
                <span className="font-medium text-success">
                  +{cartProfit.toFixed(2)} ر.س
                </span>
              </div>
            )}
            <Button
              className="w-full h-12 text-lg"
              disabled={cart.length === 0 || saleMutation.isPending}
              onClick={handleCheckout}
            >
              {saleMutation.isPending ? (
                <Clock className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5 ml-2" />
                  إتمام البيع
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POS;
