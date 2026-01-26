import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  gradient: "primary" | "success" | "warning" | "danger";
}

const gradientClasses = {
  primary: "gradient-primary",
  success: "gradient-success",
  warning: "gradient-warning",
  danger: "gradient-danger",
};

const StatCard = ({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  gradient,
}: StatCardProps) => {
  return (
    <div className="stat-card animate-fade-in p-3 md:p-6">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs md:text-sm text-muted-foreground mb-1 truncate">{title}</p>
          <p className="text-lg md:text-2xl font-bold text-foreground truncate">{value}</p>
          {change && (
            <p
              className={`text-[10px] md:text-xs mt-1 md:mt-2 font-medium truncate ${
                changeType === "positive"
                  ? "text-success"
                  : changeType === "negative"
                  ? "text-destructive"
                  : "text-muted-foreground"
              }`}
            >
              {change}
            </p>
          )}
        </div>
        <div
          className={`w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl ${gradientClasses[gradient]} flex items-center justify-center flex-shrink-0`}
        >
          <Icon className="w-4 h-4 md:w-6 md:h-6 text-primary-foreground" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
