import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Wrench,
  Cpu,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useDevices, Device, DEVICE_TYPES } from "@/hooks/useDevices";
import DeviceForm from "@/components/devices/DeviceForm";
import MaintenanceForm from "@/components/devices/MaintenanceForm";
import WarrantyAlerts from "@/components/devices/WarrantyAlerts";
import { format, differenceInDays } from "date-fns";
import { ar } from "date-fns/locale";

const Devices = () => {
  const { devices, isLoading, deleteDevice, expiringDevices } = useDevices();
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeviceForm, setShowDeviceForm] = useState(false);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | undefined>();
  const [deviceToDelete, setDeviceToDelete] = useState<Device | null>(null);

  const filteredDevices = devices?.filter(
    (device) =>
      device.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.device_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDeviceTypeLabel = (type: string) => {
    return DEVICE_TYPES.find((t) => t.value === type)?.label || type;
  };

  const getStatusBadge = (status: Device["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">نشط</Badge>;
      case "expired":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">منتهي</Badge>;
      case "under_repair":
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">قيد الإصلاح</Badge>;
      case "replaced":
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">مستبدل</Badge>;
      default:
        return null;
    }
  };

  const getWarrantyStatus = (endDate: string | null) => {
    if (!endDate) return null;
    const days = differenceInDays(new Date(endDate), new Date());

    if (days < 0) {
      return <Badge variant="destructive">منتهي الضمان</Badge>;
    } else if (days <= 30) {
      return (
        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
          <AlertTriangle className="w-3 h-3 ml-1" />
          {days} يوم متبقي
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
          <CheckCircle2 className="w-3 h-3 ml-1" />
          {days} يوم
        </Badge>
      );
    }
  };

  const handleEdit = (device: Device) => {
    setSelectedDevice(device);
    setShowDeviceForm(true);
  };

  const handleMaintenance = (device: Device) => {
    setSelectedDevice(device);
    setShowMaintenanceForm(true);
  };

  const handleDelete = (device: Device) => {
    setDeviceToDelete(device);
  };

  const confirmDelete = () => {
    if (deviceToDelete) {
      deleteDevice(deviceToDelete.id);
      setDeviceToDelete(null);
    }
  };

  // Stats
  const stats = {
    total: devices?.length || 0,
    active: devices?.filter((d) => d.status === "active").length || 0,
    expiring: expiringDevices?.length || 0,
    underRepair: devices?.filter((d) => d.status === "under_repair").length || 0,
  };

  return (
    <MainLayout title="الأجهزة والضمانات" subtitle="تتبع الأجهزة المباعة والضمانات">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
              <Cpu className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">إجمالي الأجهزة</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gradient-success flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">تحت الضمان</p>
              <p className="text-2xl font-bold">{stats.active}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gradient-warning flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ينتهي قريباً</p>
              <p className="text-2xl font-bold">{stats.expiring}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gradient-danger flex items-center justify-center">
              <Wrench className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">قيد الإصلاح</p>
              <p className="text-2xl font-bold">{stats.underRepair}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Warranty Alerts */}
      {expiringDevices && expiringDevices.length > 0 && (
        <div className="mb-6">
          <WarrantyAlerts />
        </div>
      )}

      {/* Actions Bar */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="بحث بالسيريال أو اسم العميل..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
          <Button
            onClick={() => {
              setSelectedDevice(undefined);
              setShowDeviceForm(true);
            }}
          >
            <Plus className="w-4 h-4 ml-2" />
            تسجيل جهاز جديد
          </Button>
        </div>
      </Card>

      {/* Devices Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الجهاز</TableHead>
              <TableHead>العميل</TableHead>
              <TableHead>الرقم التسلسلي</TableHead>
              <TableHead>بداية الضمان</TableHead>
              <TableHead>حالة الضمان</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Clock className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : filteredDevices?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  لا توجد أجهزة مسجلة
                </TableCell>
              </TableRow>
            ) : (
              filteredDevices?.map((device) => (
                <TableRow key={device.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{getDeviceTypeLabel(device.device_type)}</p>
                        {device.device_model && (
                          <p className="text-sm text-muted-foreground">{device.device_model}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{device.customer_name}</TableCell>
                  <TableCell>
                    <code className="text-sm bg-muted px-2 py-1 rounded">{device.serial_number}</code>
                  </TableCell>
                  <TableCell>
                    {format(new Date(device.warranty_start_date), "d MMM yyyy", { locale: ar })}
                  </TableCell>
                  <TableCell>{getWarrantyStatus(device.warranty_end_date)}</TableCell>
                  <TableCell>{getStatusBadge(device.status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover">
                        <DropdownMenuItem onClick={() => handleEdit(device)}>
                          <Edit className="w-4 h-4 ml-2" />
                          تعديل
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleMaintenance(device)}>
                          <Wrench className="w-4 h-4 ml-2" />
                          سجل صيانة
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(device)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 ml-2" />
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Device Form Dialog */}
      <DeviceForm
        open={showDeviceForm}
        onOpenChange={setShowDeviceForm}
        device={selectedDevice}
      />

      {/* Maintenance Form Dialog */}
      {selectedDevice && (
        <MaintenanceForm
          open={showMaintenanceForm}
          onOpenChange={setShowMaintenanceForm}
          deviceId={selectedDevice.id}
          customerId={selectedDevice.customer_id}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deviceToDelete} onOpenChange={() => setDeviceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف الجهاز "{deviceToDelete?.serial_number}"؟
              <br />
              سيتم حذف جميع سجلات الصيانة المرتبطة به.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default Devices;
