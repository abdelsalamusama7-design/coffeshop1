import MainLayout from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  TrendingUp,
  Package,
  FileText,
  Download,
  Calendar,
  MessageCircle,
  Printer,
} from "lucide-react";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { useInvoices } from "@/hooks/useInvoices";
import { useProducts } from "@/hooks/useProducts";
import { useReceipts } from "@/hooks/useReceipts";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const salesData = [
  { name: "يناير", sales: 45000 },
  { name: "فبراير", sales: 52000 },
  { name: "مارس", sales: 48000 },
  { name: "أبريل", sales: 61000 },
  { name: "مايو", sales: 55000 },
  { name: "يونيو", sales: 67000 },
];

const categoryData = [
  { name: "كاميرات", value: 45, color: "hsl(215, 70%, 45%)" },
  { name: "أجهزة تسجيل", value: 25, color: "hsl(145, 65%, 42%)" },
  { name: "كابلات", value: 15, color: "hsl(38, 92%, 50%)" },
  { name: "ملحقات", value: 15, color: "hsl(200, 80%, 50%)" },
];

const reportTypes = [
  {
    icon: TrendingUp,
    title: "تقرير المبيعات اليومي",
    description: "ملخص مبيعات اليوم مع تفاصيل الفواتير",
    gradient: "gradient-primary",
  },
  {
    icon: Package,
    title: "تقرير المخزون",
    description: "حالة المخزون الحالية وتنبيهات النفاد",
    gradient: "gradient-success",
  },
  {
    icon: FileText,
    title: "تقرير الفواتير",
    description: "ملخص الفواتير المدفوعة والمعلقة",
    gradient: "gradient-warning",
  },
  {
    icon: BarChart3,
    title: "تقرير الإيرادات",
    description: "تحليل الإيرادات والمصروفات",
    gradient: "gradient-danger",
  },
];

