import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useWorker } from "@/contexts/WorkerContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, LogIn, Coffee, Shield, User } from "lucide-react";
import logo from "@/assets/logo.png";

const loginSchema = z.object({
  email: z.string().trim().email({ message: "البريد الإلكتروني غير صالح" }),
  password: z.string().min(6, { message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }),
});

type UserType = "admin" | "worker";

interface WorkerData {
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

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<UserType>("worker");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { signIn, user, loading: authLoading } = useAuth();
  const { login: workerLogin, isLoggedIn: isWorkerLoggedIn } = useWorker();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // إذا كان المستخدم مسجل دخول كأدمن
    if (!authLoading && user) {
      navigate("/dashboard", { replace: true });
    }
    // إذا كان المستخدم مسجل دخول كعامل
    if (isWorkerLoggedIn) {
      navigate("/pos", { replace: true });
    }
  }, [user, authLoading, isWorkerLoggedIn, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleAdminLogin = async () => {
    const { error } = await signIn(formData.email, formData.password);
    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        toast({
          title: "خطأ في تسجيل الدخول",
          description: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
          variant: "destructive",
        });
      } else {
        toast({
          title: "خطأ",
          description: error.message,
          variant: "destructive",
        });
      }
      return false;
    }

    // التحقق من دور المستخدم
    const { data: { user: loggedInUser } } = await supabase.auth.getUser();
    if (loggedInUser) {
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", loggedInUser.id)
        .maybeSingle();

      if (!roleData || roleData.role !== "admin") {
        await supabase.auth.signOut();
        toast({
          title: "غير مصرح",
          description: "هذا الحساب ليس حساب مسؤول",
          variant: "destructive",
        });
        return false;
      }
    }

    toast({
      title: "مرحباً بك",
      description: "تم تسجيل الدخول كمسؤول بنجاح",
    });
    return true;
  };

  const handleWorkerLogin = async () => {
    // البحث عن العامل بالإيميل
    const { data, error } = await supabase
      .from("workers")
      .select("id, name, is_admin, permissions")
      .eq("email", formData.email.trim().toLowerCase())
      .eq("pin", formData.password)
      .eq("is_active", true)
      .maybeSingle();

    const worker = data as { 
      id: string; 
      name: string; 
      is_admin: boolean | null; 
      permissions: WorkerData["permissions"] | null;
    } | null;

    if (error || !worker) {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: "البريد الإلكتروني أو الرقم السري غير صحيح",
        variant: "destructive",
      });
      return false;
    }

    // حفظ بيانات العامل
    const workerData: WorkerData = {
      id: worker.id,
      name: worker.name,
      is_admin: worker.is_admin || false,
      permissions: worker.permissions || {
        can_sell: true,
        can_view_reports: false,
        can_view_cost: false,
        can_edit_products: false,
        can_edit_inventory: false,
        can_manage_workers: false,
      },
    };

    workerLogin(workerData);

    toast({
      title: `مرحباً ${worker.name}`,
      description: "تم تسجيل الدخول بنجاح",
    });
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const result = loginSchema.safeParse(formData);
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        setLoading(false);
        return;
      }

      let success = false;
      if (userType === "admin") {
        success = await handleAdminLogin();
      } else {
        success = await handleWorkerLogin();
      }

      if (success) {
        if (userType === "admin") {
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/pos", { replace: true });
        }
      }
    } catch (err) {
      toast({
        title: "خطأ غير متوقع",
        description: "حدث خطأ أثناء تسجيل الدخول",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/50 to-background p-4">
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
              أدخل بياناتك لتسجيل الدخول
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* اختيار نوع المستخدم */}
            <div className="space-y-3">
              <Label className="text-foreground">نوع الحساب</Label>
              <RadioGroup
                value={userType}
                onValueChange={(value) => setUserType(value as UserType)}
                className="flex gap-4"
                disabled={loading}
              >
                <div className="flex-1">
                  <Label
                    htmlFor="worker"
                    className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      userType === "worker"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="worker" id="worker" className="sr-only" />
                    <User className="h-5 w-5" />
                    <span className="font-medium">عامل</span>
                  </Label>
                </div>
                <div className="flex-1">
                  <Label
                    htmlFor="admin"
                    className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      userType === "admin"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="admin" id="admin" className="sr-only" />
                    <Shield className="h-5 w-5" />
                    <span className="font-medium">مسؤول</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* البريد الإلكتروني */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">البريد الإلكتروني</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pr-10 bg-card border-border"
                  dir="ltr"
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            {/* كلمة المرور / الرقم السري */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                {userType === "admin" ? "كلمة المرور" : "الرقم السري"}
              </Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder={userType === "admin" ? "••••••••" : "••••"}
                  value={formData.password}
                  onChange={handleChange}
                  className="pr-10 bg-card border-border"
                  dir="ltr"
                  disabled={loading}
                  autoComplete={userType === "admin" ? "current-password" : "off"}
                  inputMode={userType === "worker" ? "numeric" : "text"}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <Button type="submit" className="w-full h-12 text-lg gap-2" disabled={loading}>
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  تسجيل الدخول
                </>
              )}
            </Button>
          </form>

          {userType === "admin" && (
            <div className="mt-4 text-center">
              <a
                href="/forgot-password"
                className="text-sm text-muted-foreground hover:text-primary hover:underline"
              >
                نسيت كلمة المرور؟
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
