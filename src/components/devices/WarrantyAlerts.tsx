import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Calendar, User, Cpu } from "lucide-react";
import { useDevices, DEVICE_TYPES } from "@/hooks/useDevices";
import { format, differenceInDays } from "date-fns";
import { ar } from "date-fns/locale";

interface WarrantyAlertsProps {
  onViewDevice?: (deviceId: string) => void;
}

const WarrantyAlerts = ({ onViewDevice }: WarrantyAlertsProps) => {
  const { expiringDevices } = useDevices();

  if (!expiringDevices || expiringDevices.length === 0) {
    return null;
  }

  const getDeviceTypeLabel = (type: string) => {
    return DEVICE_TYPES.find((t) => t.value === type)?.label || type;
  };

  const getDaysRemaining = (endDate: string) => {
    return differenceInDays(new Date(endDate), new Date());
  };

  const getUrgencyColor = (days: number) => {
    if (days <= 7) return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
    if (days <= 14) return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
    return "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400";
  };

  return (
    <Card className="p-4 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-amber-600" />
        <h3 className="font-semibold text-amber-800 dark:text-amber-200">
          تنبيهات انتهاء الضمان ({expiringDevices.length})
        </h3>
      </div>

      <div className="space-y-3">
        {expiringDevices.slice(0, 5).map((device) => {
          const daysRemaining = getDaysRemaining(device.warranty_end_date!);

          return (
            <div
              key={device.id}
              className="flex items-center justify-between p-3 rounded-lg bg-background border"
            >
              <div className="flex items-center gap-3">
                <Cpu className="w-8 h-8 text-muted-foreground" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{getDeviceTypeLabel(device.device_type)}</span>
                    <Badge variant="outline" className="text-xs">
                      {device.serial_number}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-3 h-3" />
                    {device.customer_name}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-left">
                  <Badge className={getUrgencyColor(daysRemaining)}>
                    {daysRemaining <= 0 ? "منتهي!" : `${daysRemaining} يوم متبقي`}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(device.warranty_end_date!), "d MMM yyyy", { locale: ar })}
                  </div>
                </div>
                {onViewDevice && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDevice(device.id)}
                  >
                    عرض
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default WarrantyAlerts;
