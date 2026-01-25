import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Loader2, CheckCircle2, XCircle, History } from "lucide-react";
import { useBackupSchedule } from "@/hooks/useBackupSchedule";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const BackupScheduleSection = () => {
  const {
    scheduleSettings,
    backupLogs,
    isLoadingSettings,
    updateSchedule,
    isUpdating,
    DAYS_OF_WEEK,
  } = useBackupSchedule();

  const [enabled, setEnabled] = useState(false);
  const [schedule, setSchedule] = useState<"daily" | "weekly">("daily");
  const [day, setDay] = useState(0);
  const [time, setTime] = useState("02:00");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (scheduleSettings) {
      setEnabled(scheduleSettings.backup_enabled || false);
      setSchedule(scheduleSettings.backup_schedule || "daily");
      setDay(scheduleSettings.backup_day || 0);
      setTime(scheduleSettings.backup_time?.slice(0, 5) || "02:00");
      setEmail(scheduleSettings.backup_email || "");
    }
  }, [scheduleSettings]);

  const handleSave = () => {
    updateSchedule({
      backup_enabled: enabled,
      backup_schedule: schedule,
      backup_day: day,
      backup_time: time + ":00",
      backup_email: email || null,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle2 className="w-3 h-3 ml-1" />
            ناجح
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
            <XCircle className="w-3 h-3 ml-1" />
            فشل
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
            <Loader2 className="w-3 h-3 ml-1 animate-spin" />
            جاري
          </Badge>
        );
      default:
        return null;
    }
  };

  if (isLoadingSettings) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
          <Clock className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">جدولة النسخ الاحتياطي التلقائي</h3>
          <p className="text-sm text-muted-foreground">
            إعداد نسخ احتياطي تلقائي يومي أو أسبوعي
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Enable/Disable */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">تفعيل النسخ الاحتياطي التلقائي</p>
            <p className="text-sm text-muted-foreground">
              إنشاء نسخة احتياطية تلقائياً حسب الجدول المحدد
            </p>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>

        {enabled && (
          <>
            <Separator />

            {/* Schedule Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>نوع الجدولة</Label>
                <Select
                  value={schedule}
                  onValueChange={(value: "daily" | "weekly") => setSchedule(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">يومياً</SelectItem>
                    <SelectItem value="weekly">أسبوعياً</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {schedule === "weekly" && (
                <div className="space-y-2">
                  <Label>يوم الأسبوع</Label>
                  <Select
                    value={day.toString()}
                    onValueChange={(value) => setDay(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OF_WEEK.map((d) => (
                        <SelectItem key={d.value} value={d.value.toString()}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>وقت النسخ الاحتياطي</Label>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>بريد إشعار النسخ (اختياري)</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="backup@example.com"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Last Backup Info */}
            {scheduleSettings?.last_backup_at && (
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">آخر نسخة احتياطية:</span>
                  <span className="font-medium">
                    {format(new Date(scheduleSettings.last_backup_at), "PPpp", {
                      locale: ar,
                    })}
                  </span>
                </div>
              </div>
            )}
          </>
        )}

        <Button onClick={handleSave} disabled={isUpdating}>
          {isUpdating ? (
            <>
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            "حفظ إعدادات الجدولة"
          )}
        </Button>

        {/* Backup History */}
        {backupLogs && backupLogs.length > 0 && (
          <>
            <Separator />
            <div>
              <div className="flex items-center gap-2 mb-4">
                <History className="w-4 h-4 text-muted-foreground" />
                <h4 className="font-medium">سجل النسخ الاحتياطية</h4>
              </div>
              <div className="space-y-2">
                {backupLogs.slice(0, 5).map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusBadge(log.status)}
                      <span className="text-sm text-muted-foreground">
                        {log.triggered_by === "scheduled" ? "تلقائي" : "يدوي"}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(log.created_at), "Pp", { locale: ar })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};

export default BackupScheduleSection;
