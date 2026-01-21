import { TrendingUp } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "يناير", sales: 12000 },
  { name: "فبراير", sales: 19000 },
  { name: "مارس", sales: 15000 },
  { name: "أبريل", sales: 25000 },
  { name: "مايو", sales: 22000 },
  { name: "يونيو", sales: 30000 },
  { name: "يوليو", sales: 28000 },
];

const SalesChart = () => {
  return (
    <div className="bg-card rounded-xl shadow-card border border-border/50 animate-fade-in">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-success" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">المبيعات الشهرية</h3>
            <p className="text-xs text-muted-foreground">نظرة عامة على المبيعات</p>
          </div>
        </div>
      </div>

      <div className="p-6 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(215, 70%, 45%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(215, 70%, 45%)" stopOpacity={0} />
              </linearGradient>
            </defs>
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
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
              }}
              formatter={(value: number) => [`${value.toLocaleString()} د.ل`, "المبيعات"]}
            />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="hsl(215, 70%, 45%)"
              strokeWidth={2}
              fill="url(#salesGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesChart;
