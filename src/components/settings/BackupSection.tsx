import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Database, Download, Upload, Loader2, AlertTriangle } from "lucide-react";
import { useBackup } from "@/hooks/useBackup";

const BackupSection = () => {
  const { exportBackup, importBackup, isExporting, isImporting } = useBackup();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".json")) {
        return;
      }
      setSelectedFile(file);
      setShowImportDialog(true);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImportConfirm = async () => {
    if (selectedFile) {
      await importBackup(selectedFile);
      setSelectedFile(null);
      setShowImportDialog(false);
    }
  };

  const handleImportCancel = () => {
    setSelectedFile(null);
    setShowImportDialog(false);
  };

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg gradient-danger flex items-center justify-center">
            <Database className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">النسخ الاحتياطي</h3>
            <p className="text-sm text-muted-foreground">
              تصدير واستيراد بيانات النظام
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <h4 className="font-medium mb-2">تصدير البيانات</h4>
            <p className="text-sm text-muted-foreground mb-3">
              تصدير جميع البيانات (المنتجات، العملاء، الفواتير، الإيصالات) إلى ملف JSON
            </p>
            <Button onClick={exportBackup} disabled={isExporting}>
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري التصدير...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 ml-2" />
                  إنشاء نسخة احتياطية
                </>
              )}
            </Button>
          </div>

          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <h4 className="font-medium mb-2">استيراد البيانات</h4>
            <p className="text-sm text-muted-foreground mb-3">
              استعادة البيانات من ملف نسخة احتياطية سابقة
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".json"
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري الاستيراد...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 ml-2" />
                  استعادة نسخة احتياطية
                </>
              )}
            </Button>
          </div>

          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-800 dark:text-amber-200">
                <strong>تنبيه:</strong> استيراد نسخة احتياطية سيقوم بتحديث البيانات
                الموجودة. تأكد من حفظ نسخة احتياطية قبل الاستيراد.
              </div>
            </div>
          </div>
        </div>
      </Card>

      <AlertDialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد استيراد البيانات</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من استيراد البيانات من الملف "{selectedFile?.name}"؟
              <br />
              <br />
              سيتم تحديث البيانات الموجودة بالبيانات من النسخة الاحتياطية.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel onClick={handleImportCancel}>
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleImportConfirm}>
              استيراد
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BackupSection;
