import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BackupScheduleSettings {
  backup_enabled: boolean;
  backup_schedule: "daily" | "weekly";
  backup_day: number;
  backup_time: string;
  last_backup_at: string | null;
  backup_email: string | null;
}

interface BackupLog {
  id: string;
  created_at: string;
  status: "success" | "failed" | "in_progress";
  file_size: number | null;
  records_count: Record<string, number> | null;
  error_message: string | null;
  triggered_by: "manual" | "scheduled";
}

const DAYS_OF_WEEK = [
  { value: 0, label: "الأحد" },
  { value: 1, label: "الإثنين" },
  { value: 2, label: "الثلاثاء" },
  { value: 3, label: "الأربعاء" },
  { value: 4, label: "الخميس" },
  { value: 5, label: "الجمعة" },
  { value: 6, label: "السبت" },
];

export const useBackupSchedule = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch backup schedule settings
  const { data: scheduleSettings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["backup-schedule-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_settings")
        .select("backup_enabled, backup_schedule, backup_day, backup_time, last_backup_at, backup_email")
        .limit(1)
        .single();

      if (error) throw error;
      return data as BackupScheduleSettings;
    },
  });

  // Fetch backup logs
  const { data: backupLogs, isLoading: isLoadingLogs } = useQuery({
    queryKey: ["backup-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("backup_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as BackupLog[];
    },
  });

  // Update backup schedule settings
  const updateScheduleMutation = useMutation({
    mutationFn: async (settings: Partial<BackupScheduleSettings>) => {
      const { data: existingSettings } = await supabase
        .from("company_settings")
        .select("id")
        .limit(1)
        .single();

      if (existingSettings) {
        const { error } = await supabase
          .from("company_settings")
          .update(settings)
          .eq("id", existingSettings.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backup-schedule-settings"] });
      toast({
        title: "تم الحفظ",
        description: "تم تحديث إعدادات جدولة النسخ الاحتياطي",
      });
    },
    onError: (error) => {
      console.error("Error updating backup schedule:", error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث إعدادات الجدولة",
        variant: "destructive",
      });
    },
  });

  // Log a backup attempt
  const logBackup = async (
    status: "success" | "failed" | "in_progress",
    triggeredBy: "manual" | "scheduled",
    recordsCount?: Record<string, number>,
    fileSize?: number,
    errorMessage?: string
  ) => {
    const { error } = await supabase.from("backup_logs").insert({
      status,
      triggered_by: triggeredBy,
      records_count: recordsCount || null,
      file_size: fileSize || null,
      error_message: errorMessage || null,
    });

    if (error) {
      console.error("Error logging backup:", error);
    }

    queryClient.invalidateQueries({ queryKey: ["backup-logs"] });
  };

  // Update last backup timestamp
  const updateLastBackup = async () => {
    const { data: existingSettings } = await supabase
      .from("company_settings")
      .select("id")
      .limit(1)
      .single();

    if (existingSettings) {
      await supabase
        .from("company_settings")
        .update({ last_backup_at: new Date().toISOString() })
        .eq("id", existingSettings.id);
    }

    queryClient.invalidateQueries({ queryKey: ["backup-schedule-settings"] });
  };

  return {
    scheduleSettings,
    backupLogs,
    isLoadingSettings,
    isLoadingLogs,
    updateSchedule: updateScheduleMutation.mutate,
    isUpdating: updateScheduleMutation.isPending,
    logBackup,
    updateLastBackup,
    DAYS_OF_WEEK,
  };
};
