import logo from "@/assets/logo.png";

interface ReceiptData {
  id: string;
  customer: string;
  amount: number;
  date: string;
  paymentMethod: string;
  invoiceRef?: string;
  notes?: string;
}

interface ReceiptPrintProps {
  receipt: ReceiptData;
}

const ReceiptPrint = ({ receipt }: ReceiptPrintProps) => {
  const amountInWords = (num: number): string => {
    const ones = ["", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة"];
    const tens = ["", "عشرة", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"];
    const hundreds = ["", "مائة", "مئتان", "ثلاثمائة", "أربعمائة", "خمسمائة", "ستمائة", "سبعمائة", "ثمانمائة", "تسعمائة"];
    const thousands = ["", "ألف", "ألفان", "ثلاثة آلاف", "أربعة آلاف", "خمسة آلاف", "ستة آلاف", "سبعة آلاف", "ثمانية آلاف", "تسعة آلاف"];
    
    if (num === 0) return "صفر";
    if (num >= 10000) return `${num.toLocaleString()} دينار ليبي`;
    
    const th = Math.floor(num / 1000);
    const h = Math.floor((num % 1000) / 100);
    const t = Math.floor((num % 100) / 10);
    const o = num % 10;
    
    let result = "";
    if (th > 0) result += thousands[th] + " و";
    if (h > 0) result += hundreds[h] + " و";
    if (t > 0) result += tens[t] + " و";
    if (o > 0) result += ones[o];
    
    return result.replace(/ و$/, "") + " دينار ليبي فقط لا غير";
  };

  return (
    <div className="print-content p-8 bg-white text-black" dir="rtl">
      {/* Header */}
      <div className="text-center border-b-2 border-gray-300 pb-6 mb-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <img src={logo} alt="المراقب" className="w-16 h-16 object-contain" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">شركة المراقب</h1>
        <p className="text-sm text-gray-600">لكاميرات المراقبة والأنظمة الأمنية</p>
        <h2 className="text-2xl font-bold text-green-600 mt-4">إيصال قبض</h2>
      </div>

      {/* Receipt Info */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">رقم الإيصال</p>
          <p className="text-xl font-bold">{receipt.id}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg text-left">
          <p className="text-sm text-gray-600 mb-1">التاريخ</p>
          <p className="text-xl font-bold">{receipt.date}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="border-2 border-gray-200 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">استلمنا من السيد / السادة</p>
            <p className="text-xl font-bold bg-gray-100 p-3 rounded-lg">{receipt.customer}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">طريقة الدفع</p>
            <p className="text-xl font-bold bg-gray-100 p-3 rounded-lg">{receipt.paymentMethod}</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-1">المبلغ رقماً</p>
          <p className="text-3xl font-bold text-green-600 bg-green-50 p-4 rounded-lg text-center">
            {receipt.amount.toLocaleString()} دينار ليبي
          </p>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-1">المبلغ كتابةً</p>
          <p className="text-lg font-semibold bg-gray-100 p-3 rounded-lg">
            {amountInWords(receipt.amount)}
          </p>
        </div>

        {receipt.invoiceRef && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-1">وذلك سداداً لـ</p>
            <p className="text-lg font-semibold bg-gray-100 p-3 rounded-lg">
              الفاتورة رقم: {receipt.invoiceRef}
            </p>
          </div>
        )}

        {receipt.notes && (
          <div>
            <p className="text-sm text-gray-600 mb-1">ملاحظات</p>
            <p className="text-base bg-gray-100 p-3 rounded-lg">{receipt.notes}</p>
          </div>
        )}
      </div>

      {/* Signature Section */}
      <div className="grid grid-cols-2 gap-8 mt-8">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-12">توقيع المستلم</p>
          <div className="border-t-2 border-gray-400 pt-2">
            <p className="text-gray-500">.....................</p>
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-12">توقيع المحاسب</p>
          <div className="border-t-2 border-gray-400 pt-2">
            <p className="text-gray-500">.....................</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t-2 border-gray-300 text-center text-sm text-gray-500">
        <p>ليبيا، طرابلس | هاتف: 0912345678 | البريد: info@almoraqib.ly</p>
      </div>
    </div>
  );
};

export default ReceiptPrint;
