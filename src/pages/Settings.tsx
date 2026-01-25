import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  Printer,
  Bell,
  Loader2,
} from "lucide-react";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import BackupSection from "@/components/settings/BackupSection";
import BackupScheduleSection from "@/components/settings/BackupScheduleSection";

const Settings = () => {
  const { settings, isLoading, updateSettings, isUpdating } = useCompanySettings();
  
  // Company data state
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [address, setAddress] = useState("");
  
  // Invoice settings state
  const [autoTax, setAutoTax] = useState(true);
  const [autoPrint, setAutoPrint] = useState(false);
  const [invoicePrefix, setInvoicePrefix] = useState("INV-");
  
  // Notification settings state
  const [lowStockAlert, setLowStockAlert] = useState(true);
  const [lateInvoiceAlert, setLateInvoiceAlert] = useState(true);
  const [dailySummaryEmail, setDailySummaryEmail] = useState(false);

  // Load settings when data is available
  useEffect(() => {
    if (settings) {
      setCompanyName(settings.company_name || "");
      setPhone(settings.phone || "");
      setEmail(settings.email || "");
      setTaxNumber(settings.tax_number || "");
      setAddress(settings.address || "");
      setAutoTax(settings.auto_tax ?? true);
      setAutoPrint(settings.auto_print ?? false);
      setInvoicePrefix(settings.invoice_prefix || "INV-");
      setLowStockAlert(settings.low_stock_alert ?? true);
      setLateInvoiceAlert(settings.late_invoice_alert ?? true);
      setDailySummaryEmail(settings.daily_summary_email ?? false);
    }
  }, [settings]);

  const handleSaveCompanyData = () => {
    updateSettings({
      company_name: companyName,
      phone,
      email,
      tax_number: taxNumber,
      address,
    });
  };

  const handleSaveInvoiceSettings = () => {
    updateSettings({
      auto_tax: autoTax,
      auto_print: autoPrint,
      invoice_prefix: invoicePrefix,
    });
  };

  const handleSaveNotificationSettings = () => {
    updateSettings({
      low_stock_alert: lowStockAlert,
      late_invoice_alert: lateInvoiceAlert,
      daily_summary_email: dailySummaryEmail,
    });
  };

  if (isLoading) {
    return (
      <MainLayout title="الإعدادات" subtitle="إدارة إعدادات النظام">
        <div className="max-w-4xl space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-10 w-48 mb-6" />
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </Card>
          ))}
        </div>
      </MainLayout>
    );
  }

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
              <Input 
                value={companyName} 
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="اسم الشركة"
              />
            </div>
            <div className="space-y-2">
              <Label>رقم الهاتف</Label>
              <Input 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0911234567"
              />
            </div>
            <div className="space-y-2">
              <Label>البريد الإلكتروني</Label>
              <Input 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="info@company.ly"
              />
            </div>
            <div className="space-y-2">
              <Label>الرقم الضريبي</Label>
              <Input 
                value={taxNumber} 
                onChange={(e) => setTaxNumber(e.target.value)}
                placeholder="300123456789012"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>العنوان</Label>
              <Input 
                value={address} 
                onChange={(e) => setAddress(e.target.value)}
                placeholder="طرابلس، ليبيا"
              />
            </div>
          </div>
          <Button 
            className="mt-4 gradient-primary border-0" 
            onClick={handleSaveCompanyData}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              "حفظ التغييرات"
            )}
          </Button>
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
              <Switch 
                checked={autoTax} 
                onCheckedChange={setAutoTax}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">طباعة تلقائية</p>
                <p className="text-sm text-muted-foreground">طباعة الفاتورة عند الحفظ</p>
              </div>
              <Switch 
                checked={autoPrint} 
                onCheckedChange={setAutoPrint}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">رقم الفاتورة التسلسلي</p>
                <p className="text-sm text-muted-foreground">بادئة رقم الفاتورة</p>
              </div>
              <Input 
                value={invoicePrefix} 
                onChange={(e) => setInvoicePrefix(e.target.value)}
                className="w-40" 
              />
            </div>
          </div>
          <Button 
            className="mt-4" 
            variant="outline"
            onClick={handleSaveInvoiceSettings}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              "حفظ إعدادات الفواتير"
            )}
          </Button>
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
              <Switch 
                checked={lowStockAlert} 
                onCheckedChange={setLowStockAlert}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">تنبيه الفواتير المتأخرة</p>
                <p className="text-sm text-muted-foreground">عند تأخر سداد الفاتورة</p>
              </div>
              <Switch 
                checked={lateInvoiceAlert} 
                onCheckedChange={setLateInvoiceAlert}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">ملخص يومي بالبريد</p>
                <p className="text-sm text-muted-foreground">إرسال تقرير يومي للمبيعات</p>
              </div>
              <Switch 
                checked={dailySummaryEmail} 
                onCheckedChange={setDailySummaryEmail}
              />
            </div>
          </div>
          <Button 
            className="mt-4" 
            variant="outline"
            onClick={handleSaveNotificationSettings}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              "حفظ إعدادات التنبيهات"
            )}
          </Button>
        </Card>

        {/* Backup Section */}
        <BackupSection />

        {/* Backup Schedule Section */}
        <BackupScheduleSection />
      </div>
    </MainLayout>
  );
};

export default Settings;
