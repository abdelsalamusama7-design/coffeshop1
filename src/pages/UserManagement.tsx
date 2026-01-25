import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users, Shield, User, RefreshCw, Pencil, Wrench, Eye, ShoppingCart, HardHat } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import AddUserDialog from "@/components/users/AddUserDialog";
import EditUserDialog from "@/components/users/EditUserDialog";

type AppRole = "admin" | "user" | "sales" | "technical" | "supervisor" | "maintenance" | "worker";

const roleLabels: Record<AppRole, { label: string; icon: React.ReactNode; color: string }> = {
  admin: { label: "مسؤول", icon: <Shield className="h-4 w-4" />, color: "bg-primary" },
  user: { label: "مستخدم", icon: <User className="h-4 w-4" />, color: "bg-secondary" },
  sales: { label: "مبيعات", icon: <ShoppingCart className="h-4 w-4" />, color: "bg-blue-500" },
  technical: { label: "تقني", icon: <Wrench className="h-4 w-4" />, color: "bg-purple-500" },
  supervisor: { label: "مشرف", icon: <Eye className="h-4 w-4" />, color: "bg-orange-500" },
  maintenance: { label: "صيانة", icon: <HardHat className="h-4 w-4" />, color: "bg-yellow-500" },
  worker: { label: "عامل", icon: <User className="h-4 w-4" />, color: "bg-gray-500" },
};

interface UserWithRole {
  user_id: string;
  role: AppRole;
  email: string;
  full_name: string | null;
  created_at: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role, created_at");

      if (rolesError) throw rolesError;

      // Fetch profiles for user details
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, full_name");

      if (profilesError) throw profilesError;

      // Combine data
      const combinedUsers: UserWithRole[] = (rolesData || []).map((role) => {
        const profile = profilesData?.find((p) => p.user_id === role.user_id);
        return {
          user_id: role.user_id,
          role: role.role as AppRole,
          email: "",
          full_name: profile?.full_name || null,
          created_at: role.created_at,
        };
      });

      setUsers(combinedUsers);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحميل المستخدمين",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: AppRole) => {
    if (userId === currentUser?.id) {
      toast({
        title: "غير مسموح",
        description: "لا يمكنك تغيير صلاحياتك الخاصة",
        variant: "destructive",
      });
      return;
    }

    setUpdating(userId);
    try {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", userId);

      if (error) throw error;

      setUsers((prev) =>
        prev.map((u) => (u.user_id === userId ? { ...u, role: newRole } : u))
      );

      const roleLabel = roleLabels[newRole]?.label || newRole;
      toast({
        title: "تم التحديث",
        description: `تم تغيير صلاحية المستخدم إلى ${roleLabel}`,
      });
    } catch (error: any) {
      console.error("Error updating role:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث الصلاحية",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const handleEditUser = (user: UserWithRole) => {
    setEditingUser(user);
    setEditDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <MainLayout title="إدارة المستخدمين" subtitle="إدارة صلاحيات المستخدمين في النظام">
      <div className="space-y-6">
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={fetchUsers} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ml-2 ${loading ? "animate-spin" : ""}`} />
            تحديث
          </Button>
          <AddUserDialog onUserAdded={fetchUsers} />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي المستخدمين</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-success/10">
                  <Shield className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">المسؤولين</p>
                  <p className="text-2xl font-bold">
                    {users.filter((u) => u.role === "admin").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-accent/10">
                  <User className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">المستخدمين العاديين</p>
                  <p className="text-2xl font-bold">
                    {users.filter((u) => u.role === "user").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>قائمة المستخدمين</CardTitle>
            <CardDescription>
              انقر على الصلاحية لتغييرها
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                لا يوجد مستخدمين
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="table-header">
                    <TableHead className="text-right">المستخدم</TableHead>
                    <TableHead className="text-right">الاسم</TableHead>
                    <TableHead className="text-right">تاريخ الانضمام</TableHead>
                    <TableHead className="text-right">الصلاحية</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const roleInfo = roleLabels[user.role] || roleLabels.user;
                    return (
                      <TableRow key={user.user_id} className="table-row-hover">
                        <TableCell className="font-mono text-sm">
                          {user.user_id === currentUser?.id ? (
                            <span className="flex items-center gap-2">
                              {user.user_id.slice(0, 8)}...
                              <Badge variant="outline" className="text-xs">أنت</Badge>
                            </span>
                          ) : (
                            `${user.user_id.slice(0, 8)}...`
                          )}
                        </TableCell>
                        <TableCell>{user.full_name || "غير محدد"}</TableCell>
                        <TableCell>{formatDate(user.created_at)}</TableCell>
                        <TableCell>
                          {user.user_id === currentUser?.id ? (
                            <Badge className={roleInfo.color}>
                              <span className="flex items-center gap-1">
                                {roleInfo.icon}
                                {roleInfo.label}
                              </span>
                            </Badge>
                          ) : (
                            <Select
                              value={user.role}
                              onValueChange={(value: AppRole) =>
                                handleRoleChange(user.user_id, value)
                              }
                              disabled={updating === user.user_id}
                            >
                              <SelectTrigger className="w-32">
                                {updating === user.user_id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <SelectValue />
                                )}
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
                          )}
                        </TableCell>
                        <TableCell>
                          {user.user_id !== currentUser?.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditUser(user)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <EditUserDialog
          user={editingUser}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onUserUpdated={fetchUsers}
        />
      </div>
    </MainLayout>
  );
};

export default UserManagement;
