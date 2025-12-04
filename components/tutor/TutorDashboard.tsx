// src/components/tutor/TutorDashboard.tsx
import { useState, useEffect, useCallback } from 'react';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameDay, isSameMonth, addMonths, subMonths, getDay
} from 'date-fns';
import { vi } from 'date-fns/locale';
import axios from 'axios';
import { toast } from 'sonner';

import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import {
  Calendar, Clock, Plus, ChevronLeft, ChevronRight, Trash2,
  Check, XCircle, MapPin, UserCheck, Users, Video
} from 'lucide-react';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
});

interface ScheduleItem {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface BookingRequest {
  id: number;
  student: { user: { name: string; ssoSub: string } };
  preferredDate?: string;
  preferredTime?: string;
  note?: string;
  status: string;
}

export default function TutorDashboard() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newSlot, setNewSlot] = useState({ date: '', time: '' });

  const monthDays = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [schedRes, reqRes] = await Promise.all([
        api.get('/api/tutor/schedule'),
        api.get('/api/tutor/booking-requests'),
      ]);
      setSchedule(Array.isArray(schedRes.data) ? schedRes.data : schedRes.data?.schedules || []);
        setRequests(Array.isArray(reqRes.data) ? reqRes.data : reqRes.data?.requests || []);
    } catch (err: any) {
      toast.error('Lỗi tải dữ liệu: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // XỬ LÝ THÊM LỊCH RẢNH – ĐÃ FIX 100% HOẠT ĐỘNG
  const handleAddAvailability = async (e: React.FormEvent) => {
    e.preventDefault();

    // Kiểm tra định dạng
    const timeMatch = newSlot.time.match(/^(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})$/);
    if (!timeMatch) {
      toast.error('Vui lòng nhập đúng định dạng: 14:00 - 16:00');
      return;
    }

    const [_, startTime, endTime] = timeMatch;

    if (!newSlot.date) {
      toast.error('Vui lòng chọn ngày');
      return;
    }

    const dateObj = new Date(newSlot.date);
    const dayOfWeek = dateObj.getDay() === 0 ? 7 : dateObj.getDay(); // CN = 7

    try {
      await api.post('/api/tutor/schedule', {
        dayOfWeek,
        startTime,
        endTime,
      });

      toast.success('Đã thêm lịch rảnh thành công!');
      setIsAddOpen(false);
      setNewSlot({ date: '', time: '' });
      fetchData(); // reload lại danh sách
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Thêm thất bại');
    }
  };
  const handleDelete = async (id: number) => {
    if (!confirm('Xóa khung giờ này?')) return;
    try {
      await api.delete(`/api/tutor/schedule/${id}`);
      toast.success('Đã xóa');
      fetchData();
    } catch {
        toast.error('Xóa thất bại');
    }
  };

  const handleConfirm = async (id: number) => {
    try {
      await api.patch(`/api/tutor/booking-requests/${id}/confirm`);
      toast.success('Đã xác nhận buổi tư vấn!');
      fetchData();
    } catch {
      toast.error('Xác nhận thất bại');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await api.patch(`/api/tutor/booking-requests/${id}/reject`);
      toast.success('Đã từ chối');
      fetchData();
    } catch {
      toast.error('Từ chối thất bại');
    }
  };

  // LỌC BUỔI DẠY TRONG NGÀY ĐƯỢC CHỌN
  const selectedDayEvents = schedule
    .filter(s => {
      const slotDay = s.dayOfWeek === 7 ? 0 : s.dayOfWeek; // CN: 7 → 0
      return slotDay === selectedDate.getDay();
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-8 border-[#0B5FA5] border-t-transparent mx-auto mb-6"></div>
          <p className="text-2xl font-bold text-[#0B5FA5]">Đang tải dashboard tutor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-[#0B5FA5] mb-2">CỔNG THÔNG TIN TUTOR</h1>
      </div>

      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="schedule" className="data-[state=active]:bg-[#0B5FA5] data-[state=active]:text-white rounded-md">
            Lịch của tôi
          </TabsTrigger>
          <TabsTrigger value="availability" className="data-[state=active]:bg-[#0B5FA5] data-[state=active]:text-white rounded-md">
            Lịch rảnh
          </TabsTrigger>
          <TabsTrigger value="requests" className="data-[state=active]:bg-[#0B5FA5] data-[state=active]:text-white rounded-md">
            Yêu cầu 1-1
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: LỊCH DẠY – SIÊU ĐẸP NHƯ MONG MUỐN */}
        <TabsContent value="schedule" className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold">
              {format(currentMonth, 'MMMM yyyy', { locale: vi })}
            </h3>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* CỘT TRÁI: LỊCH THÁNG */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-700 mb-2">
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => (
                  <div key={day} className="py-2">{day}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {monthDays.map((day) => {
                  const dayOfWeekNum = day.getDay() === 0 ? 7 : day.getDay();
                  const dayEvents = schedule.filter(s => s.dayOfWeek === dayOfWeekNum);

                  const isToday = isSameDay(day, today);
                  const hasEvent = dayEvents.length > 0;
                  const isCurrentMonth = isSameMonth(day, currentMonth);

                  return (
                    <div
                      key={day.toString()}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        relative min-h-24 rounded-lg border cursor-pointer text-xs transition-all p-1
                        ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'}
                        ${isToday ? 'border-blue-600 border-2 font-bold shadow-md' : 'border-gray-200'}
                        ${hasEvent ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'}
                        hover:shadow-sm
                      `}
                    >
                      <div className={`text-right font-medium mb-1 ${isToday ? 'text-blue-600' : ''}`}>
                        {format(day, 'd')}
                      </div>

                      {hasEvent && (
                        <div className="flex flex-col gap-1">
                          {dayEvents.slice(0, 2).map((ev, idx) => (
                            <div key={idx} className="bg-[#0B5FA5] text-white text-[10px] px-1 py-0.5 rounded truncate">
                              {ev.startTime} - {ev.endTime}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <span className="text-[10px] text-gray-500 pl-1">+{dayEvents.length - 2} khác</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CỘT PHẢI: CHI TIẾT NGÀY */}
            <div className="lg:col-span-1">
              <Card className="h-full border-blue-200 sticky top-6">
                <CardHeader className="bg-blue-50 border-b">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    {format(selectedDate, 'EEEE', { locale: vi })}
                  </CardTitle>
                  <p className="text-2xl font-bold text-blue-700">
                    {format(selectedDate, 'd', { locale: vi })}
                  </p>
                  <p className="text-sm text-gray-600">
                    {format(selectedDate, 'MMMM yyyy', { locale: vi })}
                  </p>
                </CardHeader>
                <CardContent className="pt-4 max-h-[600px] overflow-y-auto">
                  {selectedDayEvents.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Không có lịch dạy nào</p>
                      <Button variant="link" onClick={() => setIsAddOpen(true)} className="text-[#0B5FA5]">
                        + Đăng ký lịch rảnh
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedDayEvents.map((slot) => (
                        <div key={slot.id} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-blue-300 transition-colors">
                          <h4 className="font-semibold text-[#0B5FA5]">Buổi tư vấn</h4>
                          <div className="mt-2 space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">{slot.startTime} - {slot.endTime}</span>
                            </div>
                          </div>
                          <div className="mt-3">
                            <Badge className="bg-green-600 text-white">Sẵn sàng</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: LỊCH RẢNH – ĐÃ FIX 100% THÊM ĐƯỢC */}
        <TabsContent value="availability" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold">Đăng ký lịch rảnh</h3>
              <p className="text-sm text-gray-500">Chọn ngày và khung giờ bạn rảnh</p>
            </div>

            {/* DIALOG THÊM LỊCH RẢNH */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#0B5FA5] hover:bg-[#094A7F]">
                  <Plus className="w-4 h-4 mr-2" /> Thêm lịch rảnh
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Thêm khung giờ rảnh</DialogTitle>
                  <DialogDescription>
                    Chọn ngày và nhập khung giờ theo định dạng: <code className="bg-gray-200 px-2 py-1 rounded">14:00 - 16:00</code>
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleAddAvailability} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="Ngày"></Label>
                    <Input
                      type="date"
                      required
                      value={newSlot.date}
                      onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Khung giờ</Label>
                    <Input
                      type="text"
                      placeholder="14:00 - 16:00"
                      required
                      value={newSlot.time}
                      onChange={(e) => setNewSlot({ ...newSlot, time: e.target.value })}
                    />
                    <p className="text-xs text-gray-500">Nhập đúng định dạng: giờ bắt đầu - giờ kết thúc</p>
                  </div>

                  <div className="flex gap-3 justify-end">
                    <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                      Hủy
                    </Button>
                    <Button type="submit" className="bg-[#0B5FA5]">
                      Thêm ngay
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* BẢNG LỊCH RẢNH */}
          {schedule.length === 0 ? (
            <Card>
              <CardContent className="py-20 text-center">
                <p className="text-xl text-gray-500">Bạn chưa đăng ký lịch rảnh nào</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Thứ</TableHead>
                      <TableHead>Khung giờ</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedule.map((slot) => (
                      <TableRow key={slot.id}>
                        <TableCell className="font-medium">
                          {['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'][slot.dayOfWeek === 7 ? 0 : slot.dayOfWeek]}
                        </TableCell>
                        <TableCell>{slot.startTime} - {slot.endTime}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            Đang rảnh
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(slot.id)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* TAB 3: YÊU CẦU */}
        <TabsContent value="requests" className="space-y-6">
          <div>
            <h3 className="text-2xl font-bold">Yêu cầu ghép cặp 1-1</h3>
            <p className="text-sm text-gray-500">Sinh viên yêu cầu tư vấn riêng với bạn</p>
          </div>

          <div className="space-y-4">
            {requests.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-gray-500 text-lg">Chưa có yêu cầu nào</CardContent></Card>
            ) : (
              requests.map((req) => (
                <Card key={req.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-3">
                        <div className="flex justify-between">
                          <h4 className="font-bold text-xl">{req.student.user.name}</h4>
                          <span className="text-sm text-gray-500">{req.student.user.ssoSub}</span>
                        </div>
                        {req.note && <p className="italic text-gray-600 bg-gray-50 p-3 rounded">"{req.note}"</p>}
                      </div>
                      {req.status === 'pending' && (
                        <div className="flex flex-col gap-3 ml-6">
                          <Button size="sm" className="bg-green-600" onClick={() => handleConfirm(req.id)}>
                            <Check className="w-4 h-4 mr-1" /> Chấp nhận
                          </Button>
                          <Button size="sm" variant="outline" className="border-red-600 text-red-600" onClick={() => handleReject(req.id)}>
                            <XCircle className="w-4 h-4 mr-1" /> Từ chối
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}