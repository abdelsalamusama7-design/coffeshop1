import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Device {
  id: string;
  customer_id: string | null;
  customer_name: string;
  device_type: string;
  device_model: string | null;
  serial_number: string;
  warranty_start_date: string;
  warranty_months: number;
  warranty_end_date: string | null;
  installation_date: string | null;
  location_details: string | null;
  notes: string | null;
  status: "active" | "expired" | "under_repair" | "replaced";
  created_at: string;
  updated_at: string;
}

export interface MaintenanceLog {
  id: string;
  device_id: string;
  customer_id: string | null;
  maintenance_type: "repair" | "inspection" | "replacement" | "upgrade" | "complaint";
  description: string;
  technician_name: string | null;
  cost: number;
  is_warranty_claim: boolean;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  scheduled_date: string | null;
  completed_date: string | null;
  notes: string | null;
  created_at: string;
}

export const DEVICE_TYPES = [
  { value: "camera_2mp", label: "كاميرا 2MP" },
  { value: "camera_5mp", label: "كاميرا 5MP" },
  { value: "camera_ip", label: "كاميرا IP" },
  { value: "dvr", label: "DVR" },
  { value: "nvr", label: "NVR" },
  { value: "hard_disk", label: "هارد ديسك" },
  { value: "power_supply", label: "باور سبلاي" },
  { value: "cable", label: "كابلات" },
  { value: "switch", label: "سويتش شبكة" },
  { value: "router", label: "راوتر" },
  { value: "access_point", label: "أكسس بوينت" },
  { value: "other", label: "أخرى" },
];

export const WARRANTY_PERIODS = [
  { value: 3, label: "3 أشهر" },
  { value: 6, label: "6 أشهر" },
  { value: 12, label: "سنة" },
  { value: 24, label: "سنتين" },
  { value: 36, label: "3 سنوات" },
];

export const MAINTENANCE_TYPES = [
  { value: "repair", label: "إصلاح" },
  { value: "inspection", label: "فحص" },
  { value: "replacement", label: "استبدال" },
  { value: "upgrade", label: "ترقية" },
  { value: "complaint", label: "شكوى" },
];

export const useDevices = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all devices
  const { data: devices, isLoading, error } = useQuery({
    queryKey: ["devices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("devices")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Device[];
    },
  });

  // Fetch devices expiring soon (within 30 days)
  const { data: expiringDevices } = useQuery({
    queryKey: ["devices-expiring"],
    queryFn: async () => {
      const today = new Date();
      const thirtyDaysLater = new Date(today);
      thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

      const { data, error } = await supabase
        .from("devices")
        .select("*")
        .gte("warranty_end_date", today.toISOString().split("T")[0])
        .lte("warranty_end_date", thirtyDaysLater.toISOString().split("T")[0])
        .eq("status", "active")
        .order("warranty_end_date", { ascending: true });

      if (error) throw error;
      return data as Device[];
    },
  });

  // Add device mutation
  const addDeviceMutation = useMutation({
    mutationFn: async (device: Omit<Device, "id" | "created_at" | "updated_at" | "warranty_end_date">) => {
      const { data, error } = await supabase
        .from("devices")
        .insert(device)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      queryClient.invalidateQueries({ queryKey: ["devices-expiring"] });
      toast({
        title: "تم إضافة الجهاز",
        description: "تم تسجيل الجهاز بنجاح",
      });
    },
    onError: (error) => {
      console.error("Error adding device:", error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة الجهاز",
        variant: "destructive",
      });
    },
  });

  // Update device mutation
  const updateDeviceMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Device> & { id: string }) => {
      const { data, error } = await supabase
        .from("devices")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      queryClient.invalidateQueries({ queryKey: ["devices-expiring"] });
      toast({
        title: "تم التحديث",
        description: "تم تحديث بيانات الجهاز",
      });
    },
    onError: (error) => {
      console.error("Error updating device:", error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث الجهاز",
        variant: "destructive",
      });
    },
  });

  // Delete device mutation
  const deleteDeviceMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("devices").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      queryClient.invalidateQueries({ queryKey: ["devices-expiring"] });
      toast({
        title: "تم الحذف",
        description: "تم حذف الجهاز",
      });
    },
    onError: (error) => {
      console.error("Error deleting device:", error);
      toast({
        title: "خطأ",
        description: "فشل في حذف الجهاز",
        variant: "destructive",
      });
    },
  });

  return {
    devices,
    expiringDevices,
    isLoading,
    error,
    addDevice: addDeviceMutation.mutate,
    updateDevice: updateDeviceMutation.mutate,
    deleteDevice: deleteDeviceMutation.mutate,
    isAdding: addDeviceMutation.isPending,
    isUpdating: updateDeviceMutation.isPending,
    isDeleting: deleteDeviceMutation.isPending,
    DEVICE_TYPES,
    WARRANTY_PERIODS,
  };
};

export const useMaintenanceLogs = (deviceId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch maintenance logs
  const { data: maintenanceLogs, isLoading } = useQuery({
    queryKey: ["maintenance-logs", deviceId],
    queryFn: async () => {
      let query = supabase
        .from("maintenance_logs")
        .select("*")
        .order("created_at", { ascending: false });

      if (deviceId) {
        query = query.eq("device_id", deviceId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as MaintenanceLog[];
    },
  });

  // Add maintenance log mutation
  const addMaintenanceLogMutation = useMutation({
    mutationFn: async (log: Omit<MaintenanceLog, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("maintenance_logs")
        .insert(log)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-logs"] });
      toast({
        title: "تم إضافة السجل",
        description: "تم تسجيل عملية الصيانة بنجاح",
      });
    },
    onError: (error) => {
      console.error("Error adding maintenance log:", error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة سجل الصيانة",
        variant: "destructive",
      });
    },
  });

  // Update maintenance log mutation
  const updateMaintenanceLogMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MaintenanceLog> & { id: string }) => {
      const { data, error } = await supabase
        .from("maintenance_logs")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-logs"] });
      toast({
        title: "تم التحديث",
        description: "تم تحديث سجل الصيانة",
      });
    },
    onError: (error) => {
      console.error("Error updating maintenance log:", error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث السجل",
        variant: "destructive",
      });
    },
  });

  return {
    maintenanceLogs,
    isLoading,
    addMaintenanceLog: addMaintenanceLogMutation.mutate,
    updateMaintenanceLog: updateMaintenanceLogMutation.mutate,
    isAdding: addMaintenanceLogMutation.isPending,
    isUpdating: updateMaintenanceLogMutation.isPending,
    MAINTENANCE_TYPES,
  };
};
