import MainLayout from "@/components/layout/MainLayout";
import StatCard from "@/components/dashboard/StatCard";
import RecentInvoices from "@/components/dashboard/RecentInvoices";
import LowStockAlert from "@/components/dashboard/LowStockAlert";
import SalesChart from "@/components/dashboard/SalesChart";
import { DollarSign, Package, FileText, Users } from "lucide-react";

const Index = () => {
  return (
    <MainLayout title="لوحة التحكم" subtitle="مرحباً بك في نظام إدارة المبيعات">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="إجمالي المبيعات"
          value="١٢٥,٤٣٠ د.ل"
          change="+١٢.٥% من الشهر الماضي"
          changeType="positive"
          icon={DollarSign}
          gradient="primary"
        />
        <StatCard
          title="عدد الأصناف"
          value="٢٤٨"
          change="+٨ أصناف جديدة"
          changeType="positive"
          icon={Package}
          gradient="success"
        />
        <StatCard
          title="الفواتير"
          value="١,٢٣٤"
          change="٤٥ فاتورة اليوم"
          changeType="neutral"
          icon={FileText}
          gradient="warning"
        />
        <StatCard
          title="العملاء"
          value="٣٢١"
          change="+١٥ عميل جديد"
          changeType="positive"
          icon={Users}
          gradient="danger"
        />
      </div>

      {/* Charts and Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart />
        </div>
        <div>
          <LowStockAlert />
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="mt-6">
        <RecentInvoices />
      </div>
    </MainLayout>
  );
};

export default Index;
