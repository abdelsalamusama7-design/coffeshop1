import { AlertTriangle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

const lowStockItems = [
  { name: "كاميرا Hikvision 4MP", stock: 3, min: 10 },
  { name: "DVR 16 قناة", stock: 2, min: 5 },
  { name: "كابل RG59 - 305م", stock: 5, min: 15 },
  { name: "محول طاقة 12V", stock: 8, min: 20 },
];

const LowStockAlert = () => {
  return (
    <div className="bg-card rounded-xl shadow-card border border-border/50 animate-fade-in">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-warning" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">تنبيه المخزون</h3>
            <p className="text-xs text-muted-foreground">أصناف قاربت على النفاد</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-primary">
          عرض الكل
        </Button>
      </div>

      <div className="p-4 space-y-3">
        {lowStockItems.map((item, index) => (
          <div
            key={item.name}
            className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center">
              <Package className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground text-sm">{item.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-warning rounded-full"
                    style={{ width: `${(item.stock / item.min) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {item.stock}/{item.min}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LowStockAlert;
