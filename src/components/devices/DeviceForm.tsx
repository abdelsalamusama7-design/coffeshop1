import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { useDevices, Device, DEVICE_TYPES, WARRANTY_PERIODS } from "@/hooks/useDevices";
import { useCustomers } from "@/hooks/useCustomers";

interface DeviceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  device?: Device;
}

const DeviceForm = ({ open, onOpenChange, device }: DeviceFormProps) => {
  const { addDevice, updateDevice, isAdding, isUpdating } = useDevices();
  const { customers } = useCustomers();

  const [formData, setFormData] = useState({
    customer_id: "",
    customer_name: "",
    device_type: "",
    device_model: "",
    serial_number: "",
    warranty_start_date: new Date().toISOString().split("T")[0],
    warranty_months: 12,
    installation_date: "",
    location_details: "",
    notes: "",
    status: "active" as Device["status"],
  });

  useEffect(() => {
    if (device) {
      setFormData({
        customer_id: device.customer_id || "",
        customer_name: device.customer_name,
        device_type: device.device_type,
        device_model: device.device_model || "",
        serial_number: device.serial_number,
        warranty_start_date: device.warranty_start_date,
        warranty_months: device.warranty_months,
        installation_date: device.installation_date || "",
        location_details: device.location_details || "",
        notes: device.notes || "",
        status: device.status,
      });
    } else {
      setFormData({
        customer_id: "",
        customer_name: "",
        device_type: "",
        device_model: "",
        serial_number: "",
        warranty_start_date: new Date().toISOString().split("T")[0],
        warranty_months: 12,
        installation_date: "",
        location_details: "",
        notes: "",
        status: "active",
      });
    }
  }, [device, open]);

  const handleCustomerChange = (customerId: string) => {
    const customer = customers?.find((c) => c.id === customerId);
    setFormData({
      ...formData,
      customer_id: customerId,
      customer_name: customer?.name || "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      ...formData,
      customer_id: formData.customer_id || null,
      device_model: formData.device_model || null,
      installation_date: formData.installation_date || null,
      location_details: formData.location_details || null,
      notes: formData.notes || null,
    };

    if (device) {
      updateDevice({ id: device.id, ...submitData });
    } else {
      addDevice(submitData);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {device ? "تعديل بيانات الجهاز" : "تسجيل جهاز جديد"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Selection */}
            <div className="space-y-2">
              <Label>العميل</Label>
              <Select
                value={formData.customer_id}
                onValueChange={handleCustomerChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر العميل" />
                </SelectTrigger>
                <SelectContent>
                  {customers?.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Customer Name (Manual) */}
            <div className="space-y-2">
              <Label>اسم العميل</Label>
              <Input
                value={formData.customer_name}
                onChange={(e) =>
                  setFormData({ ...formData, customer_name: e.target.value })
                }
                placeholder="أو أدخل اسم العميل يدوياً"
                required
              />
            </div>

            {/* Device Type */}
            <div className="space-y-2">
              <Label>نوع الجهاز *</Label>
              <Select
                value={formData.device_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, device_type: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع الجهاز" />
                </SelectTrigger>
                <SelectContent>
                  {DEVICE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Device Model */}
            <div className="space-y-2">
              <Label>الموديل</Label>
              <Input
                value={formData.device_model}
                onChange={(e) =>
                  setFormData({ ...formData, device_model: e.target.value })
                }
                placeholder="موديل الجهاز"
              />
            </div>

            {/* Serial Number */}
            <div className="space-y-2">
              <Label>الرقم التسلسلي *</Label>
              <Input
                value={formData.serial_number}
                onChange={(e) =>
                  setFormData({ ...formData, serial_number: e.target.value })
                }
                placeholder="Serial Number"
                required
                dir="ltr"
              />
            </div>

            {/* Warranty Start Date */}
            <div className="space-y-2">
              <Label>تاريخ بداية الضمان *</Label>
              <Input
                type="date"
                value={formData.warranty_start_date}
                onChange={(e) =>
                  setFormData({ ...formData, warranty_start_date: e.target.value })
                }
                required
              />
            </div>

            {/* Warranty Period */}
            <div className="space-y-2">
              <Label>مدة الضمان *</Label>
              <Select
                value={formData.warranty_months.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, warranty_months: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WARRANTY_PERIODS.map((period) => (
                    <SelectItem key={period.value} value={period.value.toString()}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Installation Date */}
            <div className="space-y-2">
              <Label>تاريخ التركيب</Label>
              <Input
                type="date"
                value={formData.installation_date}
                onChange={(e) =>
                  setFormData({ ...formData, installation_date: e.target.value })
                }
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>الحالة</Label>
              <Select
                value={formData.status}
                onValueChange={(value: Device["status"]) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="expired">منتهي الضمان</SelectItem>
                  <SelectItem value="under_repair">قيد الإصلاح</SelectItem>
                  <SelectItem value="replaced">تم استبداله</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location Details */}
          <div className="space-y-2">
            <Label>موقع التركيب</Label>
            <Input
              value={formData.location_details}
              onChange={(e) =>
                setFormData({ ...formData, location_details: e.target.value })
              }
              placeholder="تفاصيل موقع تركيب الجهاز"
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
              rows={3}
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
              {device ? "تحديث" : "تسجيل الجهاز"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DeviceForm;
