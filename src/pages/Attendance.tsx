import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWorker } from "@/contexts/WorkerContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Clock, 
  LogIn, 
  LogOut as LogOutIcon,
  ArrowRight,
  Calendar as CalendarIcon,
  Users
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface AttendanceRecord {
  id: string;
  worker_id: string;
  date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  notes: string | null;
  workers?: {
    name: string;
  };
}

interface Worker {
  id: string;
  name: string;
}

const Attendance = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedWorker, setSelectedWorker] = useState<string>("");
  const { isAdmin, worker: currentWorker } = useWorker();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const dateStr = format(selectedDate, "yyyy-MM-dd");

  // جلب العمال
  const { data: workers = [] } = useQuery({
    queryKey: ["workers-active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workers")
        .select("id, name")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data as Worker[];
    },
  });

  // جلب سجلات الحضور
  const { data: attendanceRecords = [], isLoading } = useQuery({
    queryKey: ["attendance", dateStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance")
        .select("*, workers(name)")
        .eq("date", dateStr)
        .order("check_in_time");
      if (error) throw error;
      return data as AttendanceRecord[];
    },
  });

  // تسجيل الحضور
  const checkInMutation = useMutation({
    mutationFn: async (workerId: string) => {
      const now = format(new Date(), "HH:mm:ss");
      const { error } = await supabase.from("attendance").upsert({
        worker_id: workerId,
        date: dateStr,
        check_in_time: now,
      }, {
        onConflict: "worker_id,date",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "تم تسجيل الحضور بنجاح" });
      queryClient.invalidateQueries({ queryKey: ["attendance", dateStr] });
      setSelectedWorker("");
    },
    onError: () => {
      toast({ title: "خطأ في تسجيل الحضور", variant: "destructive" });
    },
  });

  // تسجيل الانصراف
  const checkOutMutation = useMutation({
    mutationFn: async (workerId: string) => {
      const now = format(new Date(), "HH:mm:ss");
      const { error } = await supabase
        .from("attendance")
        .update({ check_out_time: now })
        .eq("worker_id", workerId)
        .eq("date", dateStr);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "تم تسجيل الانصراف بنجاح" });
      queryClient.invalidateQueries({ queryKey: ["attendance", dateStr] });
    },
    onError: () => {
      toast({ title: "خطأ في تسجيل الانصراف", variant: "destructive" });
    },
  });

  const getWorkerAttendance = (workerId: string) => {
    return attendanceRecords.find((r) => r.worker_id === workerId);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/pos")}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Clock className="h-6 w-6" />
              الحضور والانصراف
            </h1>
            <p className="text-muted-foreground text-sm">تسجيل حضور وانصراف العمال</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* التقويم */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                اختر التاريخ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                locale={ar}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          {/* تسجيل الحضور */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                تسجيل الحضور - {format(selectedDate, "EEEE d MMMM yyyy", { locale: ar })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* إضافة حضور جديد */}
              {isAdmin && (
                <div className="flex gap-2 p-4 bg-secondary rounded-lg">
                  <Select value={selectedWorker} onValueChange={setSelectedWorker}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="اختر العامل..." />
                    </SelectTrigger>
                    <SelectContent>
                      {workers
                        .filter((w) => !getWorkerAttendance(w.id)?.check_in_time)
                        .map((worker) => (
                          <SelectItem key={worker.id} value={worker.id}>
                            {worker.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => selectedWorker && checkInMutation.mutate(selectedWorker)}
                    disabled={!selectedWorker || checkInMutation.isPending}
                    className="gap-2"
                  >
                    <LogIn className="h-4 w-4" />
                    تسجيل حضور
                  </Button>
                </div>
              )}

              {/* جدول الحضور */}
              {isLoading ? (
                <p className="text-center py-8 text-muted-foreground">جاري التحميل...</p>
              ) : attendanceRecords.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">لا يوجد سجلات حضور لهذا اليوم</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>العامل</TableHead>
                      <TableHead>وقت الحضور</TableHead>
                      <TableHead>وقت الانصراف</TableHead>
                      <TableHead>الحالة</TableHead>
                      {isAdmin && <TableHead>الإجراء</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {record.workers?.name || "غير معروف"}
                        </TableCell>
                        <TableCell>
                          {record.check_in_time ? (
                            <span className="font-mono">{record.check_in_time.slice(0, 5)}</span>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          {record.check_out_time ? (
                            <span className="font-mono">{record.check_out_time.slice(0, 5)}</span>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          {record.check_out_time ? (
                            <Badge variant="secondary">انصرف</Badge>
                          ) : record.check_in_time ? (
                            <Badge className="bg-success">حاضر</Badge>
                          ) : (
                            <Badge variant="destructive">غائب</Badge>
                          )}
                        </TableCell>
                        {isAdmin && (
                          <TableCell>
                            {record.check_in_time && !record.check_out_time && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => checkOutMutation.mutate(record.worker_id)}
                                disabled={checkOutMutation.isPending}
                                className="gap-1"
                              >
                                <LogOutIcon className="h-3 w-3" />
                                انصراف
                              </Button>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
