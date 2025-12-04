// src/components/tutor/TutorDashboard.tsx
import { useState, useEffect, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import axios from 'axios';
import { toast } from 'sonner';

import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Calendar, Clock, Plus, ChevronLeft, ChevronRight, Trash2, Check, XCircle } from 'lucide-react';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
});

interface Schedule {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface BookingRequest {
  id: number;
  student: { user: { name: string; email: string } };
  preferredDate: string;
  startTime: string;
  endTime: string;
  subject?: string;
  description?: string;
  status: 'pending' | 'confirmed' | 'rejected';
}

export default function TutorDashboard() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form state cho thêm lịch rảnh
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<string>('3'); // Thứ 4 mặc định
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('16:00');

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
      setSchedule(Array.isArray(schedRes.data) ? schedRes.data : schedRes.data.schedules || []);
      setRequests(Array.isArray(reqRes.data) ? reqRes.data : reqRes.data.requests || []);
    } catch (err: any) {
      toast.error('Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // THÊM LỊCH RẢNH – HOÀN TOÀN ĐÚNG NHƯ DEMO
  const handleAddSchedule = async () => {
    if (!startTime || !endTime) {
      toast.error('Vui lòng nhập đầy đủ giờ');
      return;
    }

    try {
      await api.post('/api/tutor/schedule', {
        dayOfWeek: Number(selectedDayOfWeek),
        startTime,
        endTime,
      });

      toast.success('Đã thêm lịch rảnh thành công!');
      setIsAddOpen(false);
      fetchData();
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
      await api.patch(`/api/tutor/booking-requests/${id}/confirm`, {
        meetLink: "https://meet.google.com/tutor-session-" + Date.now()
      });
      toast.success('Đã xác nhận buổi học!');
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

  const dayNames = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

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
    <div className="p-6 max-w-7xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-[#0B5FA5] mb-3">CỔNG THÔNG TIN TUTOR</h1>
        <p className="text-2xl font-semibold">Nguyễn Minh Tâm</p>
      </div>

      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-10 bg-gradient-to-r from-[#0B5FA5] to-blue-700 p-2 rounded-2xl shadow-lg">
          <TabsTrigger value="schedule" className="data-[state=active]:bg-white data-[state=active]:text-[#0B5FA5] text-white text-lg font-semibold rounded-xl">Lịch dạy</TabsTrigger>
          <TabsTrigger value="availability" className="data-[state=active]:bg-white data-[state=active]:text-[#0B5FA5] text-white text-lg font-semibold rounded-xl">Lịch rảnh</TabsTrigger>
          <TabsTrigger value="requests" className="data-[state=active]:bg-white data-[state=active]:text-[#0B5FA5] text-white text-lg font-semibold rounded-xl">Yêu cầu đặt lịch</TabsTrigger>
        </TabsList>

        {/* TAB 1: LỊCH DẠY */}
        <TabsContent value="schedule" className="space-y-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-3xl font-bold text-[#0B5FA5]">
              {format(currentMonth, 'MMMM yyyy', { locale: vi })}
            </h3>
            <div className="flex gap-3">
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 bg-white rounded-3xl shadow-2xl p-8">
              <div className="grid grid-cols-7 gap-3 text-center font-bold text-gray-700 mb-6">
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
                  <div key={d} className="py-3 bg-gradient-to-b from-[#0B5FA5] to-blue-600 text-white rounded-xl">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-4">
                {monthDays.map(day => {
                  const dayOfWeekNum = day.getDay() === 0 ? 7 : day.getDay();
                  const daySlots = schedule.filter(s => s.dayOfWeek === dayOfWeekNum);
                  const isToday = isSameDay(day, today);

                  return (
                    <div
                      key={day.toString()}
                      onClick={() => setSelectedDate(day)}
                      className={`min-h-32 p-4 rounded-2xl border-4 cursor-pointer transition-all
                        ${isToday ? 'bg-gradient-to-br from-blue-500 to-[#0B5FA5] text-white border-white shadow-xl' : 'bg-white border-gray-300'}
                        ${daySlots.length > 0 ? 'ring-4 ring-[#0B5FA5] shadow-lg' : 'hover:shadow-lg'}
                      `}
                    >
                      <div className="font-bold text-xl">{format(day, 'd')}</div>
                      {daySlots.slice(0, 2).map(s => (
                        <div key={s.id} className="text-xs bg-white/30 backdrop-blur rounded-full px-2 py-1 mt-2">
                          {s.startTime} - {s.endTime}
                        </div>
                      ))}
                      {daySlots.length > 2 && <div className="text-xs mt-1">+{daySlots.length - 2}</div>}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-1">
              <Card className="h-full bg-gradient-to-br from-[#0B5FA5] to-blue-700 text-white shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-2xl">{format(selectedDate, 'EEEE, d MMMM yyyy', { locale: vi })}</CardTitle>
                </CardHeader>
                <CardContent>
                  {schedule.filter(s => s.dayOfWeek === (selectedDate.getDay() === 0 ? 7 : selectedDate.getDay())).length === 0 ? (
                    <p className="text-xl opacity-90">Không có lịch dạy</p>
                  ) : (
                    <div className="space-y-3">
                      {schedule
                        .filter(s => s.dayOfWeek === (selectedDate.getDay() === 0 ? 7 : selectedDate.getDay()))
                        .map(s => (
                          <div key={s.id} className="bg-white/20 backdrop-blur rounded-xl p-4">
                            <p className="font-bold">{s.startTime} - {s.endTime}</p>
                            <Badge className="mt-2 bg-green-500">Rảnh</Badge>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: LỊCH RẢNH – ĐÃ FIX 100% THEO DEMO */}
        <TabsContent value="availability">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-3xl font-bold text-[#0B5FA5]">Khung giờ rảnh của bạn</h3>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-gradient-to-r from-[#0B5FA5] to-blue-700 hover:from-blue-700 hover:to-[#094A7F] text-xl px-8 py-6 shadow-xl">
                  <Plus className="w-7 h-7 mr-3" /> Thêm lịch rảnh
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-2xl">Thêm khung giờ rảnh</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div>
                    <Label className="text-lg">Chọn thứ</Label>
                    <select
                      value={selectedDayOfWeek}
                      onChange={(e) => setSelectedDayOfWeek(e.target.value)}
                      className="w-full mt-2 px-4 py-3 border rounded-lg text-lg"
                    >
                      {[1,2,3,4,5,6,7].map(d => (
                        <option key={d} value={d}>{dayNames[d === 7 ? 0 : d]}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Giờ bắt đầu</Label>
                      <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
                    </div>
                    <div>
                      <Label>Giờ kết thúc</Label>
                      <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex gap-4 justify-end">
                    <Button variant="outline" onClick={() => setIsAddOpen(false)}>Hủy</Button>
                    <Button onClick={handleAddSchedule} className="bg-[#0B5FA5] px-8">
                      Thêm ngay
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {schedule.length === 0 ? (
            <Card className="py-24 text-center"><CardContent><p className="text-2xl text-gray-500">Chưa có lịch rảnh nào</p></CardContent></Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {schedule.map(s => (
                <Card key={s.id} className="border-4 border-green-500 shadow-xl">
                  <CardContent className="pt-6">
                    <p className="text-2xl font-bold text-[#0B5FA5]">{dayNames[s.dayOfWeek === 7 ? 0 : s.dayOfWeek]}</p>
                    <p className="text-3xl font-bold mt-3">{s.startTime} - {s.endTime}</p>
                    <Badge className="mt-4 text-lg px-6 py-2 bg-green-500">Còn trống</Badge>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)} className="mt-4 text-red-600">
                      <Trash2 className="w-6 h-6" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* TAB 3: YÊU CẦU */}
        <TabsContent value="requests">
          <h3 className="text-3xl font-bold text-[#0B5FA5] mb-8">Yêu cầu đặt lịch</h3>
          {requests.length === 0 ? (
            <Card className="py-24 text-center"><CardContent><p className="text-2xl text-gray-500">Chưa có yêu cầu nào</p></CardContent></Card>
          ) : (
            <div className="space-y-6">
              {requests.map(req => (
                <Card key={req.id} className="border-l-8 border-l-[#0B5FA5] shadow-2xl">
                  <CardContent className="pt-8">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-2xl font-bold">{req.student.user.name}</p>
                        <p className="text-lg text-gray-600">{req.student.user.email}</p>
                        <p className="mt-4 text-xl">
                          <Clock className="inline w-6 h-6 mr-2" />
                          {req.preferredDate} • {req.startTime} - {req.endTime}
                        </p>
                        {req.description && <p className="mt-4 italic bg-gray-50 p-4 rounded-xl">"{req.description}"</p>}
                      </div>
                      {req.status === 'pending' && (
                        <div className="flex flex-col gap-4">
                          <Button size="lg" className="bg-green-600" onClick={() => handleConfirm(req.id)}>
                            <Check className="w-8 h-8 mr-3" /> Xác nhận
                          </Button>
                          <Button size="lg" variant="outline" className="border-red-600 text-red-600" onClick={() => handleReject(req.id)}>
                            <XCircle className="w-8 h-8 mr-3" /> Từ chối
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}