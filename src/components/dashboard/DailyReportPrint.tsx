import logo from "@/assets/logo.png";
import { useCompanySettings } from "@/hooks/useCompanySettings";

interface ReportItem {
  label: string;
  value: number;
}

interface DailyReportPrintProps {
  date: string;
  totalsItems: ReportItem[];
  invoicesItems: ReportItem[];
  receiptsItems: ReportItem[];
  otherItems: ReportItem[];
  summary: {
    invoicesCount: number;
    receiptsCount: number;
    totalSales: number;
    totalReceipts: number;
  };
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("ar-LY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const ReportSection = ({
  title,
  items,
  headerColor,
}: {
  title: string;
  items: ReportItem[];
  headerColor: string;
}) => (
  <div className="border border-gray-300 rounded-lg overflow-hidden">
    <div className={`${headerColor} text-white py-2 px-3 text-center font-bold`}>
      {title}
    </div>
    <div className="divide-y divide-gray-200">
      {items.map((item, index) => (
        <div key={index} className="flex justify-between p-2 text-sm">
          <span className="font-medium">{item.label}</span>
          <span className="font-bold">{formatCurrency(item.value)} د.ل</span>
        </div>
      ))}
    </div>
  </div>
);

const DailyReportPrint = ({
  date,
  totalsItems,
  invoicesItems,
  receiptsItems,
  otherItems,
  summary,
}: DailyReportPrintProps) => {
  const { settings } = useCompanySettings();

  return (
    <div className="print-content p-6 bg-white text-black" dir="rtl">
      {/* Header */}
      <div className="text-center border-b-2 border-gray-300 pb-4 mb-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          <img src={logo} alt="الشعار" className="w-14 h-14 object-contain" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">
          {settings?.company_name || "شركة المراقب"}
        </h1>
        <p className="text-sm text-gray-600">
          {settings?.address || "لكاميرات المراقبة والأنظمة الأمنية"}
        </p>
        <h2 className="text-xl font-bold text-blue-600 mt-3">التقرير اليومي</h2>
        <p className="text-base font-semibold mt-1">{date}</p>
      </div>

      {/* Report Sections Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <ReportSection
          title="الإجماليات"
          items={totalsItems}
          headerColor="bg-emerald-600"
        />
        <ReportSection
          title="الفواتير"
          items={invoicesItems}
          headerColor="bg-blue-600"
        />
        <ReportSection
          title="الإيصالات"
          items={receiptsItems}
          headerColor="bg-amber-600"
        />
        <ReportSection
          title="أخرى"
          items={otherItems}
          headerColor="bg-purple-600"
        />
      </div>

      {/* Daily Summary */}
      <div className="border-2 border-gray-300 rounded-lg p-4 mb-4">
        <h3 className="font-bold text-center mb-3 text-lg">ملخص اليوم</h3>
        <div className="grid grid-cols-4 gap-3 text-center">
          <div className="bg-gray-100 p-3 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{summary.invoicesCount}</p>
            <p className="text-sm text-gray-600">فاتورة</p>
          </div>
          <div className="bg-gray-100 p-3 rounded-lg">
            <p className="text-2xl font-bold text-emerald-600">{summary.receiptsCount}</p>
            <p className="text-sm text-gray-600">إيصال</p>
          </div>
          <div className="bg-gray-100 p-3 rounded-lg">
            <p className="text-lg font-bold text-blue-600">{formatCurrency(summary.totalSales)}</p>
            <p className="text-sm text-gray-600">إجمالي المبيعات</p>
          </div>
          <div className="bg-gray-100 p-3 rounded-lg">
            <p className="text-lg font-bold text-amber-600">{formatCurrency(summary.totalReceipts)}</p>
            <p className="text-sm text-gray-600">إجمالي الإيصالات</p>
          </div>
        </div>
      </div>

      {/* Signature Section */}
      <div className="grid grid-cols-2 gap-8 mt-6">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-10">توقيع المدير</p>
          <div className="border-t-2 border-gray-400 pt-2">
            <p className="text-gray-500">.....................</p>
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-10">توقيع المحاسب</p>
          <div className="border-t-2 border-gray-400 pt-2">
            <p className="text-gray-500">.....................</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t-2 border-gray-300 text-center text-sm text-gray-500">
        <p>
          {settings?.address || "ليبيا، طرابلس"} | هاتف: {settings?.phone || "0912345678"} | البريد: {settings?.email || "info@almoraqib.ly"}
        </p>
        <p className="mt-1">تم الطباعة: {new Date().toLocaleString("ar-LY")}</p>
      </div>
    </div>
  );
};

export default DailyReportPrint;
