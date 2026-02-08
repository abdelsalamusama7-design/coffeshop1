import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWorker } from "@/contexts/WorkerContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TrendingUp,
  Coffee,
  DollarSign,
  Users,
  ArrowRight,
  MessageCircle,
  Printer,
  Mail,
  Calendar as CalendarIcon,
  Package,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from "date-fns";
import { ar } from "date-fns/locale";

interface QuickSale {
  id: string;
  worker_id: string;
  product_name: string;
  category: string;
  quantity: number;
  unit_price: number;
  cost_price: number;
  total: number;
  profit: number;
  sale_date: string;
  created_at: string;
  workers?: {
    name: string;
  };
}

interface Worker {
  id: string;
  name: string;
}

const CoffeeReports = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [reportPeriod, setReportPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const { isAdmin, hasPermission, worker } = useWorker();
  const navigate = useNavigate();

  const canViewCost = hasPermission("can_view_cost");

  // حساب نطاق التواريخ
  const getDateRange = () => {
    switch (reportPeriod) {
      case "daily":
        return {
          start: format(selectedDate, "yyyy-MM-dd"),
          end: format(selectedDate, "yyyy-MM-dd"),
        };
      case "weekly":
        return {
          start: format(startOfWeek(selectedDate, { locale: ar }), "yyyy-MM-dd"),
          end: format(endOfWeek(selectedDate, { locale: ar }), "yyyy-MM-dd"),
        };
      case "monthly":
        return {
          start: format(startOfMonth(selectedDate), "yyyy-MM-dd"),
          end: format(endOfMonth(selectedDate), "yyyy-MM-dd"),
        };
    }
  };

  const dateRange = getDateRange();

  // جلب المبيعات
  const { data: sales = [], isLoading } = useQuery({
    queryKey: ["quick-sales-report", dateRange.start, dateRange.end],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quick_sales")
        .select("*, workers(name)")
        .gte("sale_date", dateRange.start)
        .lte("sale_date", dateRange.end)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as QuickSale[];
    },
  });

  // جلب العمال
  const { data: workers = [] } = useQuery({
    queryKey: ["workers-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workers")
        .select("id, name")
        .eq("is_active", true);
      if (error) throw error;
      return data as Worker[];
    },
  });

  // إحصائيات
  const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
  const totalCost = sales.reduce((sum, s) => sum + s.cost_price * s.quantity, 0);
  const totalProfit = sales.reduce((sum, s) => sum + (s.profit || 0), 0);
  const totalItems = sales.reduce((sum, s) => sum + s.quantity, 0);

  // مبيعات حسب الفئة
  const salesByCategory = sales.reduce((acc, sale) => {
    if (!acc[sale.category]) {
      acc[sale.category] = { total: 0, quantity: 0, profit: 0 };
    }
    acc[sale.category].total += sale.total;
    acc[sale.category].quantity += sale.quantity;
    acc[sale.category].profit += sale.profit || 0;
    return acc;
  }, {} as Record<string, { total: number; quantity: number; profit: number }>);

  // مبيعات حسب العامل
  const salesByWorker = sales.reduce((acc, sale) => {
    const workerName = sale.workers?.name || "غير معروف";
    if (!acc[workerName]) {
      acc[workerName] = { total: 0, quantity: 0, profit: 0 };
    }
    acc[workerName].total += sale.total;
    acc[workerName].quantity += sale.quantity;
    acc[workerName].profit += sale.profit || 0;
    return acc;
  }, {} as Record<string, { total: number; quantity: number; profit: number }>);

  // توليد نص التقرير
  const generateReportText = () => {
    const periodText =
      reportPeriod === "daily"
        ? format(selectedDate, "EEEE d MMMM yyyy", { locale: ar })
        : reportPeriod === "weekly"
        ? `الأسبوع ${format(new Date(dateRange.start), "d MMM", { locale: ar })} - ${format(new Date(dateRange.end), "d MMM", { locale: ar })}`
        : format(selectedDate, "MMMM yyyy", { locale: ar });

    let text = `☕ *تقرير المبيعات*\n`;
    text += `📅 ${periodText}\n`;
    text += `━━━━━━━━━━━━━━━\n\n`;

    text += `📊 *الإحصائيات العامة*\n`;
    text += `• عدد المبيعات: ${totalItems}\n`;
    text += `• إجمالي المبيعات: ${totalSales.toFixed(2)} ر.س\n`;
    if (canViewCost) {
      text += `• إجمالي التكلفة: ${totalCost.toFixed(2)} ر.س\n`;
      text += `• صافي الربح: ${totalProfit.toFixed(2)} ر.س\n`;
    }

    text += `\n📦 *المبيعات حسب القسم*\n`;
    Object.entries(salesByCategory).forEach(([cat, data]) => {
      text += `• ${cat}: ${data.quantity} (${data.total.toFixed(2)} ر.س)`;
      if (canViewCost) text += ` - ربح: ${data.profit.toFixed(2)}`;
      text += `\n`;
    });

    if (isAdmin) {
      text += `\n👥 *مبيعات العمال*\n`;
      Object.entries(salesByWorker).forEach(([name, data]) => {
        text += `• ${name}: ${data.quantity} (${data.total.toFixed(2)} ر.س)\n`;
      });
    }

    text += `\n━━━━━━━━━━━━━━━`;

    return text;
  };

  const handleWhatsApp = () => {
    const text = generateReportText();
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleEmail = () => {
    const text = generateReportText();
    const subject = `تقرير المبيعات - ${format(selectedDate, "yyyy-MM-dd")}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`, "_blank");
  };

  const handlePrint = () => {
    const text = generateReportText();
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html dir="rtl">
          <head>
            <title>تقرير المبيعات</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
              body {
                font-family: 'Cairo', sans-serif;
                padding: 40px;
                white-space: pre-wrap;
                line-height: 2;
                font-size: 14px;
                background: #fff;
                color: #000;
              }
            </style>
          </head>
          <body>${text.replace(/\*/g, "").replace(/\n/g, "<br>")}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/pos")}>
              <ArrowRight className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="h-6 w-6" />
                التقارير
              </h1>
              <p className="text-muted-foreground text-sm">تقارير المبيعات والأرباح</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleWhatsApp} className="gap-1">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">واتساب</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleEmail} className="gap-1">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">إيميل</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1">
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">طباعة</span>
            </Button>
          </div>
        </div>

        {/* Period Tabs */}
        <Tabs value={reportPeriod} onValueChange={(v) => setReportPeriod(v as typeof reportPeriod)} className="mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="daily">يومي</TabsTrigger>
            <TabsTrigger value="weekly">أسبوعي</TabsTrigger>
            <TabsTrigger value="monthly">شهري</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarIcon className="h-4 w-4" />
                التاريخ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                locale={ar}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          {/* Stats & Data */}
          <div className="lg:col-span-3 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Coffee className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">عدد المبيعات</p>
                    <p className="text-xl font-bold text-foreground">{totalItems}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">إجمالي المبيعات</p>
                    <p className="text-xl font-bold text-foreground">{totalSales.toFixed(2)}</p>
                  </div>
                </div>
              </Card>

              {canViewCost && (
                <>
                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
                        <Package className="h-5 w-5 text-warning" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">التكلفة</p>
                        <p className="text-xl font-bold text-foreground">{totalCost.toFixed(2)}</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">صافي الربح</p>
                        <p className="text-xl font-bold text-success">{totalProfit.toFixed(2)}</p>
                      </div>
                    </div>
                  </Card>
                </>
              )}
            </div>

            {/* Sales by Category */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">المبيعات حسب القسم</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(salesByCategory).length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">لا توجد مبيعات</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(salesByCategory).map(([cat, data]) => (
                      <div key={cat} className="p-3 bg-secondary rounded-lg">
                        <p className="font-medium text-foreground">{cat}</p>
                        <p className="text-sm text-muted-foreground">{data.quantity} قطعة</p>
                        <p className="text-lg font-bold text-primary">{data.total.toFixed(2)} ر.س</p>
                        {canViewCost && (
                          <p className="text-xs text-success">ربح: {data.profit.toFixed(2)}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sales by Worker (Admin only) */}
            {isAdmin && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="h-4 w-4" />
                    مبيعات العمال
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.keys(salesByWorker).length === 0 ? (
                    <p className="text-center py-4 text-muted-foreground">لا توجد مبيعات</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>العامل</TableHead>
                          <TableHead>عدد المبيعات</TableHead>
                          <TableHead>الإجمالي</TableHead>
                          {canViewCost && <TableHead>الربح</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(salesByWorker).map(([name, data]) => (
                          <TableRow key={name}>
                            <TableCell className="font-medium">{name}</TableCell>
                            <TableCell>{data.quantity}</TableCell>
                            <TableCell>{data.total.toFixed(2)} ر.س</TableCell>
                            {canViewCost && (
                              <TableCell className="text-success">{data.profit.toFixed(2)} ر.س</TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Recent Sales */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">آخر المبيعات</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-center py-4 text-muted-foreground">جاري التحميل...</p>
                ) : sales.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">لا توجد مبيعات في هذه الفترة</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>المنتج</TableHead>
                        <TableHead>القسم</TableHead>
                        <TableHead>الكمية</TableHead>
                        <TableHead>السعر</TableHead>
                        <TableHead>الإجمالي</TableHead>
                        {isAdmin && <TableHead>العامل</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sales.slice(0, 20).map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell className="font-medium">{sale.product_name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{sale.category}</Badge>
                          </TableCell>
                          <TableCell>{sale.quantity}</TableCell>
                          <TableCell>{sale.unit_price.toFixed(2)}</TableCell>
                          <TableCell className="font-bold">{sale.total.toFixed(2)}</TableCell>
                          {isAdmin && <TableCell>{sale.workers?.name || "-"}</TableCell>}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoffeeReports;
