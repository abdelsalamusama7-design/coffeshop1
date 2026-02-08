import { forwardRef } from "react";
import logo from "@/assets/logo.png";
import { Quotation, QuotationItem, CAMERA_TYPES, DVR_TYPES, HARD_DISK_TYPES } from "@/hooks/useQuotations";

interface QuotationPrintProps {
  quotation: Quotation & { items?: QuotationItem[] };
  companySettings: {
    company_name: string;
    phone: string;
    email: string;
    address: string;
    tax_number: string;
  } | null;
}

const QuotationPrint = forwardRef<HTMLDivElement, QuotationPrintProps>(
  ({ quotation, companySettings }, ref) => {
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("ar-LY", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    const getCameraLabel = (value: string) => {
      return CAMERA_TYPES.find(t => t.value === value)?.label || value;
    };

    const getDvrLabel = (value: string) => {
      return DVR_TYPES.find(t => t.value === value)?.label || value;
    };

    const getHardDiskLabel = (value: string) => {
      return HARD_DISK_TYPES.find(t => t.value === value)?.label || value;
    };

    return (
      <div ref={ref} className="p-8 bg-white text-black min-h-[297mm] w-[210mm] mx-auto print:p-6" dir="rtl">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-gray-800 pb-4 mb-6">
          <div className="flex items-center gap-4">
            <img src={logo} alt="الشعار" className="w-20 h-20 object-contain" />
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                {companySettings?.company_name || "شركة العميد الاردني"}
              </h1>
              <p className="text-sm text-gray-600">{companySettings?.address}</p>
              <p className="text-sm text-gray-600">هاتف: {companySettings?.phone}</p>
              <p className="text-sm text-gray-600">البريد: {companySettings?.email}</p>
            </div>
          </div>
          <div className="text-left">
            <h2 className="text-2xl font-bold text-primary">عرض سعر</h2>
            <p className="text-lg font-semibold">{quotation.quotation_number}</p>
            <p className="text-sm text-gray-600">التاريخ: {formatDate(quotation.created_at)}</p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-bold text-gray-800 mb-2">بيانات العميل</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">الاسم: </span>
              <span className="font-semibold">{quotation.customer_name}</span>
            </div>
            {quotation.customer_phone && (
              <div>
                <span className="text-gray-600">الهاتف: </span>
                <span className="font-semibold">{quotation.customer_phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* System Details */}
        <div className="mb-6">
          <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">تفاصيل النظام</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-right border">البند</th>
                <th className="p-2 text-center border">الكمية</th>
                <th className="p-2 text-center border">الوصف</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border">الكاميرات</td>
                <td className="p-2 border text-center">{quotation.camera_count}</td>
                <td className="p-2 border text-center">{getCameraLabel(quotation.camera_type)}</td>
              </tr>
              <tr>
                <td className="p-2 border">جهاز التسجيل</td>
                <td className="p-2 border text-center">1</td>
                <td className="p-2 border text-center">{getDvrLabel(quotation.dvr_type)}</td>
              </tr>
              <tr>
                <td className="p-2 border">القرص الصلب</td>
                <td className="p-2 border text-center">1</td>
                <td className="p-2 border text-center">{getHardDiskLabel(quotation.hard_disk)}</td>
              </tr>
              <tr>
                <td className="p-2 border">طول الأسلاك</td>
                <td className="p-2 border text-center">{quotation.cable_length}</td>
                <td className="p-2 border text-center">متر</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Accessories */}
        {quotation.items && quotation.items.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">الإكسسوارات والإضافات</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-right border">البند</th>
                  <th className="p-2 text-center border">الكمية</th>
                  <th className="p-2 text-center border">السعر</th>
                  <th className="p-2 text-center border">الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {quotation.items.map((item, index) => (
                  <tr key={index}>
                    <td className="p-2 border">{item.item_name}</td>
                    <td className="p-2 border text-center">{item.quantity}</td>
                    <td className="p-2 border text-center">{item.unit_price.toFixed(2)} د.ل</td>
                    <td className="p-2 border text-center">{item.total.toFixed(2)} د.ل</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Totals */}
        <div className="flex justify-end mb-6">
          <div className="w-64 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span>المجموع الفرعي:</span>
              <span className="font-semibold">{quotation.subtotal.toFixed(2)} د.ل</span>
            </div>
            {quotation.discount > 0 && (
              <div className="flex justify-between py-2 border-b text-green-600">
                <span>الخصم:</span>
                <span className="font-semibold">-{quotation.discount.toFixed(2)} د.ل</span>
              </div>
            )}
            {quotation.tax > 0 && (
              <div className="flex justify-between py-2 border-b">
                <span>الضريبة:</span>
                <span className="font-semibold">{quotation.tax.toFixed(2)} د.ل</span>
              </div>
            )}
            <div className="flex justify-between py-3 bg-primary/10 px-2 rounded font-bold text-lg">
              <span>الإجمالي:</span>
              <span>{quotation.total.toFixed(2)} د.ل</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {quotation.notes && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-bold text-gray-800 mb-2">ملاحظات</h3>
            <p className="text-sm text-gray-600">{quotation.notes}</p>
          </div>
        )}

        {/* Terms */}
        <div className="mb-6 p-4 border rounded-lg text-sm">
          <h3 className="font-bold text-gray-800 mb-2">الشروط والأحكام</h3>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>عرض السعر صالح لمدة 7 أيام من تاريخ الإصدار</li>
            <li>الأسعار لا تشمل التركيب إلا إذا ذُكر خلاف ذلك</li>
            <li>الضمان سنة واحدة على المعدات</li>
            <li>يتم الدفع نقداً عند التسليم أو حسب الاتفاق</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 border-t pt-4">
          <p>{companySettings?.company_name || "شركة العميد الاردني"}</p>
          <p>الرقم الضريبي: {companySettings?.tax_number}</p>
        </div>
      </div>
    );
  }
);

QuotationPrint.displayName = "QuotationPrint";

export default QuotationPrint;
