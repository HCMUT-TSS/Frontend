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
  isValid, 
  startOfWeek, 
  endOfWeek,
  isSameMonth 
} from 'date-fns';
import { vi } from 'date-fns/locale';
import axios from 'axios';
import { toast } from 'sonner';

import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription 
} from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Calendar, Plus, Trash2, Check, X, User, Video, ChevronLeft, ChevronRight, MapPin, FileText } from 'lucide-react';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
});

// --- INTERFACES ---
interface AvailabilitySlot {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface BookingRequest {
  id: number;
  studentId: number;
  student: { 
    user: { 
      name: string; 
      email?: string;
      faculty?: string;
    } 
  };
  preferredDate: string; 
  startTime: string;
  endTime: string;
  description?: string;
  status: 'pending' | 'confirmed' | 'rejected';
  meetLink?: string;
  location?: string | null;
}

export default function TutorDashboard() {
  const [errorMsg, setErrorMsg] = useState("");
  const today = new Date();

  // Helper check online
  const isOnline = (location?: string | null): boolean => {
    if (!location) return true;
    const loc = String(location).toLowerCase().trim();
    return loc.includes('google') || loc.includes('meet') || loc.includes('zoom') || loc.includes('online');
  };

  const [currentMonth, setCurrentMonth] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);
  
