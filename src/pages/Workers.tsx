import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWorker } from "@/contexts/WorkerContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  ArrowRight,
  Shield,
  ShieldCheck
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface WorkerPermissions {
  can_sell: boolean;
  can_view_reports: boolean;
  can_view_cost: boolean;
  can_edit_products: boolean;
  can_edit_inventory: boolean;
  can_manage_workers: boolean;
}

interface Worker {
  id: string;
  name: string;
  pin: string;
  is_admin: boolean;
  permissions: WorkerPermissions;
  is_active: boolean;
  created_at: string;
}

const defaultPermissions: WorkerPermissions = {
  can_sell: true,
  can_view_reports: false,
  can_view_cost: false,
  can_edit_products: false,
  can_edit_inventory: false,
  can_manage_workers: false,
};

const permissionLabels: Record<keyof WorkerPermissions, string> = {
  can_sell: "إضافة المبيعات",
  can_view_reports: "مشاهدة التقارير",
  can_view_cost: "مشاهدة التكلفة",
  can_edit_products: "تعديل المنتجات",
  can_edit_inventory: "تعديل المخزون",
  can_manage_workers: "إدارة العمال",
};

const Workers = () => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editWorker, setEditWorker] = useState<Worker | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    pin: "",
    is_admin: false,
    permissions: defaultPermissions,
  });

  const { isAdmin } = useWorker();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: workers = [], isLoading } = useQuery({
    queryKey: ["workers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map((w) => ({
        ...w,
        permissions: w.permissions as unknown as WorkerPermissions,
      })) as Worker[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const permissionsToSave = data.is_admin
        ? Object.fromEntries(Object.keys(defaultPermissions).map((k) => [k, true]))
        : { ...data.permissions };

      const { error } = await supabase.from("workers").insert([
        {
          name: data.name,
          pin: data.pin,
          is_admin: data.is_admin,
          permissions: permissionsToSave,
        },
      ]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "تم إضافة العامل بنجاح" });
      setIsAddOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["workers"] });
    },
    onError: () => {
      toast({ title: "خطأ في إضافة العامل", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const permissionsToSave = data.is_admin
        ? Object.fromEntries(Object.keys(defaultPermissions).map((k) => [k, true]))
        : { ...data.permissions };

      const { error } = await supabase
        .from("workers")
        .update({
          name: data.name,
          pin: data.pin,
          is_admin: data.is_admin,
          permissions: permissionsToSave,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "تم تحديث العامل بنجاح" });
      setEditWorker(null);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["workers"] });
    },
    onError: () => {
      toast({ title: "خطأ في تحديث العامل", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("workers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "تم حذف العامل" });
      queryClient.invalidateQueries({ queryKey: ["workers"] });
    },
    onError: () => {
      toast({ title: "خطأ في حذف العامل", variant: "destructive" });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("workers")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      pin: "",
      is_admin: false,
      permissions: defaultPermissions,
    });
  };

  const openEditDialog = (worker: Worker) => {
    setEditWorker(worker);
    setFormData({
      name: worker.name,
      pin: worker.pin,
      is_admin: worker.is_admin,
      permissions: worker.permissions,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.length < 2) {
      toast({ title: "الاسم يجب أن يكون حرفين على الأقل", variant: "destructive" });
      return;
    }
    if (formData.pin.length < 4) {
      toast({ title: "الرقم السري يجب أن يكون 4 أرقام على الأقل", variant: "destructive" });
      return;
    }

    if (editWorker) {
      updateMutation.mutate({ id: editWorker.id, data: formData });
    } else {
      addMutation.mutate(formData);
    }
  };

  if (!isAdmin) {
    navigate("/pos");
    return null;
  }

  const WorkerForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>اسم العامل</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="أدخل اسم العامل"
        />
      </div>

      <div className="space-y-2">
        <Label>الرقم السري</Label>
        <Input
          type="text"
          inputMode="numeric"
          value={formData.pin}
          onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, "").slice(0, 6) })}
          placeholder="أدخل رقم سري (4-6 أرقام)"
          className="text-center text-xl tracking-widest"
        />
      </div>

      <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <Label>مسؤول (أدمن)</Label>
        </div>
        <Switch
          checked={formData.is_admin}
          onCheckedChange={(checked) => setFormData({ ...formData, is_admin: checked })}
        />
      </div>

      {!formData.is_admin && (
        <div className="space-y-3">
          <Label>الصلاحيات</Label>
          <div className="grid gap-2">
            {Object.entries(permissionLabels).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-sm">{label}</span>
                <Switch
                  checked={formData.permissions[key as keyof WorkerPermissions]}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      permissions: { ...formData.permissions, [key]: checked },
                    })
                  }
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={addMutation.isPending || updateMutation.isPending}>
        {editWorker ? "تحديث" : "إضافة"}
      </Button>
    </form>
  );

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/pos")}>
              <ArrowRight className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Users className="h-6 w-6" />
                إدارة العمال
              </h1>
              <p className="text-muted-foreground text-sm">إضافة وتعديل وحذف العمال وتحديد صلاحياتهم</p>
            </div>
          </div>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={resetForm}>
                <Plus className="h-4 w-4" />
                إضافة عامل
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة عامل جديد</DialogTitle>
              </DialogHeader>
              <WorkerForm />
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>قائمة العمال</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-8 text-muted-foreground">جاري التحميل...</p>
            ) : workers.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">لا يوجد عمال</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الرقم السري</TableHead>
                    <TableHead className="text-left">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workers.map((worker) => (
                    <TableRow key={worker.id}>
                      <TableCell className="font-medium">{worker.name}</TableCell>
                      <TableCell>
                        {worker.is_admin ? (
                          <Badge className="bg-primary">
                            <ShieldCheck className="h-3 w-3 ml-1" />
                            مسؤول
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Shield className="h-3 w-3 ml-1" />
                            عامل
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={worker.is_active}
                          onCheckedChange={(checked) =>
                            toggleActiveMutation.mutate({ id: worker.id, is_active: checked })
                          }
                        />
                      </TableCell>
                      <TableCell className="font-mono">{worker.pin}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog
                            open={editWorker?.id === worker.id}
                            onOpenChange={(open) => !open && setEditWorker(null)}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(worker)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>تعديل {worker.name}</DialogTitle>
                              </DialogHeader>
                              <WorkerForm />
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => {
                              if (confirm("هل أنت متأكد من حذف هذا العامل؟")) {
                                deleteMutation.mutate(worker.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Workers;
