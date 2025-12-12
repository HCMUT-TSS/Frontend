import { useState, useEffect, useCallback } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  addMonths, 
  subMonths, 
  parseISO, 
  startOfWeek, // MỚI: Để lấy ngày đầu tuần (T2)
  endOfWeek,   // MỚI: Để lấy ngày cuối tuần (CN)
  isSameMonth  // MỚI: Để kiểm tra ngày thuộc tháng hiện tại
} from 'date-fns';
import { vi } from 'date-fns/locale';
import axios from 'axios';
import { toast } from 'sonner';

import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Calendar, Clock, Video, Plus, ChevronLeft, ChevronRight, MapPin, User, FileText } from 'lucide-react';
import TutorDashboard from './tutor/TutorDashboard';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
});

// ==================== DỮ LIỆU CHUNG ====================
interface Availability {
  tutorId: number;
  tutorName: string;
  faculty?: string;
  date: string;
  startTime: string;
  endTime: string;

  // THÊM 4 DÒNG NÀY → KHÔNG CÒN LỖI NỮA!
  title?: string;
  location?: string;
  meetingType?: 'online' | 'offline' | null;
  meetLink?: string | null;
}

interface Booking {
  id: number;
  tutorName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'rejected';
  meetLink?: string;
  note?: string;
  location?: string;
}

