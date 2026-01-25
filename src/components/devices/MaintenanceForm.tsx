import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useMaintenanceLogs, MaintenanceLog, MAINTENANCE_TYPES } from "@/hooks/useDevices";

interface MaintenanceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deviceId: string;
  customerId?: string | null;
  log?: MaintenanceLog;
}

const MaintenanceForm = ({ open, onOpenChange, deviceId, customerId, log }: MaintenanceFormProps) => {
  const { addMaintenanceLog, updateMaintenanceLog, isAdding, isUpdating } = useMaintenanceLogs();

  const [formData, setFormData] = useState({
    device_id: deviceId,
    customer_id: customerId || null,
    maintenance_type: "repair" as MaintenanceLog["maintenance_type"],
    description: "",
    technician_name: "",
    cost: 0,
    is_warranty_claim: false,
    status: "pending" as MaintenanceLog["status"],
    scheduled_date: "",
    completed_date: "",
    notes: "",
  });

  useEffect(() => {
    if (log) {
      setFormData({
        device_id: log.device_id,
        customer_id: log.customer_id,
        maintenance_type: log.maintenance_type,
        description: log.description,
        technician_name: log.technician_name || "",
        cost: log.cost,
        is_warranty_claim: log.is_warranty_claim,
        status: log.status,
        scheduled_date: log.scheduled_date || "",
        completed_date: log.completed_date || "",
        notes: log.notes || "",
      });
    } else {
      setFormData({
        device_id: deviceId,
        customer_id: customerId || null,
        maintenance_type: "repair",
        description: "",
        technician_name: "",
        cost: 0,
        is_warranty_claim: false,
        status: "pending",
        scheduled_date: "",
        completed_date: "",
        notes: "",
      });
    }
  }, [log, deviceId, customerId, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      ...formData,
      technician_name: formData.technician_name || null,
      scheduled_date: formData.scheduled_date || null,
      completed_date: formData.completed_date || null,
      notes: formData.notes || null,
    };

    if (log) {
      updateMaintenanceLog({ id: log.id, ...submitData });
    } else {
      addMaintenanceLog(submitData);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {log ? "تعديل سجل الصيانة" : "إضافة سجل صيانة"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Maintenance Type */}
          <div className="space-y-2">
            <Label>نوع العملية *</Label>
            <Select
              value={formData.maintenance_type}
              onValueChange={(value: MaintenanceLog["maintenance_type"]) =>
                setFormData({ ...formData, maintenance_type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MAINTENANCE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>وصف المشكلة / العملية *</Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="وصف تفصيلي للمشكلة أو العملية"
              required
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Technician Name */}
            <div className="space-y-2">
              <Label>اسم الفني</Label>
              <Input
                value={formData.technician_name}
                onChange={(e) =>
                  setFormData({ ...formData, technician_name: e.target.value })
                }
                placeholder="اسم الفني المسؤول"
              />
            </div>

            {/* Cost */}
            <div className="space-y-2">
              <Label>التكلفة</Label>
              <Input
                type="number"
                value={formData.cost}
                onChange={(e) =>
                  setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })
                }
                min={0}
                step={0.01}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Scheduled Date */}
            <div className="space-y-2">
              <Label>تاريخ الموعد</Label>
              <Input
                type="date"
                value={formData.scheduled_date}
                onChange={(e) =>
                  setFormData({ ...formData, scheduled_date: e.target.value })
                }
              />
            </div>

            {/* Completed Date */}
            <div className="space-y-2">
              <Label>تاريخ الإنجاز</Label>
              <Input
                type="date"
                value={formData.completed_date}
                onChange={(e) =>
                  setFormData({ ...formData, completed_date: e.target.value })
                }
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>الحالة</Label>
            <Select
              value={formData.status}
              onValueChange={(value: MaintenanceLog["status"]) =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">قيد الانتظار</SelectItem>
                <SelectItem value="in_progress">جاري العمل</SelectItem>
                <SelectItem value="completed">مكتمل</SelectItem>
                <SelectItem value="cancelled">ملغي</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Warranty Claim */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div>
              <p className="font-medium">مطالبة ضمان</p>
              <p className="text-sm text-muted-foreground">هل هذه العملية تحت الضمان؟</p>
            </div>
            <Switch
              checked={formData.is_warranty_claim}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_warranty_claim: checked })
              }
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>ملاحظات</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="ملاحظات إضافية"
              rows={2}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isAdding || isUpdating}>
              {(isAdding || isUpdating) && (
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              )}
              {log ? "تحديث" : "إضافة"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MaintenanceForm;
