import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Coffee, Lock, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface Worker {
  id: string;
  name: string;
  is_admin: boolean;
  permissions: {
    can_sell: boolean;
    can_view_reports: boolean;
    can_view_cost: boolean;
    can_edit_products: boolean;
    can_edit_inventory: boolean;
    can_manage_workers: boolean;
  };
}

const WorkerAuth = () => {
  const [selectedWorker, setSelectedWorker] = useState<string>("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // جلب قائمة العمال النشطين
  const { data: workers = [], isLoading: workersLoading } = useQuery({
    queryKey: ["workers-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workers")
        .select("id, name, is_admin")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data || [];
    },
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedWorker) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار اسم العامل",
        variant: "destructive",
      });
      return;
    }

    if (pin.length < 4) {
      toast({
        title: "خطأ",
        description: "الرقم السري يجب أن يكون 4 أرقام على الأقل",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // التحقق من الرقم السري
      const { data: worker, error } = await supabase
        .from("workers")
        .select("*")
        .eq("id", selectedWorker)
        .eq("pin", pin)
        .eq("is_active", true)
        .single();

      if (error || !worker) {
        toast({
          title: "خطأ في تسجيل الدخول",
          description: "الرقم السري غير صحيح",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // حفظ بيانات العامل في localStorage
      const workerData: Worker = {
        id: worker.id,
        name: worker.name,
        is_admin: worker.is_admin,
        permissions: worker.permissions as Worker["permissions"],
      };
      
      localStorage.setItem("currentWorker", JSON.stringify(workerData));

      toast({
        title: `مرحباً ${worker.name}`,
        description: worker.is_admin ? "تم تسجيل الدخول كمسؤول" : "تم تسجيل الدخول بنجاح",
      });

      // التوجيه حسب نوع المستخدم
      navigate("/pos", { replace: true });

    } catch (err) {
      toast({
        title: "خطأ",
        description: "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePinChange = (value: string) => {
    // فقط أرقام
    const numericValue = value.replace(/\D/g, "");
    if (numericValue.length <= 6) {
      setPin(numericValue);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-card border-border/50">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-24 h-24 rounded-full gradient-primary flex items-center justify-center shadow-lg">
            <Coffee className="w-12 h-12 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">
              محل القهوة والمشروبات
            </CardTitle>
            <CardDescription className="mt-2 text-muted-foreground">
              اختر اسمك وأدخل الرقم السري للدخول
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="worker" className="text-foreground">اسم العامل</Label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Select
                  value={selectedWorker}
                  onValueChange={setSelectedWorker}
                  disabled={loading || workersLoading}
                >
                  <SelectTrigger className="pr-10 bg-card border-border">
                    <SelectValue placeholder="اختر اسمك..." />
                  </SelectTrigger>
                  <SelectContent>
                    {workers.map((worker) => (
                      <SelectItem key={worker.id} value={worker.id}>
                        {worker.name} {worker.is_admin && "👑"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pin" className="text-foreground">الرقم السري</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="pin"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => handlePinChange(e.target.value)}
                  className="pr-10 text-center text-2xl tracking-widest bg-card border-border"
                  maxLength={6}
                  disabled={loading}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-lg gap-2" 
              disabled={loading || !selectedWorker || pin.length < 4}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Coffee className="h-5 w-5" />
                  دخول
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-center text-sm text-muted-foreground">
              للمسؤولين فقط:{" "}
              <a 
                href="/auth" 
                className="text-primary hover:underline"
              >
                تسجيل دخول المسؤول
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkerAuth;
