import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users, Shield, User, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface UserWithRole {
  user_id: string;
  role: "admin" | "user";
  email: string;
  full_name: string | null;
  created_at: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
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
          role: role.role as "admin" | "user",
          email: "", // We'll show user_id since we can't access auth.users
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

  const handleRoleChange = async (userId: string, newRole: "admin" | "user") => {
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

      toast({
        title: "تم التحديث",
        description: `تم تغيير صلاحية المستخدم إلى ${newRole === "admin" ? "مسؤول" : "مستخدم"}`,
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
        <div className="flex items-center justify-end">
          <Button variant="outline" onClick={fetchUsers} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ml-2 ${loading ? "animate-spin" : ""}`} />
            تحديث
          </Button>
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
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
                          <Badge
                            variant={user.role === "admin" ? "default" : "secondary"}
                            className={user.role === "admin" ? "bg-primary" : ""}
                          >
                            {user.role === "admin" ? "مسؤول" : "مستخدم"}
                          </Badge>
                        ) : (
                          <Select
                            value={user.role}
                            onValueChange={(value: "admin" | "user") =>
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
                              <SelectItem value="admin">
                                <span className="flex items-center gap-2">
                                  <Shield className="h-4 w-4" />
                                  مسؤول
                                </span>
                              </SelectItem>
                              <SelectItem value="user">
                                <span className="flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  مستخدم
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default UserManagement;
