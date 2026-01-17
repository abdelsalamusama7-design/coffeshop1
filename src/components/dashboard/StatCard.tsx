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
    <div className="stat-card animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {change && (
            <p
              className={`text-xs mt-2 font-medium ${
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
          className={`w-12 h-12 rounded-xl ${gradientClasses[gradient]} flex items-center justify-center`}
        >
          <Icon className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
