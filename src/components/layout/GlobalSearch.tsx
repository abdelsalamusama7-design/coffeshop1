import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FileText, Users, Package, Receipt, FileSpreadsheet, Cpu, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCustomers } from "@/hooks/useCustomers";
import { useProducts } from "@/hooks/useProducts";
import { useInvoices } from "@/hooks/useInvoices";
import { useQuotations } from "@/hooks/useQuotations";
import { useReceipts } from "@/hooks/useReceipts";
import { useDevices } from "@/hooks/useDevices";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type: "customer" | "product" | "invoice" | "quotation" | "receipt" | "device";
  path: string;
}

const typeConfig = {
  customer: { icon: Users, label: "عميل", color: "text-blue-500" },
  product: { icon: Package, label: "منتج", color: "text-green-500" },
  invoice: { icon: FileText, label: "فاتورة", color: "text-purple-500" },
  quotation: { icon: FileSpreadsheet, label: "عرض سعر", color: "text-orange-500" },
  receipt: { icon: Receipt, label: "إيصال", color: "text-cyan-500" },
  device: { icon: Cpu, label: "جهاز", color: "text-pink-500" },
};

const GlobalSearch = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { customers } = useCustomers();
  const { products } = useProducts();
  const { invoices } = useInvoices();
  const { quotations } = useQuotations();
  const { receipts } = useReceipts();
  const { devices } = useDevices();

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search logic
  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Search customers
    customers?.forEach((customer) => {
      if (
        customer.name.toLowerCase().includes(term) ||
        customer.phone?.toLowerCase().includes(term)
      ) {
        searchResults.push({
          id: customer.id,
          title: customer.name,
          subtitle: customer.phone || undefined,
          type: "customer",
          path: "/customers",
        });
      }
    });

    // Search products
    products?.forEach((product) => {
      if (
        product.name.toLowerCase().includes(term) ||
        product.sku?.toLowerCase().includes(term)
      ) {
        searchResults.push({
          id: product.id,
          title: product.name,
          subtitle: product.sku || undefined,
          type: "product",
          path: "/inventory",
        });
      }
    });

    // Search invoices
    invoices?.forEach((invoice) => {
      if (
        invoice.invoice_number.toLowerCase().includes(term) ||
        invoice.customer_name.toLowerCase().includes(term)
      ) {
        searchResults.push({
          id: invoice.id,
          title: invoice.invoice_number,
          subtitle: invoice.customer_name,
          type: "invoice",
          path: "/invoices",
        });
      }
    });

    // Search quotations
    quotations?.forEach((quotation) => {
      if (
        quotation.quotation_number.toLowerCase().includes(term) ||
        quotation.customer_name.toLowerCase().includes(term)
      ) {
        searchResults.push({
          id: quotation.id,
          title: quotation.quotation_number,
          subtitle: quotation.customer_name,
          type: "quotation",
          path: "/quotations",
        });
      }
    });

    // Search receipts
    receipts?.forEach((receipt) => {
      if (
        receipt.receipt_number.toLowerCase().includes(term) ||
        receipt.customer_name.toLowerCase().includes(term)
      ) {
        searchResults.push({
          id: receipt.id,
          title: receipt.receipt_number,
          subtitle: receipt.customer_name,
          type: "receipt",
          path: "/receipts",
        });
      }
    });

    // Search devices
    devices?.forEach((device) => {
      if (
        device.serial_number.toLowerCase().includes(term) ||
        device.customer_name.toLowerCase().includes(term)
      ) {
        searchResults.push({
          id: device.id,
          title: device.serial_number,
          subtitle: device.customer_name,
          type: "device",
          path: "/devices",
        });
      }
    });

    setResults(searchResults.slice(0, 10)); // Limit to 10 results
    setSelectedIndex(0);
  }, [searchTerm, customers, products, invoices, quotations, receipts, devices]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setSearchTerm("");
    }
  };

  const handleSelect = (result: SearchResult) => {
    navigate(result.path);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = () => {
    setSearchTerm("");
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder="بحث في المنظومة..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-72 pr-10 pl-8 bg-muted/50 border-0 focus-visible:ring-1"
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {isOpen && searchTerm && (
        <div className="absolute top-full mt-2 w-96 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          {results.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              لا توجد نتائج للبحث
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {results.map((result, index) => {
                const config = typeConfig[result.type];
                const Icon = config.icon;
                
                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSelect(result)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 text-right transition-colors",
                      index === selectedIndex
                        ? "bg-accent"
                        : "hover:bg-muted/50"
                    )}
                  >
                    <div className={cn("p-2 rounded-lg bg-muted", config.color)}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{result.title}</p>
                      {result.subtitle && (
                        <p className="text-sm text-muted-foreground truncate">
                          {result.subtitle}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
                      {config.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          
          {/* Keyboard hints */}
          <div className="border-t border-border p-2 flex items-center justify-center gap-4 text-xs text-muted-foreground bg-muted/30">
            <span>↑↓ للتنقل</span>
            <span>Enter للاختيار</span>
            <span>Esc للإغلاق</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;