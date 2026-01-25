import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  TrendingUp,
  Receipt,
  CalendarIcon,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

interface ReportItem {
  label: string;
  value: number;
  color: string;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("ar-LY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const ReportCard = ({
  title,
  items,
  headerColor,
}: {
  title: string;
  items: ReportItem[];
  headerColor: string;
}) => (
  <Card className="shadow-card">
    <CardHeader className={`${headerColor} text-white py-3 rounded-t-lg`}>
      <CardTitle className="text-base font-semibold text-center">
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="p-0">
      <div className="divide-y divide-border">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1.5 rounded-lg text-sm font-medium text-white ${item.color}`}
              >
                {item.label}
              </span>
            </div>
            <span className="font-semibold text-foreground">
              {formatCurrency(item.value)} د.ل
            </span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const DailyReport = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Get selected date range
  const startOfDay = new Date(selectedDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(selectedDate);
  endOfDay.setHours(23, 59, 59, 999);

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    if (newDate <= new Date()) {
      setSelectedDate(newDate);
    }
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  // Fetch today's invoices
  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ["daily-invoices", startOfDay.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .gte("created_at", startOfDay.toISOString())
        .lte("created_at", endOfDay.toISOString());
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch today's receipts
  const { data: receipts, isLoading: receiptsLoading } = useQuery({
    queryKey: ["daily-receipts", startOfDay.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("receipts")
        .select("*")
        .gte("created_at", startOfDay.toISOString())
        .lte("created_at", endOfDay.toISOString());
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch all invoices for totals
  const { data: allInvoices } = useQuery({
    queryKey: ["all-invoices-totals"],
    queryFn: async () => {
      const { data, error } = await supabase.from("invoices").select("total, status");
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch all receipts for totals
  const { data: allReceipts } = useQuery({
    queryKey: ["all-receipts-totals"],
    queryFn: async () => {
      const { data, error } = await supabase.from("receipts").select("amount, payment_method");
      if (error) throw error;
      return data || [];
    },
  });

  const isLoading = invoicesLoading || receiptsLoading;

  // Calculate invoice totals
  const totalSales = invoices?.reduce((sum, inv) => sum + (inv.total || 0), 0) || 0;
  const cashSales = invoices?.filter(inv => inv.status === "paid").reduce((sum, inv) => sum + (inv.total || 0), 0) || 0;
  const deferredSales = invoices?.filter(inv => inv.status === "pending").reduce((sum, inv) => sum + (inv.total || 0), 0) || 0;

  // Calculate receipt totals
  const totalReceipts = receipts?.reduce((sum, rec) => sum + (rec.amount || 0), 0) || 0;
  const cashReceipts = receipts?.filter(rec => rec.payment_method === "نقداً").reduce((sum, rec) => sum + (rec.amount || 0), 0) || 0;

  // Calculate overall totals
  const overallSales = allInvoices?.reduce((sum, inv) => sum + (inv.total || 0), 0) || 0;
  const overallReceipts = allReceipts?.reduce((sum, rec) => sum + (rec.amount || 0), 0) || 0;
  const treasury = overallReceipts;
  const profit = overallSales * 0.15; // Estimated profit margin

  // Report sections data
  const totalsItems: ReportItem[] = [
    { label: "الخزينة", value: treasury, color: "bg-emerald-600" },
    { label: "سحب", value: 0, color: "bg-amber-600" },
    { label: "إيداع", value: overallReceipts, color: "bg-blue-600" },
    { label: "الأرباح", value: profit, color: "bg-green-600" },
    { label: "صافي الربح", value: profit * 0.8, color: "bg-teal-600" },
  ];

  const invoicesItems: ReportItem[] = [
    { label: "إجمالي البيع", value: totalSales, color: "bg-blue-600" },
    { label: "مبيعات آجلة", value: deferredSales, color: "bg-indigo-600" },
    { label: "مبيعات نقدية", value: cashSales, color: "bg-cyan-600" },
    { label: "إرجاع مبيعات", value: 0, color: "bg-orange-600" },
    { label: "مشتريات", value: 0, color: "bg-purple-600" },
    { label: "إرجاع مشتريات", value: 0, color: "bg-pink-600" },
  ];

  const receiptsItems: ReportItem[] = [
    { label: "إيصالات قبض", value: totalReceipts, color: "bg-emerald-600" },
    { label: "سندات الصرف", value: 0, color: "bg-red-600" },
    { label: "مصروفات", value: 0, color: "bg-amber-600" },
    { label: "سندات صرف لموظف", value: 0, color: "bg-rose-600" },
    { label: "سندات قبض من موظف", value: 0, color: "bg-teal-600" },
  ];

  const otherItems: ReportItem[] = [
    { label: "تخفيضات مبيعات", value: invoices?.reduce((sum, inv) => sum + (inv.discount || 0), 0) || 0, color: "bg-violet-600" },
    { label: "تخفيضات مشتريات", value: 0, color: "bg-fuchsia-600" },
    { label: "خسائر البيع", value: 0, color: "bg-red-600" },
  ];

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="shadow-card overflow-hidden">
      <CardHeader className="bg-primary text-primary-foreground">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            التقارير اليومية
          </CardTitle>
          
          {/* Date Filter Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="icon"
              onClick={goToPreviousDay}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="secondary"
                  className={cn(
                    "justify-start text-right font-normal h-8 px-3",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {format(selectedDate, "EEEE، d MMMM yyyy", { locale: ar })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-50" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  disabled={(date) => date > new Date()}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>

            <Button
              variant="secondary"
              size="icon"
              onClick={goToNextDay}
              disabled={isToday}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {!isToday && (
              <Button
                variant="secondary"
                size="sm"
                onClick={goToToday}
                className="h-8"
              >
                اليوم
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ReportCard
            title="الإجماليات"
            items={totalsItems}
            headerColor="bg-emerald-600"
          />
          <ReportCard
            title="الفواتير"
            items={invoicesItems}
            headerColor="bg-blue-600"
          />
          <ReportCard
            title="الإيصالات"
            items={receiptsItems}
            headerColor="bg-amber-600"
          />
          <ReportCard
            title="أخرى"
            items={otherItems}
            headerColor="bg-purple-600"
          />
        </div>

        {/* Daily Summary */}
        <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-border">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            ملخص اليوم
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-background border border-border">
              <p className="text-2xl font-bold text-primary">{invoices?.length || 0}</p>
              <p className="text-sm text-muted-foreground">فاتورة</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-background border border-border">
              <p className="text-2xl font-bold text-emerald-600">{receipts?.length || 0}</p>
              <p className="text-sm text-muted-foreground">إيصال</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-background border border-border">
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalSales)}</p>
              <p className="text-sm text-muted-foreground">إجمالي المبيعات</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-background border border-border">
              <p className="text-2xl font-bold text-amber-600">{formatCurrency(totalReceipts)}</p>
              <p className="text-sm text-muted-foreground">إجمالي الإيصالات</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyReport;
