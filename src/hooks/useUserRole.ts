import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppRole, canAccessPath, getAllowedPaths, roleInfo } from "@/lib/permissions";

interface UserRole {
  role: AppRole;
  loading: boolean;
  isAdmin: boolean;
  canAccess: (path: string) => boolean;
  allowedPaths: string[];
  roleLabel: string;
  roleColor: string;
}

export const useUserRole = (): UserRole => {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole>("user");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching user role:", error);
        } else if (data) {
          setRole(data.role as AppRole);
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [user]);

  const info = roleInfo[role] || roleInfo.user;

  return {
    role,
    loading,
    isAdmin: role === "admin",
    canAccess: (path: string) => canAccessPath(role, path),
    allowedPaths: getAllowedPaths(role),
    roleLabel: info.label,
    roleColor: info.color,
  };
};