const Reports = () => {
  const { settings } = useCompanySettings();
  const { invoices } = useInvoices();
  const { products } = useProducts();
  const { receipts } = useReceipts();

  const today = new Date().toLocaleDateString("ar-LY", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Calculate report data
  const todayInvoices = invoices?.filter(
    (inv) => new Date(inv.created_at).toDateString() === new Date().toDateString()
  ) || [];
  const todaySales = todayInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const lowStockProducts = products?.filter((p) => p.stock <= p.min_stock) || [];
  const totalReceipts = receipts?.reduce((sum, r) => sum + r.amount, 0) || 0;

  const generateReportMessage = (reportType: string) => {
    const companyName = settings?.company_name || "شركة المراقب";
    let message = `📊 *${companyName}*\n`;
    message += `📅 التاريخ: ${today}\n\n`;

    switch (reportType) {
      case "daily":
        message += `📈 *تقرير المبيعات اليومي*\n`;
        message += `━━━━━━━━━━━━━━━\n`;
        message += `عدد الفواتير: ${todayInvoices.length}\n`;
        message += `إجمالي المبيعات: ${todaySales.toLocaleString()} د.ل\n`;
        break;
      case "inventory":
        message += `📦 *تقرير المخزون*\n`;
        message += `━━━━━━━━━━━━━━━\n`;
        message += `إجمالي الأصناف: ${products?.length || 0}\n`;
        message += `أصناف منخفضة المخزون: ${lowStockProducts.length}\n`;
        if (lowStockProducts.length > 0) {
          message += `\n⚠️ *أصناف تحتاج إعادة طلب:*\n`;
          lowStockProducts.slice(0, 5).forEach((p) => {
            message += `• ${p.name}: ${p.stock} (الحد الأدنى: ${p.min_stock})\n`;
          });
        }
        break;
      case "invoices":
        message += `📄 *تقرير الفواتير*\n`;
        message += `━━━━━━━━━━━━━━━\n`;
        message += `إجمالي الفواتير: ${invoices?.length || 0}\n`;
        const pendingInvoices = invoices?.filter((i) => i.status === "pending") || [];
        const paidInvoices = invoices?.filter((i) => i.status === "paid") || [];
        message += `فواتير مدفوعة: ${paidInvoices.length}\n`;
        message += `فواتير معلقة: ${pendingInvoices.length}\n`;
        break;
      case "revenue":
        message += `💰 *تقرير الإيرادات*\n`;
        message += `━━━━━━━━━━━━━━━\n`;
        message += `إجمالي الإيصالات: ${totalReceipts.toLocaleString()} د.ل\n`;
        message += `إجمالي المبيعات: ${invoices?.reduce((sum, i) => sum + i.total, 0)?.toLocaleString() || 0} د.ل\n`;
        break;
    }

    message += `\n━━━━━━━━━━━━━━━\n`;
    message += `${companyName}\n`;
    if (settings?.phone) message += `📞 ${settings.phone}`;

    return message;
  };

  const handleWhatsAppShare = (reportType: string) => {
    const message = generateReportMessage(reportType);
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, "_blank");
  };

  const handlePrint = (reportType: string) => {
    const message = generateReportMessage(reportType);
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html dir="rtl">
          <head>
            <title>تقرير - ${settings?.company_name || "شركة المراقب"}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
              body {
                font-family: 'Cairo', sans-serif;
                padding: 40px;
                white-space: pre-wrap;
                line-height: 1.8;
                font-size: 14px;
              }
              @media print {
                body { padding: 20px; }
              }
            </style>
          </head>
          <body>${message.replace(/\*/g, "").replace(/\n/g, "<br>")}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const reportTypes = [
    {
      id: "daily",
      icon: TrendingUp,
      title: "تقرير المبيعات اليومي",
      description: "ملخص مبيعات اليوم مع تفاصيل الفواتير",
      gradient: "gradient-primary",
    },
    {
      id: "inventory",
      icon: Package,
      title: "تقرير المخزون",
      description: "حالة المخزون الحالية وتنبيهات النفاد",
      gradient: "gradient-success",
    },
    {
      id: "invoices",
      icon: FileText,
      title: "تقرير الفواتير",
      description: "ملخص الفواتير المدفوعة والمعلقة",
      gradient: "gradient-warning",
    },
    {
      id: "revenue",
      icon: BarChart3,
      title: "تقرير الإيرادات",
      description: "تحليل الإيرادات والمصروفات",
      gradient: "gradient-danger",
    },
  ];

  return (
    <MainLayout title="التقارير" subtitle="عرض وتصدير التقارير المختلفة">
      {/* Quick Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {reportTypes.map((report, index) => (
          <Card
            key={index}
            className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
          >
            <div
              className={`w-12 h-12 rounded-xl ${report.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
            >
              <report.icon className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">{report.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="ghost" size="sm" className="text-primary p-0">
                <Download className="w-4 h-4 ml-1" />
                PDF
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-emerald-600 dark:text-emerald-400 p-0"
                onClick={() => handleWhatsAppShare(report.id)}
              >
                <MessageCircle className="w-4 h-4 ml-1" />
                واتساب
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary p-0"
                onClick={() => handlePrint(report.id)}
              >
                <Printer className="w-4 h-4 ml-1" />
                طباعة
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Bar Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-foreground">المبيعات الشهرية</h3>
              <p className="text-sm text-muted-foreground">
                آخر 6 أشهر
              </p>
            </div>
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 ml-2" />
              تغيير الفترة
            </Button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(215, 15%, 50%)", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(215, 15%, 50%)", fontSize: 12 }}
                  tickFormatter={(value) => `${value / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(0, 0%, 100%)",
                    border: "1px solid hsl(214, 20%, 88%)",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`${value.toLocaleString()} ر.س`, "المبيعات"]}
                />
                <Bar
                  dataKey="sales"
                  fill="hsl(215, 70%, 45%)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Pie Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-foreground">المبيعات حسب التصنيف</h3>
              <p className="text-sm text-muted-foreground">
                توزيع المبيعات
              </p>
            </div>
          </div>
          <div className="h-64 flex items-center">
            <ResponsiveContainer width="60%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value}%`, "النسبة"]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {categoryData.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-muted-foreground flex-1">
                    {item.name}
                  </span>
                  <span className="text-sm font-semibold">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Reports;