export default function SessionCalendar({ userRole = 'student' }: { userRole: 'student' | 'tutor' | 'admin' }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);
  const [locationType, setLocationType] = useState<'online' | 'cs1' | 'cs2'>('online');
  const [customLocation, setCustomLocation] = useState('');
  
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [requestOpen, setRequestOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Availability | null>(null);
  const [note, setNote] = useState('');

  // ==================== FETCH DATA ====================
  const fetchData = useCallback(async () => {
    if (userRole !== 'student') {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [availRes, bookingRes] = await Promise.all([
        api.get('/api/student/availabilities?days=14'),
        api.get('/api/student/my/bookings'),
      ]);

      const slots = availRes.data?.slots || availRes.data || [];
      const bookings = bookingRes.data?.bookings || bookingRes.data || [];

      setAvailabilities(Array.isArray(slots) ? slots : []);
      setMyBookings(Array.isArray(bookings) ? bookings : []);
    } catch (err: any) {
      console.error('Lỗi tải dữ liệu:', err);
      toast.error('Không thể tải lịch');
      setAvailabilities([]);
      setMyBookings([]);
    } finally {
      setIsLoading(false);
    }
  }, [userRole]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ==================== ĐẶT LỊCH ====================
  const handleBook = async () => {
    if (!selectedSlot) return;

    // --- LOGIC TẠO ĐỊA ĐIỂM ---
    let finalLocation = 'Online'; // Mặc định

    if (locationType === 'online') {
      finalLocation = 'Google Meet';
    } else if (locationType === 'cs1') {
      // Nếu chọn CS1 nhưng không nhập phòng -> Ghi mặc định
      finalLocation = `CS1 (Q.10) - ${customLocation.trim() || 'Chưa báo số phòng'}`;
    } else if (locationType === 'cs2') {
      // Nếu chọn CS2 nhưng không nhập phòng
      finalLocation = `CS2 (Thủ Đức) - ${customLocation.trim() || 'Chưa báo số phòng'}`;
    }

    console.log("📍 Location sending:", finalLocation); // Debug xem gửi gì

    try {
      await api.post('/api/student/bookings/request', {
        tutorId: selectedSlot.tutorId,
        preferredDate: selectedSlot.date,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        description: note,
        location: finalLocation, // <--- BẮT BUỘC PHẢI CÓ DÒNG NÀY
      });

      toast.success('Đã gửi yêu cầu thành công!');
      setRequestOpen(false);
      
      // Reset form
      setNote('');
      setCustomLocation('');
      setLocationType('online');
      
      fetchData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Gửi thất bại');
    }
  };

  // ==================== LOGIC LỊCH CHUẨN (REAL CALENDAR) ====================
  // Bắt đầu từ Thứ 2 (weekStartsOn: 1) để khớp với header T2 -> CN
  const monthDays = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 }),
  });

  const daysHeader = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  // ==================== RENDER THEO ROLE ====================
  if (userRole === 'tutor') {
    return <TutorDashboard />;
  }

  if (userRole === 'admin') {
    return <div className="p-6">Admin Dashboard</div>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-8 border-[#0B5FA5] border-t-transparent mx-auto mb-6"></div>
          <p className="text-2xl font-bold text-[#0B5FA5]">Đang tải lịch tư vấn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-center text-[#0B5FA5] mb-10">
        CỔNG ĐẶT LỊCH TƯ VẤN
      </h1>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8 bg-gray-100 p-1 rounded-xl">
          <TabsTrigger value="calendar">Lịch của tôi</TabsTrigger>
          <TabsTrigger value="tutor-slots">Chọn slot rảnh</TabsTrigger>
          <TabsTrigger value="my-requests">Yêu cầu của tôi</TabsTrigger>
        </TabsList>

        {/* TAB 1: LỊCH CÁ NHÂN (ĐÃ ĐỒNG BỘ GIAO DIỆN) */}
        <TabsContent value="calendar" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LỊCH THÁNG */}
            <div className="lg:col-span-2">
              <Card className="shadow-xl border-none">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-2xl text-[#0B5FA5] capitalize">
                      Tháng {format(currentMonth, 'MM/yyyy')}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                        <ChevronLeft className="w-5 h-5" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Header Thứ: T2 -> CN */}
                  <div className="grid grid-cols-7 gap-2 text-center font-bold text-[#0B5FA5] mb-3">
                    {daysHeader.map((d) => (
                      <div key={d} className="py-3 bg-[#0B5FA5]/10 rounded-lg">{d}</div>
                    ))}
                  </div>

                  {/* Grid Ngày */}
                  <div className="grid grid-cols-7 gap-3">
                    {monthDays.map((day) => {
                      // Lấy các buổi đã confirmed
                      const confirmedBookings = myBookings.filter(b => 
                        b.status === 'confirmed' && 
                        b.date === format(day, 'yyyy-MM-dd')
                      );

                      const totalConfirmed = confirmedBookings.length;
                      const isToday = isSameDay(day, today);
                      const isSelected = isSameDay(day, selectedDate);
                      const isCurrentMonth = isSameMonth(day, currentMonth);

                      return (
                        <button
                          key={day.toString()}
                          onClick={() => setSelectedDate(day)}
                          className={`
                            min-h-28 p-2 rounded-2xl border-2 transition-all relative flex flex-col items-center justify-start gap-1
                            ${!isCurrentMonth ? 'opacity-30 bg-gray-50' : 'bg-white'} 
                            ${isToday ? 'border-[#0B5FA5] bg-blue-50 shadow-md' : 'border-gray-200'}
                            ${isSelected ? 'ring-2 ring-[#0B5FA5] ring-offset-2' : ''}
                            hover:shadow-lg hover:scale-[1.02]
                          `}
                        >
                          <span className={`text-lg font-bold ${isToday ? 'text-[#0B5FA5]' : 'text-gray-700'}`}>
                            {format(day, 'd')}
                          </span>
                          
                          {totalConfirmed > 0 && isCurrentMonth && (
                            <Badge className="bg-[#0B5FA5] hover:bg-[#094a85] text-white text-[10px] px-2 py-0.5 mt-1">
                              {totalConfirmed} lớp
                            </Badge>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* CHI TIẾT NGÀY ĐÃ CHỌN */}
            <div className="lg:col-span-1">
              <Card className="h-full bg-gradient-to-br from-[#0B5FA5] to-blue-700 text-white shadow-2xl border-none">
                <CardHeader>
                  <CardTitle className="text-2xl capitalize">
                    {format(selectedDate, 'EEEE, dd/MM/yyyy', { locale: vi })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                  {(() => {
                    const dateStr = format(selectedDate, 'yyyy-MM-dd');
                    const confirmedOnDate = myBookings.filter(b => 
                      b.status === 'confirmed' && b.date === dateStr
                    );

                    return confirmedOnDate.length === 0 ? (
                      <div className="text-center py-12 flex flex-col items-center opacity-80">
                        <Calendar className="w-16 h-16 mb-4 opacity-50" />
                        <p className="text-xl font-medium">Không có buổi học nào</p>
                      </div>
                    ) : (
                      confirmedOnDate.map((b) => (
                        <div 
                          key={b.id} 
                          className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 shadow-lg mb-4"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <User className="w-5 h-5 text-green-300" />
                              <span className="font-bold text-lg truncate w-40">{b.tutorName}</span>
                            </div>
                            <Badge className="bg-green-500 text-white border-none">Confirmed</Badge>
                          </div>

                          <div className="text-2xl font-bold mb-2 tracking-tight">
                            {b.startTime} - {b.endTime}
                          </div>

                          <div className="space-y-1 text-sm text-blue-100">
                            <div className="flex items-center gap-2">
                              {b.location && (b.location.includes('Google') || b.location.includes('Meet')) ? (
                                <>
                                  <Video className="w-4 h-4" />
                                  <span>Online • {b.location}</span>
                                </>
                              ) : (
                                <>
                                  <MapPin className="w-4 h-4" />
                                  <span>{b.location || 'Chưa xác định'}</span>
                                </>
                              )}
                            </div>
                            
                            {b.note && (
                              <div className="italic opacity-80 pl-6 border-l-2 border-green-300/50 mt-1">
                                "{b.note}"
                              </div>
                            )}
                          </div>

                          {b.meetLink && (
                            <Button 
                              className="w-full mt-4 bg-white text-[#0B5FA5] hover:bg-gray-100 font-bold rounded-xl"
                              asChild
                            >
                              <a href={b.meetLink} target="_blank" rel="noopener noreferrer">
                                <Video className="w-4 h-4 mr-2" /> Vào lớp học
                              </a>
                            </Button>
                          )}
                        </div>
                      ))
                    );
                  })()}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: CHỌN SLOT RẢNH – ĐƠN GIẢN NHƯ BẠN MUỐN, NHƯNG HIỂN THỊ ĐÚNG TIÊU ĐỀ + ĐỊA ĐIỂM */}
<TabsContent value="tutor-slots">
  <Card className="shadow-lg border-none">
    <CardHeader>
      <CardTitle className="text-[#0B5FA5] text-2xl">Đăng ký lịch tư vấn với Tutor</CardTitle>
    </CardHeader>
    <CardContent>
      {availabilities.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Calendar className="w-16 h-16 mx-auto mb-3 opacity-20" />
          <p className="text-lg">Hiện chưa có tutor nào đăng ký lịch rảnh</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tutor</TableHead>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Ngày</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Hình thức</TableHead>
              <TableHead>Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {availabilities.map((slot) => {
              // GỘP ĐỊA ĐIỂM THÔNG MINH
              const locationDisplay = 
                slot.meetLink?.trim() || 
                slot.location?.trim() || 
                (slot.meetingType === 'online' ? 'Google Meet' : 
                 slot.meetingType === 'offline' ? 'Tại cơ sở' : 'Chưa xác định');

              const isOnline = slot.meetingType === 'online' || !!slot.meetLink;

              return (
                <TableRow key={`${slot.tutorId}-${slot.date}-${slot.startTime}`}>
                  <TableCell className="font-bold text-[#0B5FA5] text-lg">
                    {slot.tutorName}
                  </TableCell>
                  <TableCell className="font-medium max-w-52">
                    <p className="truncate" title={slot.title}>
                      {slot.title || 'Tư vấn 1:1'}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-bold text-gray-800">
                        {format(parseISO(slot.date), 'dd/MM/yyyy')}
                      </p>
                      <p className="text-sm text-[#0B5FA5] font-semibold capitalize">
                        {format(parseISO(slot.date), 'EEEE', { locale: vi })}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="px-3 py-1 text-base font-mono">
                      {slot.startTime} - {slot.endTime}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {isOnline ? (
                        <>
                          <Video className="w-5 h-5 text-blue-600" />
                          <span className="font-medium text-blue-700">Online</span>
                        </>
                      ) : (
                        <>
                          <MapPin className="w-5 h-5 text-red-600" />
                          <span className="font-medium text-red-700">Offline</span>
                        </>
                      )}
                    </div>
                    {locationDisplay !== 'Google Meet' && locationDisplay !== 'Chưa xác định' && (
                      <p className="text-xs text-gray-600 mt-1 truncate max-w-40" title={locationDisplay}>
                        {locationDisplay}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      className="bg-[#0B5FA5] hover:bg-[#094a85] text-white font-bold"
                      onClick={() => {
                        setSelectedSlot(slot);
                        setRequestOpen(true);
                      }}
                    >
                      <Plus className="w-5 h-5 mr-2" /> Đặt lịch ngay
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </CardContent>
  </Card>
</TabsContent>

        {/* TAB 3: YÊU CẦU CỦA TÔI (ĐÃ BỔ SUNG) */}
        <TabsContent value="my-requests">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[#0B5FA5]">Lịch sử yêu cầu</h2>
              <Badge variant="outline" className="text-base px-4 py-1 text-[#0B5FA5] border-[#0B5FA5]">
                {myBookings.filter(b => b?.status === 'pending').length} đang chờ
              </Badge>
            </div>

            {myBookings.length === 0 ? (
              <Card className="text-center py-16 bg-gray-50">
                <p className="text-gray-500">Bạn chưa gửi yêu cầu nào</p>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {myBookings.map((b) => {
                  const dateObj = b.date ? parseISO(b.date) : null;
                  const statusConfig = {
                    confirmed: { color: 'border-green-500', badge: 'bg-green-100 text-green-700', text: 'Đã xác nhận' },
                    pending: { color: 'border-yellow-500', badge: 'bg-yellow-100 text-yellow-700', text: 'Đang chờ duyệt' },
                    rejected: { color: 'border-red-500', badge: 'bg-red-100 text-red-700', text: 'Bị từ chối' },
                  }[b.status] || { color: 'border-gray-400', badge: 'bg-gray-100', text: 'Không rõ' };

                  return (
                    <Card key={b.id} className={`border-t-4 shadow-md ${statusConfig.color} hover:shadow-lg transition-all`}>
                      <CardContent className="p-5 space-y-3">
                        <div className="flex justify-between items-start">
                          <Badge className={`${statusConfig.badge} hover:${statusConfig.badge} border-none`}>{statusConfig.text}</Badge>
                          {dateObj && <span className="text-sm font-medium text-gray-500">{format(dateObj, 'dd/MM/yyyy')}</span>}
                        </div>
                        
                        <div>
                          <h4 className="font-bold text-lg text-[#0B5FA5] truncate" title={b.tutorName}>{b.tutorName}</h4>
                          <p className="text-sm font-mono text-gray-700 mt-1 flex items-center gap-1">
                             <Clock className="w-3 h-3"/> {b.startTime} - {b.endTime}
                          </p>
                        </div>

                        <div className="pt-3 border-t space-y-2">
                           <div className="text-sm text-gray-600 flex items-start gap-2">
                               <MapPin className="w-4 h-4 mt-0.5 text-red-500 shrink-0"/>
                               <span className="truncate">{b.location || 'Online'}</span>
                           </div>
                           
                           {b.note && (
                             <div className="text-sm text-gray-500 flex items-start gap-2 bg-gray-50 p-2 rounded">
                               <FileText className="w-3 h-3 mt-1 shrink-0"/>
                               <span className="italic line-clamp-2">"{b.note}"</span>
                             </div>
                           )}

                           {b.status === 'confirmed' && b.meetLink && (
                             <a href={b.meetLink} target="_blank" className="text-sm text-[#0B5FA5] underline font-bold mt-2 block text-center bg-blue-50 py-1 rounded">
                               Vào phòng học ngay &rarr;
                             </a>
                           )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* DIALOG ĐẶT LỊCH */}
      <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
  <DialogContent className="max-w-md mx-auto p-6 bg-white rounded-2xl">
    <DialogHeader>
      <DialogTitle className="text-2xl font-bold text-center text-[#0B5FA5]">
        Đặt lịch tư vấn
      </DialogTitle>
    </DialogHeader>

    {selectedSlot && (
      <div className="space-y-6 mt-4">
        {/* THÔNG TIN BUỔI */}
        <div className="text-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-2xl border border-blue-200">
          <p className="text-3xl font-bold text-[#0B5FA5]">
            {selectedSlot.title || 'Tư vấn 1:1'}
          </p>
          <p className="text-xl font-semibold text-gray-800 mt-3">
            {selectedSlot.tutorName}
          </p>
          <p className="text-lg text-gray-700 mt-4">
            {format(parseISO(selectedSlot.date), 'EEEE, dd/MM/yyyy', { locale: vi })}
          </p>
          <p className="text-2xl font-bold text-gray-800 mt-3">
            {selectedSlot.startTime} - {selectedSlot.endTime}
          </p>

          {/* ĐỊA ĐIỂM */}
          {(() => {
            const loc = selectedSlot.meetLink?.trim() || 
                        selectedSlot.location?.trim() || 
                        (selectedSlot.meetingType === 'online' ? 'Google Meet' : 'Tại cơ sở');
            const isOnline = selectedSlot.meetingType === 'online' || !!selectedSlot.meetLink;

            return (
              <div className="mt-6 flex items-center justify-center gap-3 text-lg font-bold">
                {isOnline ? <Video className="w-7 h-7 text-blue-600" /> : <MapPin className="w-7 h-7 text-red-600" />}
                <span className={isOnline ? 'text-blue-700' : 'text-red-700'}>
                  {isOnline ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>
            );
          })()}

          {selectedSlot.meetLink && (
            <a
              href={selectedSlot.meetLink}
              target="_blank"
              className="block mt-4 text-blue-600 underline font-medium"
            >
              Mở link Google Meet
            </a>
          )}
          {selectedSlot.location && !selectedSlot.meetLink && (
            <p className="mt-4 text-gray-700 font-medium">
              {selectedSlot.location}
            </p>
          )}
        </div>

        {/* GHI CHÚ */}
        <div>
          <label className="block text-lg font-medium mb-2">Ghi chú cho tutor (không bắt buộc)</label>
          <textarea
            rows={3}
            className="w-full p-4 border rounded-xl resize-none focus:outline-none focus:border-[#0B5FA5]"
            placeholder="VD: Em muốn ôn lại phần Linked List..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Button variant="outline" size="lg" onClick={() => setRequestOpen(false)}>
            Hủy
          </Button>
          <Button 
            size="lg" 
            onClick={handleBook}
            className="bg-[#0B5FA5] hover:bg-[#094a85] text-white font-bold px-10"
          >
            Gửi yêu cầu đặt lịch
          </Button>
        </div>
      </div>
    )}
  </DialogContent>
</Dialog>
    </div>
  );
}