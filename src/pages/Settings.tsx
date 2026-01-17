import MainLayout from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  Printer,
  Bell,
  Shield,
  Database,
  Palette,
} from "lucide-react";

const Settings = () => {
  return (
    <MainLayout title="الإعدادات" subtitle="إدارة إعدادات النظام">
      <div className="max-w-4xl space-y-6">
        {/* Company Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">بيانات الشركة</h3>
              <p className="text-sm text-muted-foreground">معلومات الشركة الأساسية</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>اسم الشركة</Label>
              <Input defaultValue="شركة المراقب لكاميرات المراقبة" />
            </div>
            <div className="space-y-2">
              <Label>رقم الهاتف</Label>
              <Input defaultValue="0501234567" />
            </div>
            <div className="space-y-2">
              <Label>البريد الإلكتروني</Label>
              <Input defaultValue="info@almoraqib.com" />
            </div>
            <div className="space-y-2">
              <Label>الرقم الضريبي</Label>
              <Input defaultValue="300123456789012" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>العنوان</Label>
              <Input defaultValue="الرياض، حي النخيل، شارع العليا" />
            </div>
          </div>
          <Button className="mt-4 gradient-primary border-0">حفظ التغييرات</Button>
        </Card>

        {/* Invoice Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg gradient-success flex items-center justify-center">
              <Printer className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">إعدادات الفواتير</h3>
              <p className="text-sm text-muted-foreground">تخصيص الفواتير والطباعة</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">إضافة الضريبة تلقائياً</p>
                <p className="text-sm text-muted-foreground">إضافة ضريبة القيمة المضافة 15%</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">طباعة تلقائية</p>
                <p className="text-sm text-muted-foreground">طباعة الفاتورة عند الحفظ</p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">رقم الفاتورة التسلسلي</p>
                <p className="text-sm text-muted-foreground">بادئة رقم الفاتورة</p>
              </div>
              <Input defaultValue="INV-2024-" className="w-40" />
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg gradient-warning flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">التنبيهات</h3>
              <p className="text-sm text-muted-foreground">إدارة التنبيهات والإشعارات</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">تنبيه نفاد المخزون</p>
                <p className="text-sm text-muted-foreground">عند انخفاض الكمية عن الحد الأدنى</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">تنبيه الفواتير المتأخرة</p>
                <p className="text-sm text-muted-foreground">عند تأخر سداد الفاتورة</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">ملخص يومي بالبريد</p>
                <p className="text-sm text-muted-foreground">إرسال تقرير يومي للمبيعات</p>
              </div>
              <Switch />
            </div>
          </div>
        </Card>

        {/* Backup */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg gradient-danger flex items-center justify-center">
              <Database className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">النسخ الاحتياطي</h3>
              <p className="text-sm text-muted-foreground">إدارة النسخ الاحتياطية للبيانات</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline">
              <Database className="w-4 h-4 ml-2" />
              إنشاء نسخة احتياطية
            </Button>
            <Button variant="outline">استعادة نسخة احتياطية</Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            آخر نسخة احتياطية: ١٥ يناير ٢٠٢٤ - ١٠:٣٠ ص
          </p>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Settings;
