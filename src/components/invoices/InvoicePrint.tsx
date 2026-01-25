import { forwardRef } from "react";
import logo from "@/assets/logo.png";

interface InvoiceItem {
  name: string;
  qty: number;
  price: number;
}

interface Invoice {
  id: string;
  customer: string;
  date: string;
  total: number;
  status: string;
  items: InvoiceItem[];
  tax: number;
  discount: number;
}

interface CompanySettings {
  company_name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  tax_number: string | null;
}

interface InvoicePrintProps {
  invoice: Invoice;
  companySettings?: CompanySettings | null;
}

const InvoicePrint = forwardRef<HTMLDivElement, InvoicePrintProps>(
  ({ invoice, companySettings }, ref) => {
    const subtotal = invoice.items.reduce((sum, item) => sum + item.qty * item.price, 0);

    return (
      <div ref={ref} className="print-content p-8 bg-white text-black" dir="rtl">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-gray-300 pb-6 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <img src={logo} alt="الشعار" className="w-14 h-14 object-contain" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {companySettings?.company_name || "شركة المراقب"}
                </h1>
                <p className="text-sm text-gray-600">لكاميرات المراقبة والأنظمة الأمنية</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600 space-y-1">
              <p>{companySettings?.address || "ليبيا، طرابلس"}</p>
              <p>هاتف: {companySettings?.phone || "غير محدد"}</p>
              <p>البريد: {companySettings?.email || "غير محدد"}</p>
              {companySettings?.tax_number && (
                <p>الرقم الضريبي: {companySettings.tax_number}</p>
              )}
            </div>
          </div>
          <div className="text-left">
            <h2 className="text-3xl font-bold text-blue-600 mb-2">فاتورة ضريبية</h2>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm text-gray-600">رقم الفاتورة</p>
              <p className="text-xl font-bold">{invoice.id}</p>
              <p className="text-sm text-gray-600 mt-2">التاريخ</p>
              <p className="font-semibold">{invoice.date}</p>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-bold text-gray-700 mb-2">معلومات العميل</h3>
          <p className="text-lg font-semibold">{invoice.customer}</p>
        </div>

        {/* Items Table */}
        <table className="w-full mb-6">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="py-3 px-4 text-right rounded-tr-lg">#</th>
              <th className="py-3 px-4 text-right">الصنف</th>
              <th className="py-3 px-4 text-center">الكمية</th>
              <th className="py-3 px-4 text-left">سعر الوحدة</th>
              <th className="py-3 px-4 text-left rounded-tl-lg">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="py-3 px-4 border-b">{index + 1}</td>
                <td className="py-3 px-4 border-b font-medium">{item.name}</td>
                <td className="py-3 px-4 border-b text-center">{item.qty}</td>
                <td className="py-3 px-4 border-b text-left">{item.price.toLocaleString()} د.ل</td>
                <td className="py-3 px-4 border-b text-left font-semibold">
                  {(item.qty * item.price).toLocaleString()} د.ل
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-80 space-y-2">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">المجموع الفرعي</span>
              <span className="font-semibold">{subtotal.toLocaleString()} د.ل</span>
            </div>
            {invoice.discount !== 0 && (
              <div className={`flex justify-between py-2 border-b ${invoice.discount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                <span>خصم الصكوك</span>
                <span className="font-semibold">
                  {invoice.discount > 0 ? '-' : '+'} {Math.abs(invoice.discount).toLocaleString()} د.ل
                </span>
              </div>
            )}
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">الضريبة</span>
              <span className="font-semibold">{invoice.tax.toLocaleString()} د.ل</span>
            </div>
            <div className="flex justify-between py-3 bg-blue-600 text-white px-4 rounded-lg">
              <span className="font-bold text-lg">الإجمالي المستحق</span>
              <span className="font-bold text-lg">{invoice.total.toLocaleString()} د.ل</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t-2 border-gray-300">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="font-bold text-gray-700 mb-2">الشروط والأحكام</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• مدة الضمان سنة واحدة من تاريخ الشراء</li>
                <li>• لا يتم استرجاع أو استبدال البضاعة بعد البيع</li>
              </ul>
            </div>
            <div className="text-left">
              <h4 className="font-bold text-gray-700 mb-2">طرق الدفع</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• نقداً</li>
                <li>• تحويل بنكي</li>
              </ul>
            </div>
          </div>
          <div className="text-center mt-6 text-gray-500 text-sm">
            <p>شكراً لتعاملكم معنا</p>
            <p>{companySettings?.company_name || "شركة المراقب لكاميرات المراقبة"}</p>
          </div>
        </div>
      </div>
    );
  }
);

InvoicePrint.displayName = "InvoicePrint";

export default InvoicePrint;