  // STATE DATA
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]); 
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);       
  const [loading, setLoading] = useState(true);
  
  // STATE FORM ADD
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState('3');
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('16:00');

  // --- 1. KHAI BÁO BIẾN QUAN TRỌNG (FIX LỖI CANNOT FIND NAME) ---
  // Dùng cho bảng Availability (0=CN, 1=T2...)
  const dayNames = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

  // --- 2. LOGIC LỊCH CHUẨN (BẮT ĐẦU TỪ THỨ 2) ---
  const monthDays = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }), // T2
    end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 }),       // CN
  });

  // Header lịch hiển thị (Khớp với logic weekStartsOn: 1)
  const daysHeader = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  // --- FETCH DATA ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [scheduleRes, requestsRes] = await Promise.all([
        api.get('/api/tutor/schedule'),
        api.get('/api/tutor/booking-requests'),
      ]);

      const slots = Array.isArray(scheduleRes.data?.schedules) ? scheduleRes.data.schedules : [];
      setAvailabilitySlots(slots);

      const bookings = Array.isArray(requestsRes.data?.requests) ? requestsRes.data.requests : [];
      setBookingRequests(bookings);

    } catch (err: any) {
      console.error('Lỗi tải dữ liệu:', err);
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- HÀM THÊM LỊCH (ĐÃ FIX) ---
  const handleAddAvailability = async () => {
    setErrorMsg(""); // Reset lỗi cũ trước khi gửi

    if (!startTime || !endTime) {
      setErrorMsg('Vui lòng chọn giờ đầy đủ'); // Hiện lỗi ngay
      return;
    }
    
    const dayInt = parseInt(selectedDayOfWeek, 10);

    try {
      await api.post('/api/tutor/schedule', {
        dayOfWeek: dayInt,
        startTime,
        endTime,
      });
      
      toast.success('Thêm lịch thành công!');
      setIsAddOpen(false); // Chỉ đóng khi thành công
      fetchData(); 

    } catch (err: any) {
      console.log("Error details:", err.response);

      // --- LOGIC HIỂN THỊ LỖI ---
      if (err.response && err.response.data && err.response.data.message) {
        // 1. Hiện Toast (Thông báo góc màn hình)
        toast.error(err.response.data.message);
        
        // 2. Hiện chữ đỏ ngay trong Form ("Đập vào mắt")
        setErrorMsg(err.response.data.message);
      } else {
        toast.error("Lỗi kết nối server");
        setErrorMsg("Không thể kết nối đến server.");
      }
      
      // QUAN TRỌNG: Không đóng Dialog (setIsAddOpen(false)) để user thấy lỗi
    }
  };

  // --- HÀM XÓA LỊCH (ĐÃ FIX) ---
  const handleDeleteAvailability = async (id: number) => {
    if (!id) return;
    if (!confirm('Bạn có chắc muốn xóa?')) return;
    
    try {
      await api.delete(`/api/tutor/schedule/${id}`);
      toast.success('Đã xóa khung giờ');
      fetchData();
    } catch (err: any) {
      toast.error('Không thể xóa');
    }
  };

  const handleConfirmRequest = async (id: number) => {
    try {
      await api.patch(`/api/tutor/booking-requests/${id}/confirm`);
      toast.success('Đã xác nhận!');
      fetchData(); 
    } catch {
      toast.error('Lỗi xác nhận');
    }
  };

  const handleRejectRequest = async (id: number) => {
    if (!confirm('Từ chối yêu cầu này?')) return;
    try {
      await api.patch(`/api/tutor/booking-requests/${id}/reject`);
      toast.success('Đã từ chối');
      fetchData();
    } catch {
      toast.error('Lỗi từ chối');
    }
  };

  const getConfirmedSessionsOnDate = (date: Date) => {
    return bookingRequests
      .filter(r => {
        if (r.status !== 'confirmed') return false;
        if (!r.preferredDate) return false;
        const reqDate = parseISO(r.preferredDate);
        return isValid(reqDate) && isSameDay(reqDate, date);
      })
      .map(r => ({
        id: r.id,
        studentName: r.student?.user?.name || 'Sinh viên',
        startTime: r.startTime,
        endTime: r.endTime,
        location: r.location || 'Online',
        meetLink: r.meetLink,
        note: r.description || '',
      }))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  if (loading) return <div className="p-10 text-center">Đang tải dữ liệu...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-center text-[#0B5FA5] mb-10">
        QUẢN LÝ LỊCH DẠY & YÊU CẦU
      </h1>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8 bg-gray-100 p-1 rounded-xl">
          <TabsTrigger value="calendar">Lịch dạy (Confirmed)</TabsTrigger>
          <TabsTrigger value="availability">Cài đặt lịch rảnh</TabsTrigger>
          <TabsTrigger value="requests">
            Yêu cầu chờ duyệt ({bookingRequests.filter(r => r.status === 'pending').length})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: CALENDAR (HIỂN THỊ ĐÚNG NGÀY THỰC TẾ) */}
        <TabsContent value="calendar" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="shadow-xl border-none">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-2xl text-[#0B5FA5] capitalize">
                      {format(currentMonth, 'MMMM yyyy', { locale: vi })}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}><ChevronLeft/></Button>
                      <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}><ChevronRight/></Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* HEADER CỐ ĐỊNH: T2 -> CN */}
                  <div className="grid grid-cols-7 gap-2 text-center font-bold text-[#0B5FA5] mb-3">
                    {daysHeader.map((d) => (
                      <div key={d} className="py-3 bg-[#0B5FA5]/10 rounded-lg">{d}</div>
                    ))}
                  </div>
                  
                  {/* GRID NGÀY */}
                  <div className="grid grid-cols-7 gap-3">
                    {monthDays.map((day) => {
                      const sessions = getConfirmedSessionsOnDate(day);
                      const isToday = isSameDay(day, today);
                      const isSelected = isSameDay(day, selectedDate);
                      const isCurrentMonth = isSameMonth(day, currentMonth);

                      return (
                        <button
                          key={day.toString()}
                          onClick={() => setSelectedDate(day)}
                          className={`
                            min-h-24 p-2 rounded-2xl border-2 transition-all relative flex flex-col items-center justify-start gap-1
                            ${!isCurrentMonth ? 'opacity-40 bg-gray-50' : 'bg-white'}
                            ${isToday ? 'border-[#0B5FA5] bg-blue-50 shadow-md ring-1 ring-[#0B5FA5]' : 'border-gray-200'}
                            ${isSelected ? 'ring-2 ring-[#0B5FA5] ring-offset-2 z-10' : ''}
                            hover:shadow-lg hover:scale-[1.02]
                          `}
                        >
                          <span className={`text-lg font-bold ${isToday ? 'text-[#0B5FA5]' : 'text-gray-700'}`}>
                            {format(day, 'd')}
                          </span>
                          {sessions.length > 0 && isCurrentMonth && (
                            <Badge className="bg-[#0B5FA5] text-white text-[10px] px-2 py-0.5 mt-1">
                              {sessions.length} lớp
                            </Badge>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* CỘT PHẢI: CHI TIẾT NGÀY (ĐÃ BỔ SUNG LOCATION & NOTE) */}
            <div className="lg:col-span-1">
              <Card className="h-full bg-gradient-to-br from-[#0B5FA5] to-blue-700 text-white shadow-2xl border-none">
                <CardHeader>
                  <CardTitle className="text-2xl capitalize">{format(selectedDate, 'EEEE, dd/MM/yyyy', { locale: vi })}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                  {(() => {
                    const dailySessions = getConfirmedSessionsOnDate(selectedDate);

                    if (dailySessions.length === 0) {
                      return (
                        <div className="flex flex-col items-center justify-center h-64 text-center opacity-80">
                          <Calendar className="w-20 h-20 mb-4 opacity-50" />
                          <p className="text-xl font-medium">Không có lịch dạy</p>
                        </div>
                      );
                    }

                    return dailySessions.map((session) => (
                      <div key={session.id} className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 shadow-lg mb-3">
                        <div className="flex justify-between items-start mb-2">
                           <div className="flex items-center gap-2">
                              <User className="w-5 h-5 text-green-300" />
                              <span className="font-bold text-lg truncate w-40" title={session.studentName}>
                                {session.studentName}
                              </span>
                           </div>
                           <Badge className="bg-green-500 border-none text-white hover:bg-green-600">Confirmed</Badge>
                        </div>
                        
                        <div className="text-2xl font-bold mb-3 tracking-wide border-b border-white/10 pb-2">
                          {session.startTime} - {session.endTime}
                        </div>

                        {/* --- BỔ SUNG THÔNG TIN CHI TIẾT --- */}
                        <div className="space-y-3 text-sm text-blue-50">
                           {/* 1. Vị trí */}
                           <div className="flex items-start gap-2">
                              {isOnline(session.location) ? <Video className="w-4 h-4 mt-0.5 text-yellow-300"/> : <MapPin className="w-4 h-4 mt-0.5 text-red-300"/>}
                              <span className="font-medium">{session.location || 'Chưa xác định địa điểm'}</span>
                           </div>

                           {/* 2. Ghi chú (Nếu có) */}
                           {session.note && (
                             <div className="flex items-start gap-2 bg-black/20 p-2 rounded-lg">
                               <FileText className="w-4 h-4 mt-0.5 shrink-0 text-blue-200"/>
                               <span className="italic opacity-90">"{session.note}"</span>
                             </div>
                           )}
                        </div>

                        {session.meetLink && (
                          <Button className="w-full mt-4 bg-white text-[#0B5FA5] hover:bg-gray-100 font-bold shadow-md" asChild>
                             <a href={session.meetLink} target="_blank" rel="noreferrer">
                               <Video className="w-4 h-4 mr-2"/> Vào lớp ngay
                             </a>
                          </Button>
                        )}
                      </div>
                    ));
                  })()}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: AVAILABILITY (ĐÃ FIX LỖI DAYNAMES) */}
        <TabsContent value="availability">
          <Card className="shadow-xl">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl">Khung giờ rảnh hàng tuần</CardTitle>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#0B5FA5] hover:bg-[#094a85]"><Plus className="w-5 h-5 mr-2" /> Thêm khung giờ</Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white max-w-md shadow-2xl rounded-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold text-[#0B5FA5]">Thêm khung giờ rảnh</DialogTitle>
                      <DialogDescription>Chọn thứ và thời gian bạn có thể nhận lớp.</DialogDescription>
                    </DialogHeader>
                    {errorMsg && (
    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
      <X className="w-4 h-4" /> {errorMsg}
    </div>
  )}
                    <div className="space-y-6 py-6">
                      <div className="space-y-2">
                        <Label>Chọn thứ trong tuần</Label>
                        <Select value={selectedDayOfWeek} onValueChange={setSelectedDayOfWeek}>
                          <SelectTrigger className="w-full h-12 bg-white"><SelectValue placeholder="Chọn thứ..." /></SelectTrigger>
                          <SelectContent className="bg-white z-[9999]">
                            {[1,2,3,4,5,6,0].map(d => (
                                <SelectItem key={d} value={d.toString()}>{d === 0 ? 'Chủ Nhật' : `Thứ ${d+1}`}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2"><Label>Bắt đầu</Label><Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} /></div>
                        <div className="space-y-2"><Label>Kết thúc</Label><Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} /></div>
                      </div>
                      <div className="flex gap-4 justify-end pt-4 border-t">
                        <Button variant="outline" onClick={() => setIsAddOpen(false)}>Hủy</Button>
                        <Button onClick={handleAddAvailability} className="bg-[#0B5FA5] text-white">Lưu lại</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {availabilitySlots.length === 0 ? (
                <p className="text-center py-16 text-gray-500">Chưa có khung giờ rảnh nào</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Thứ</TableHead>
                      <TableHead>Thời gian</TableHead>
                      <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {availabilitySlots
                    .sort((a,b) => {
                         const da = a.dayOfWeek === 0 ? 7 : a.dayOfWeek;
                         const db = b.dayOfWeek === 0 ? 7 : b.dayOfWeek;
                         return da - db;
                    })
                    .map(slot => (
                      <TableRow key={slot.id}>
                        {/* FIX LỖI: Đã có dayNames để sử dụng */}
                        <TableCell className="font-bold text-[#0B5FA5]">{dayNames[slot.dayOfWeek]}</TableCell>
                        <TableCell className="font-medium"><Badge variant="outline">{slot.startTime} - {slot.endTime}</Badge></TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteAvailability(slot.id)} className="text-red-600 hover:bg-red-50">
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: REQUESTS (ĐÃ BỔ SUNG LOCATION & NOTE) */}
        <TabsContent value="requests">
          <Card className="shadow-xl">
            <CardHeader><CardTitle className="text-2xl">Yêu cầu đặt lịch</CardTitle></CardHeader>
            <CardContent>
              {bookingRequests.filter(r => r.status === 'pending').length === 0 ? (
                <p className="text-center py-16 text-gray-500">Không có yêu cầu chờ duyệt</p>
              ) : (
                <div className="space-y-4">
                  {bookingRequests.filter(r => r.status === 'pending').map(req => (
                    <Card key={req.id} className="border-l-8 border-l-yellow-500 bg-yellow-50/30">
                      <CardContent className="pt-6 flex flex-col md:flex-row justify-between gap-4">
                        <div className="space-y-2 flex-1">
                           <div className="flex items-center gap-2">
                             <Badge className="bg-yellow-500 hover:bg-yellow-600">PENDING</Badge>
                             <span className="font-bold text-gray-700">
                               {req.preferredDate ? format(parseISO(req.preferredDate), 'EEEE, dd/MM/yyyy', {locale: vi}) : 'N/A'}
                             </span>
                           </div>
                           
                           <div className="flex items-center gap-2 text-xl font-bold text-[#0B5FA5]">
                              <User className="w-5 h-5"/> {req.student?.user?.name}
                           </div>
                           
                           <div className="text-sm font-mono bg-white inline-block px-2 py-1 rounded border">
                              {req.startTime} - {req.endTime}
                           </div>

                           {/* BỔ SUNG THÔNG TIN */}
                           <div className="mt-2 space-y-1 text-sm text-gray-700">
                              <p className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-red-500"/> 
                                <strong>Địa điểm:</strong> {req.location || 'Online (Google Meet)'}
                              </p>
                              {req.description && (
                                <p className="flex items-start gap-2 bg-white p-2 rounded border border-yellow-200">
                                  <FileText className="w-4 h-4 mt-0.5 text-gray-500"/>
                                  <span className="italic">"{req.description}"</span>
                                </p>
                              )}
                           </div>
                        </div>

                        <div className="flex flex-col gap-2 justify-center min-w-[120px]">
                           <Button onClick={() => handleConfirmRequest(req.id)} className="bg-green-600 hover:bg-green-700 shadow-sm w-full">
                             <Check className="w-4 h-4 mr-2"/> Duyệt
                           </Button>
                           <Button variant="outline" onClick={() => handleRejectRequest(req.id)} className="text-red-600 border-red-200 hover:bg-red-50 w-full">
                             <X className="w-4 h-4 mr-2"/> Từ chối
                           </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}