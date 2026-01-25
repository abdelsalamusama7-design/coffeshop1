import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Shield, User, Wrench, Eye, ShoppingCart, HardHat } from "lucide-react";

type AppRole = "admin" | "user" | "sales" | "technical" | "supervisor" | "maintenance" | "worker";

interface UserData {
  user_id: string;
  role: AppRole;
  email: string;
  full_name: string | null;
}

interface EditUserDialogProps {
  user: UserData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated: () => void;
}

const roleLabels: Record<AppRole, { label: string; icon: React.ReactNode }> = {
  admin: { label: "مسؤول", icon: <Shield className="h-4 w-4" /> },
  user: { label: "مستخدم", icon: <User className="h-4 w-4" /> },
  sales: { label: "مبيعات", icon: <ShoppingCart className="h-4 w-4" /> },
  technical: { label: "تقني", icon: <Wrench className="h-4 w-4" /> },
  supervisor: { label: "مشرف", icon: <Eye className="h-4 w-4" /> },
  maintenance: { label: "صيانة", icon: <HardHat className="h-4 w-4" /> },
  worker: { label: "عامل", icon: <User className="h-4 w-4" /> },
};

const EditUserDialog = ({ user, open, onOpenChange, onUserUpdated }: EditUserDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<AppRole>("user");
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      setFullName(user.full_name || "");
      setRole(user.role);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    setLoading(true);
    try {
      const response = await supabase.functions.invoke("update-user", {
        body: {
          user_id: user.user_id,
          email: email || undefined,
          full_name: fullName,
          role,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      toast({
        title: "تم بنجاح",
        description: "تم تحديث بيانات المستخدم بنجاح",
      });

      onOpenChange(false);
      onUserUpdated();

    } catch (error: any) {
      console.error("Error updating user:", error);
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء تحديث بيانات المستخدم",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>تعديل بيانات المستخدم</DialogTitle>
          <DialogDescription>
            تعديل البريد الإلكتروني والاسم والصلاحية
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-email">البريد الإلكتروني</Label>
              <Input
                id="edit-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-fullName">الاسم الكامل</Label>
              <Input
                id="edit-fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="الاسم الكامل"
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-role">الصلاحية</Label>
              <Select
                value={role}
                onValueChange={(value: AppRole) => setRole(value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(roleLabels).map(([key, { label, icon }]) => (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        {icon}
                        {label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              إلغاء
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 ml-2" />
                  حفظ التغييرات
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
