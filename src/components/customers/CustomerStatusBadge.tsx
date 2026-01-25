import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { CustomerStatus, CUSTOMER_STATUSES } from "@/hooks/useCustomers";

interface CustomerStatusBadgeProps {
  status: CustomerStatus;
  onStatusChange?: (newStatus: CustomerStatus) => void;
  editable?: boolean;
}

const CustomerStatusBadge = ({ status, onStatusChange, editable = true }: CustomerStatusBadgeProps) => {
  const statusConfig = CUSTOMER_STATUSES.find(s => s.value === status) || CUSTOMER_STATUSES[0];

  const getStatusStyles = (statusValue: CustomerStatus) => {
    switch (statusValue) {
      case 'جديد':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20';
      case 'تم التواصل':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20 hover:bg-yellow-500/20';
      case 'تم المعاينة':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20 hover:bg-purple-500/20';
      case 'تم الاتفاق':
        return 'bg-orange-500/10 text-orange-600 border-orange-500/20 hover:bg-orange-500/20';
      case 'تم التركيب':
        return 'bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20';
      case 'مرفوض':
        return 'bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20 hover:bg-gray-500/20';
    }
  };

  if (!editable) {
    return (
      <Badge variant="outline" className={`${getStatusStyles(status)} border`}>
        {statusConfig.label}
      </Badge>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border cursor-pointer transition-colors ${getStatusStyles(status)}`}>
          {statusConfig.label}
          <ChevronDown className="w-3 h-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-popover border border-border shadow-lg z-50">
        {CUSTOMER_STATUSES.map((s) => (
          <DropdownMenuItem
            key={s.value}
            onClick={() => onStatusChange?.(s.value)}
            className={`cursor-pointer ${status === s.value ? 'bg-accent' : ''}`}
          >
            <span className={`w-2 h-2 rounded-full mr-2 ${s.color}`} />
            {s.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CustomerStatusBadge;
