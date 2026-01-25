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
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, Minus, Calculator, Camera, HardDrive, Cable, Settings } from "lucide-react";
import {
  QuotationInput,
  CAMERA_TYPES,
  DVR_TYPES,
  HARD_DISK_TYPES,
  ACCESSORIES,
} from "@/hooks/useQuotations";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { Customer } from "@/hooks/useCustomers";

interface QuotationFormProps {
  customers: Customer[];
  onSubmit: (data: QuotationInput) => void;
  onCancel: () => void;
  initialData?: QuotationInput;
  isEditing?: boolean;
}

interface SelectedAccessory {
  name: string;
  label: string;
  quantity: number;
  price: number;
}

const QuotationForm = ({
  customers,
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
}: QuotationFormProps) => {
  const { settings } = useCompanySettings();
  
  // Form state
  const [customerId, setCustomerId] = useState(initialData?.customer_id || "");
  const [customerName, setCustomerName] = useState(initialData?.customer_name || "");
  const [customerPhone, setCustomerPhone] = useState(initialData?.customer_phone || "");
  const [cameraCount, setCameraCount] = useState(initialData?.camera_count || 4);
  const [cameraType, setCameraType] = useState(initialData?.camera_type || "2MP Indoor");
  const [dvrType, setDvrType] = useState(initialData?.dvr_type || "DVR 4CH");
  const [hardDisk, setHardDisk] = useState(initialData?.hard_disk || "1TB");
  const [cableLength, setCableLength] = useState(initialData?.cable_length || 50);
  const [discount, setDiscount] = useState(initialData?.discount || 0);
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [selectedAccessories, setSelectedAccessories] = useState<SelectedAccessory[]>([]);

  // Calculated values
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);

  // Calculate prices
  useEffect(() => {
    const cameraPrice = CAMERA_TYPES.find(c => c.value === cameraType)?.price || 0;
    const dvrPrice = DVR_TYPES.find(d => d.value === dvrType)?.price || 0;
    const hdPrice = HARD_DISK_TYPES.find(h => h.value === hardDisk)?.price || 0;
    const cablePrice = cableLength * 3; // 3 LYD per meter

    const accessoriesTotal = selectedAccessories.reduce(
      (sum, acc) => sum + acc.price * acc.quantity,
      0
    );

    const calculatedSubtotal =
      cameraPrice * cameraCount + dvrPrice + hdPrice + cablePrice + accessoriesTotal;

    const calculatedTax = settings?.auto_tax
      ? (calculatedSubtotal - discount) * ((settings.tax_rate || 15) / 100)
      : 0;

    const calculatedTotal = calculatedSubtotal - discount + calculatedTax;

    setSubtotal(calculatedSubtotal);
    setTax(calculatedTax);
    setTotal(calculatedTotal);
  }, [cameraCount, cameraType, dvrType, hardDisk, cableLength, discount, selectedAccessories, settings]);

  // Handle customer selection
  const handleCustomerSelect = (id: string) => {
    setCustomerId(id);
    const customer = customers.find(c => c.id === id);
    if (customer) {
      setCustomerName(customer.name);
      setCustomerPhone(customer.phone || "");
    }
  };

  // Handle accessory toggle
  const toggleAccessory = (accessory: typeof ACCESSORIES[0]) => {
    const existing = selectedAccessories.find(a => a.name === accessory.name);
    if (existing) {
      setSelectedAccessories(selectedAccessories.filter(a => a.name !== accessory.name));
    } else {
      setSelectedAccessories([
        ...selectedAccessories,
        { name: accessory.name, label: accessory.label, quantity: 1, price: accessory.price },
      ]);
    }
  };

  // Update accessory quantity
  const updateAccessoryQuantity = (name: string, delta: number) => {
    setSelectedAccessories(
      selectedAccessories.map(a => {
        if (a.name === name) {
          const newQty = Math.max(1, a.quantity + delta);
          return { ...a, quantity: newQty };
        }
        return a;
      })
    );
  };

  // Handle submit
  const handleSubmit = () => {
    if (!customerName.trim()) {
      return;
    }

    const quotationData: QuotationInput = {
      customer_id: customerId || undefined,
      customer_name: customerName,
      customer_phone: customerPhone || undefined,
      camera_count: cameraCount,
      camera_type: cameraType,
      dvr_type: dvrType,
      hard_disk: hardDisk,
      cable_length: cableLength,
      subtotal,
      discount,
      tax,
      total,
      notes: notes || undefined,
      items: selectedAccessories.map(acc => ({
        item_name: acc.label,
        quantity: acc.quantity,
        unit_price: acc.price,
        total: acc.price * acc.quantity,
      })),
    };

    onSubmit(quotationData);
  };

  return (
    <div className="space-y-6">
      {/* Customer Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5" />
            بيانات العميل
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>اختيار عميل موجود</Label>
              <Select value={customerId} onValueChange={handleCustomerSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر عميل..." />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(customer => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>اسم العميل *</Label>
              <Input
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="اسم العميل"
              />
            </div>
            <div className="space-y-2">
              <Label>رقم الهاتف</Label>
              <Input
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                placeholder="رقم الهاتف"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Camera System Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Camera className="h-5 w-5" />
            نظام الكاميرات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>عدد الكاميرات</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setCameraCount(Math.max(1, cameraCount - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={cameraCount}
                  onChange={e => setCameraCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="text-center"
                  min={1}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setCameraCount(cameraCount + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>نوع الكاميرا</Label>
              <Select value={cameraType} onValueChange={setCameraType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CAMERA_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label} - {type.price} د.ل
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>جهاز التسجيل</Label>
              <Select value={dvrType} onValueChange={setDvrType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DVR_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label} - {type.price} د.ل
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>القرص الصلب</Label>
              <Select value={hardDisk} onValueChange={setHardDisk}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HARD_DISK_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label} - {type.price} د.ل
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Cable className="h-4 w-4" />
                طول السلك (متر) - 3 د.ل/متر
              </Label>
              <Input
                type="number"
                value={cableLength}
                onChange={e => setCableLength(Math.max(0, parseInt(e.target.value) || 0))}
                min={0}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accessories Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            الإكسسوارات والإضافات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {ACCESSORIES.map(accessory => {
              const selected = selectedAccessories.find(a => a.name === accessory.name);
              return (
                <div
                  key={accessory.name}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selected ? "border-primary bg-primary/5" : "hover:border-muted-foreground"
                  }`}
                  onClick={() => toggleAccessory(accessory)}
                >
                  <div className="flex items-start gap-2">
                    <Checkbox checked={!!selected} />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{accessory.label}</p>
                      <p className="text-xs text-muted-foreground">{accessory.price} د.ل</p>
                    </div>
                  </div>
                  {selected && (
                    <div className="flex items-center gap-2 mt-2" onClick={e => e.stopPropagation()}>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => updateAccessoryQuantity(accessory.name, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-medium">{selected.quantity}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => updateAccessoryQuantity(accessory.name, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Summary Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            الملخص والتكلفة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>الخصم (د.ل)</Label>
              <Input
                type="number"
                value={discount}
                onChange={e => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label>ملاحظات</Label>
              <Textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="ملاحظات إضافية..."
                rows={2}
              />
            </div>
          </div>

          <Separator />

          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>المجموع الفرعي:</span>
              <span>{subtotal.toFixed(2)} د.ل</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>الخصم:</span>
                <span>-{discount.toFixed(2)} د.ل</span>
              </div>
            )}
            {tax > 0 && (
              <div className="flex justify-between text-sm">
                <span>الضريبة ({settings?.tax_rate || 15}%):</span>
                <span>{tax.toFixed(2)} د.ل</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>الإجمالي:</span>
              <span className="text-primary">{total.toFixed(2)} د.ل</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
        <Button onClick={handleSubmit} disabled={!customerName.trim()}>
          {isEditing ? "تحديث عرض السعر" : "إنشاء عرض السعر"}
        </Button>
      </div>
    </div>
  );
};

export default QuotationForm;
