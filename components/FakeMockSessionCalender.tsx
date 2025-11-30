// src/components/SessionCalendar.tsx
import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Textarea } from './ui/textarea';
import { 
  Calendar, Clock, MapPin, Video, Plus, ChevronLeft, ChevronRight, 
  UserCheck, Users, Check, X, Trash2 
} from 'lucide-react';
import { toast } from 'sonner';
import { vi } from 'date-fns/locale';

import {
  MOCK_TUTORS,
  MOCK_TUTOR_AVAILABILITY,
  MOCK_GROUP_SESSIONS,
  MOCK_ONE_ON_ONE_REQUESTS,
  MOCK_STUDENT_BOOKINGS,
  // Import các interfaces nếu cần dùng type checking chặt chẽ
} from '../mockHcmut';

// Giả lập danh sách chương trình cho Admin (vì trong mockHcmut chưa thấy export)
const MOCK_PROGRAMS = [
  { id: 1, name: 'Đại số tuyến tính - K2023', code: 'MT1001' },
  { id: 2, name: 'Giải tích 1 - K2024', code: 'MT1003' },
  { id: 3, name: 'Cấu trúc rời rạc', code: 'CO1007' },
];

export default function SessionCalendar({ userRole = 'student' }: { userRole: string }) {
  // --- STATE CHUNG ---
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);
  
  // --- DATA STATES (Để giả lập việc thêm/sửa/xóa) ---
  const [tutorAvailability, setTutorAvailability] = useState(MOCK_TUTOR_AVAILABILITY);
  const [oneOnOneRequests, setOneOnOneRequests] = useState(MOCK_ONE_ON_ONE_REQUESTS);
  const [studentBookings, setStudentBookings] = useState(MOCK_STUDENT_BOOKINGS);
  const [groupSessions, setGroupSessions] = useState(MOCK_GROUP_SESSIONS);
  const [programs] = useState(MOCK_PROGRAMS);

  // --- DIALOG STATES ---
  const [isRequestOpen, setIsRequestOpen] = useState(false); // Student: Request 1-1
  const [isAvailabilityDialogOpen, setIsAvailabilityDialogOpen] = useState(false); // Tutor: Add slot
  const [isCreateSessionDialogOpen, setIsCreateSessionDialogOpen] = useState(false); // Admin: Create Session
  const [isEditBookingDialogOpen, setIsEditBookingDialogOpen] = useState(false); // Admin: Edit
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  // --- MOCK USER CONTEXT ---
  // Giả sử nếu login là Tutor thì ID là 1 (Nguyễn Văn A)
  const currentUserId = userRole === 'tutor' ? 1 : 2312589; 

  // --- HANDLERS CHO STUDENT VIEW ---
  const [requestForm, setRequestForm] = useState({
    tutorId: '',
    subject: '',
    preferredDate: '',
    preferredTime: '',
    type: 'online' as 'online' | 'offline',
    location: '',
    note: '',
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const eventsOnDate = (date: Date) => {
    // Chuyển đổi date string sang object để so sánh
    const bookingsWithDate = studentBookings.map(b => ({
      ...b,
      dateObj: new Date(b.date.replace(/-/g, '/')),
    }));
    return bookingsWithDate.filter(b => isSameDay(b.dateObj, date));
  };

  const openRequestFromSlot = (slot: typeof MOCK_TUTOR_AVAILABILITY[0]) => {
    setRequestForm({
      tutorId: slot.tutorId.toString(),
      subject: '',
      preferredDate: slot.date,
      preferredTime: slot.time,
      type: 'online',
      location: '',
      note: '',
    });
    setIsRequestOpen(true);
  };
  const handleDeleteAvailability = (slotId: number) => {
    // Nếu muốn kỹ hơn, có thể thêm confirm() ở đây
    // if (!window.confirm("Bạn có chắc muốn xóa lịch này?")) return;

    setTutorAvailability((prevSlots) => prevSlots.filter((slot) => slot.id !== slotId));
    toast.success('Đã xóa lịch rảnh thành công');
  };
  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq = {
      ...requestForm,
      id: Math.random(),
      studentId: "2312589",
      studentName: "Bạn",
      tutorName: MOCK_TUTORS.find(t => t.id.toString() === requestForm.tutorId)?.name || 'Unknown',
      status: 'pending' as const
    };
    // @ts-ignore - Mocking adding request
    setOneOnOneRequests([...oneOnOneRequests, newReq]);
    toast.success('Đã gửi yêu cầu tư vấn 1-1 thành công!');
    setIsRequestOpen(false);
    setRequestForm({ ...requestForm, subject: '', note: '' });
  };

  // --- HANDLERS CHO TUTOR VIEW ---
  const handleAddAvailability = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const date = formData.get('date') as string;
    const time = formData.get('time') as string;
    
    const newSlot = {
      id: Date.now(),
      tutorId: currentUserId,
      tutorName: MOCK_TUTORS.find(t => t.id === currentUserId)?.name || 'Me',
      date,
      time,
      booked: false
    };
    
    setTutorAvailability([...tutorAvailability, newSlot]);
    toast.success('Đã thêm lịch rảnh mới');
    setIsAvailabilityDialogOpen(false);
  };

  const handleApproveRequest = (id: number) => {
    setOneOnOneRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: 'approved' } : req
    ));
    toast.success('Đã chấp nhận yêu cầu');
  };

  const handleRejectRequest = (id: number) => {
    setOneOnOneRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: 'rejected' } : req
    ));
    toast.error('Đã từ chối yêu cầu');
  };

  // --- HANDLERS CHO ADMIN VIEW ---
  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic giả lập tạo session
    toast.success('Đã tạo session nhóm thành công');
    setIsCreateSessionDialogOpen(false);
  };

  const handleUpdateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Cập nhật booking thành công');
    setIsEditBookingDialogOpen(false);
  };


  // ==========================================
  // RENDER VIEWS
  // ==========================================

  // 1. RENDER STUDENT VIEW
  const renderStudentView = () => (
    <Tabs defaultValue="calendar" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-8 bg-gray-100 p-1 rounded-lg">
        <TabsTrigger value="calendar" className="data-[state=active]:bg-[#0B5FA5] data-[state=active]:text-white rounded-md transition-all font-medium">Lịch của tôi</TabsTrigger>
        <TabsTrigger value="tutor-slots" className="data-[state=active]:bg-[#0B5FA5] data-[state=active]:text-white rounded-md transition-all font-medium">Lịch rảnh Tutor</TabsTrigger>
        <TabsTrigger value="requests" className="data-[state=active]:bg-[#0B5FA5] data-[state=active]:text-white rounded-md transition-all font-medium">Yêu cầu 1-1</TabsTrigger>
      </TabsList>

      <TabsContent value="calendar" className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">{format(currentMonth, 'MMMM yyyy', { locale: vi })}</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}><ChevronLeft className="w-4 h-4" /></Button>
            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}><ChevronRight className="w-4 h-4" /></Button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-700 mb-2">
              {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => <div key={day} className="py-2">{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {monthDays.map((day) => {
                const events = eventsOnDate(day);
                const isToday = isSameDay(day, today);
                const hasEvent = events.length > 0;
                const isCurrentMonth = isSameMonth(day, currentMonth);
                return (
                  <div key={day.toString()} onClick={() => setSelectedDate(day)}
                    className={`relative min-h-20 rounded-lg border cursor-pointer text-xs transition-all ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'} ${isToday ? 'border-blue-600 border-2 font-bold shadow-md' : 'border-gray-200'} ${hasEvent ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'} hover:shadow-sm`}>
                    <div className={`p-1 text-right font-medium ${isToday ? 'text-blue-600' : ''}`}>{format(day, 'd')}</div>
                    {hasEvent && <div className="absolute top-1 left-1"><Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-blue-600 text-white">{events.length} buổi</Badge></div>}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="lg:col-span-1">
            <Card className="h-full border-blue-200 sticky top-6">
              <CardHeader className="bg-blue-50 border-b">
                <CardTitle className="text-lg flex items-center gap-2"><Calendar className="w-5 h-5 text-blue-600" /> {format(selectedDate, 'EEEE', { locale: vi })}</CardTitle>
                <p className="text-2xl font-bold text-blue-700">{format(selectedDate, 'd', { locale: vi })}</p>
                <p className="text-sm text-gray-600">{format(selectedDate, 'MMMM yyyy', { locale: vi })}</p>
              </CardHeader>
              <CardContent className="pt-4">
                {eventsOnDate(selectedDate).length === 0 ? <p className="text-center text-gray-500 py-8">Không có lịch học nào</p> : 
                  <div className="space-y-3">
                    {eventsOnDate(selectedDate).map((event, i) => (
                      <div key={i} className="p-4 bg-gradient-to-r from-blue-50 to-white border border-blue-200 rounded-lg shadow-sm">
                        <p className="font-semibold text-gray-900">{event.subject}</p>
                        <p className="text-sm text-gray-600 mt-1"><span className="font-medium">{event.tutor}</span></p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {event.time}</span>
                          <span className="flex items-center gap-1">{event.type === '1-1' ? <UserCheck className="w-4 h-4" /> : <Users className="w-4 h-4" />} {event.type === '1-1' ? '1-1' : 'Nhóm'}</span>
                        </div>
                        <Badge className="mt-3 bg-green-600 text-white">Đã xác nhận</Badge>
                      </div>
                    ))}
                  </div>
                }
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="tutor-slots">
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Lịch rảnh của Tutor</h3>
          <Table>
            <TableHeader><TableRow><TableHead>Tutor</TableHead><TableHead>Ngày</TableHead><TableHead>Thời gian</TableHead><TableHead>Trạng thái</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              {tutorAvailability.filter(slot => !slot.booked).map(slot => (
                <TableRow key={slot.id}>
                  <TableCell className="font-medium">{slot.tutorName}</TableCell>
                  <TableCell>{format(new Date(slot.date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{slot.time}</TableCell>
                  <TableCell><Badge variant="outline" className="bg-green-100 text-green-700">Còn trống</Badge></TableCell>
                  <TableCell><Button size="sm" className="bg-[#0B5FA5]" onClick={() => openRequestFromSlot(slot)}><Plus className="w-4 h-4 mr-1" /> Đặt ngay</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      <TabsContent value="requests">
        <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Yêu cầu tư vấn 1-1 của tôi</h3>
            </div>
            {oneOnOneRequests.filter(req => req.studentId === "2312589").length === 0 ? (
                <Card className="py-12 text-center"><p className="text-gray-500">Bạn chưa gửi yêu cầu nào</p></Card>
            ) : (
                <div className="space-y-4">
                    {oneOnOneRequests.filter(req => req.studentId === "2312589").map(req => (
                        <Card key={req.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-3 flex-1">
                                        <div><h4 className="font-semibold text-lg">{req.subject}</h4><p className="text-sm text-gray-600">Gửi đến: <span className="font-medium">{req.tutorName}</span></p></div>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                            <span><Calendar className="w-4 h-4 inline mr-1" />{req.preferredDate}</span>
                                            <span><Clock className="w-4 h-4 inline mr-1" />{req.preferredTime}</span>
                                        </div>
                                        {req.note && <p className="text-sm text-gray-700 italic border-l-4 border-blue-400 pl-3">"{req.note}"</p>}
                                    </div>
                                    <div className="ml-6 text-right">
                                        {req.status === 'pending' && <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Đang chờ</Badge>}
                                        {req.status === 'approved' && <Badge className="bg-green-600 text-white">Đã chấp nhận</Badge>}
                                        {req.status === 'rejected' && <Badge variant="destructive" className="bg-red-600 text-white">Bị từ chối</Badge>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
      </TabsContent>

      <Dialog open={isRequestOpen} onOpenChange={setIsRequestOpen}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader><DialogTitle>Tạo yêu cầu tư vấn 1-1</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmitRequest} className="space-y-4">
             {/* ĐÃ SỬA: Bỏ grid 2 cột, Tutor lấy full width, Xóa input Chủ đề */}
             <div className="grid gap-4">
                <div>
                   <Label>Tutor</Label>
                   <Select value={requestForm.tutorId} onValueChange={v => setRequestForm({ ...requestForm, tutorId: v })}>
                      <SelectTrigger><SelectValue placeholder="Chọn tutor" /></SelectTrigger>
                      <SelectContent>
                         {MOCK_TUTORS.map(t => <SelectItem key={t.id} value={t.id.toString()}>{t.name} - {t.subject}</SelectItem>)}
                      </SelectContent>
                   </Select>
                </div>
                {/* Đã xóa phần Input Chủ đề ở đây */}
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
  <Label>Ngày</Label>
  <Input 
    value={requestForm.preferredDate ? format(new Date(requestForm.preferredDate), 'dd/MM/yyyy') : ''} 
    readOnly 
  />
</div>
                <div><Label>Giờ</Label><Input value={requestForm.preferredTime} readOnly/></div>
             </div>

             <div><Label>Ghi chú</Label><Textarea value={requestForm.note} onChange={e => setRequestForm({...requestForm, note: e.target.value})} rows={3}/></div>
             
             <div className="flex gap-3 justify-end">
               <Button type="button" variant="outline" onClick={() => setIsRequestOpen(false)}>Hủy</Button>
               <Button type="submit" className="bg-[#0B5FA5]">Gửi yêu cầu</Button>
             </div>
          </form>
        </DialogContent>
      </Dialog>
    </Tabs>
  );

  // 2. RENDER TUTOR VIEW
  const renderTutorView = () => {
    // Tìm tên tutor hiện tại dựa trên ID giả lập
    const currentTutorName = MOCK_TUTORS.find(t => t.id === currentUserId)?.name || '';

    return (
      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="schedule" className="data-[state=active]:bg-[#0B5FA5] data-[state=active]:text-white rounded-md">Lịch của tôi</TabsTrigger>
          <TabsTrigger value="availability" className="data-[state=active]:bg-[#0B5FA5] data-[state=active]:text-white rounded-md">Lịch rảnh</TabsTrigger>
          <TabsTrigger value="requests" className="data-[state=active]:bg-[#0B5FA5] data-[state=active]:text-white rounded-md">Yêu cầu 1-1</TabsTrigger>
        </TabsList>
  
        {/* My Schedule - Đã nâng cấp giao diện Lịch tháng + Chi tiết */}
        <TabsContent value="schedule" className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">
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
                  // Lọc lịch dạy của Tutor này trong ngày
                  const myEvents = studentBookings.filter(b => 
                    b.tutor === currentTutorName && 
                    isSameDay(new Date(b.date), day)
                  );
                  
                  const isToday = isSameDay(day, today);
                  const hasEvent = myEvents.length > 0;
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

                      {/* Hiển thị chấm hoặc badge nếu có lịch */}
                      {hasEvent && (
                        <div className="flex flex-col gap-1">
                          {myEvents.slice(0, 2).map((ev, idx) => (
                             <div key={idx} className="bg-[#0B5FA5] text-white text-[10px] px-1 py-0.5 rounded truncate">
                                {ev.time.split(' - ')[0]} - {ev.subject}
                             </div>
                          ))}
                          {myEvents.length > 2 && (
                            <span className="text-[10px] text-gray-500 pl-1">+{myEvents.length - 2} khác</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CỘT PHẢI: CHI TIẾT NGÀY ĐƯỢC CHỌN */}
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
                  {(() => {
                    // Lọc lịch dạy của Tutor này trong ngày được chọn
                    const dailyEvents = studentBookings.filter(b => 
                      b.tutor === currentTutorName && 
                      isSameDay(new Date(b.date), selectedDate)
                    );

                    if (dailyEvents.length === 0) {
                      return (
                        <div className="text-center py-8">
                          <p className="text-gray-500">Không có lịch dạy nào</p>
                          <Button variant="link" onClick={() => setIsAvailabilityDialogOpen(true)} className="text-[#0B5FA5]">
                             + Đăng ký lịch rảnh
                          </Button>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3">
                        {dailyEvents.map((booking) => (
                          <div
                            key={booking.id}
                            className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-blue-300 transition-colors"
                          >
                            <h4 className="font-semibold text-[#0B5FA5]">{booking.subject}</h4>
                            
                            <div className="mt-2 space-y-1 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="font-medium">{booking.time}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span>{booking.location}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {booking.type === '1-1' ? <UserCheck className="w-4 h-4 text-gray-400"/> : <Users className="w-4 h-4 text-gray-400"/>}
                                <span>{booking.type === '1-1' ? 'Kèm riêng (1-1)' : 'Lớp nhóm'}</span>
                              </div>
                            </div>
                            
                            <div className="mt-3 flex justify-between items-center">
                                <Badge className="bg-green-600 text-white hover:bg-green-700">Sắp diễn ra</Badge>
                                <Button variant="outline" size="sm" className="h-7 text-xs">Chi tiết</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
  
        {/* Availability */}
        <TabsContent value="availability" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold">Đăng ký lịch rảnh</h3>
              <p className="text-sm text-gray-500">Đăng ký các khung giờ bạn có thể dạy</p>
            </div>
            <Dialog open={isAvailabilityDialogOpen} onOpenChange={setIsAvailabilityDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#0B5FA5] hover:bg-[#094A7F]">
                  <Plus className="w-4 h-4 mr-2" /> Thêm lịch rảnh
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white">
                <DialogHeader>
                  <DialogTitle>Thêm lịch rảnh</DialogTitle>
                  <DialogDescription>Đăng ký khung giờ bạn có thể tư vấn</DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleAddAvailability}>
                  <div className="space-y-2">
                    <Label htmlFor="date">Ngày</Label>
                    <Input id="date" name="date" type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Khung giờ</Label>
                    <Input id="time" name="time" placeholder="Ví dụ: 14:00 - 16:00" required />
                  </div>
                  <div className="flex gap-4">
                    <Button type="submit" className="flex-1 bg-[#0B5FA5] hover:bg-[#094A7F]">Thêm</Button>
                    <Button type="button" variant="outline" onClick={() => setIsAvailabilityDialogOpen(false)}>Hủy</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
  
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader><TableRow><TableHead>Ngày</TableHead><TableHead>Khung giờ</TableHead><TableHead>Trạng thái</TableHead><TableHead></TableHead></TableRow></TableHeader>
                <TableBody>
                  {tutorAvailability
                    .filter(slot => slot.tutorId === currentUserId)
                    .map((slot) => (
                    <TableRow key={slot.id}>
                      <TableCell>{slot.date}</TableCell>
                      <TableCell>{slot.time}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={slot.booked ? 'bg-gray-50' : 'bg-green-50'}>
                          {slot.booked ? 'Đã được đặt' : 'Đang rảnh'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            onClick={() => handleDeleteAvailability(slot.id)}
            disabled={slot.booked} // Tùy chọn: Không cho xóa nếu đã có người đặt
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
        </TabsContent>
  
        {/* 1-1 Requests */}
        <TabsContent value="requests" className="space-y-4">
          <div>
            <h3 className="font-semibold">Yêu cầu ghép cặp 1-1</h3>
            <p className="text-sm text-gray-500">Sinh viên yêu cầu tư vấn riêng với bạn</p>
          </div>
  
          <div className="space-y-3">
            {oneOnOneRequests
                // Lọc request gửi tới đúng tên Tutor này
                .filter(req => req.tutorName === currentTutorName)
                .map((request) => (
              <Card key={request.id}>
                  <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                          <div className="flex-1 space-y-2">
                              <div className="flex justify-between mr-4">
                                <h4 className="font-bold">{request.subject}</h4>
                                <span className="text-sm text-gray-500">{request.studentName} ({request.studentId})</span>
                              </div>
                              <div className="flex gap-3 text-sm text-gray-600">
                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {request.preferredDate}</span>
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {request.preferredTime}</span>
                                <span className="flex items-center gap-1">{request.type === 'online' ? <Video className="w-3 h-3"/> : <MapPin className="w-3 h-3"/>} {request.type}</span>
                              </div>
                              {request.note && <p className="text-sm italic text-gray-600 bg-gray-50 p-2 rounded">"{request.note}"</p>}
                          </div>
                          {request.status === 'pending' ? (
                              <div className="flex flex-col gap-2 ml-4">
                                  <Button size="sm" className="bg-green-600 hover:bg-green-700 w-full" onClick={() => handleApproveRequest(request.id)}>
                                      <Check className="w-4 h-4 mr-1" /> Chấp nhận
                                  </Button>
                                  <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 w-full" onClick={() => handleRejectRequest(request.id)}>
                                      <X className="w-4 h-4 mr-1" /> Từ chối
                                  </Button>
                              </div>
                          ) : (
                            <div className="ml-4">
                                {request.status === 'approved' && <Badge className="bg-green-600">Đã chấp nhận</Badge>}
                                {request.status === 'rejected' && <Badge variant="destructive">Đã từ chối</Badge>}
                            </div>
                          )}
                      </div>
                  </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    );
  };

  // 3. RENDER ADMIN VIEW
  const renderAdminView = () => (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-8 bg-gray-100 p-1 rounded-lg">
        <TabsTrigger value="overview" className="data-[state=active]:bg-[#0B5FA5] data-[state=active]:text-white rounded-md">Tổng quan</TabsTrigger>
        <TabsTrigger value="tutor-availability" className="data-[state=active]:bg-[#0B5FA5] data-[state=active]:text-white rounded-md">Lịch rảnh Tutors</TabsTrigger>
        <TabsTrigger value="create-session" className="data-[state=active]:bg-[#0B5FA5] data-[state=active]:text-white rounded-md">Quản lý Session</TabsTrigger>
      </TabsList>

      {/* Overview */}
      <TabsContent value="overview" className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">Danh sách chương trình & Thống kê</h3>
        <div className="grid gap-4 md:grid-cols-3">
            {programs.map((program) => (
                <Card key={program.id} className="border-l-4 border-l-[#0B5FA5]">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">{program.name}</CardTitle>
                        <CardDescription>{program.code}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {/* Giả lập số liệu thống kê */}
                            {Math.floor(Math.random() * 5) + 2} Sessions
                        </div>
                        <p className="text-xs text-muted-foreground">trong tháng này</p>
                    </CardContent>
                </Card>
            ))}
        </div>
      </TabsContent>

      {/* Tutor Availability */}
      <TabsContent value="tutor-availability" className="space-y-4">
        <h3 className="text-lg font-semibold">Toàn bộ lịch rảnh của Tutor</h3>
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader><TableRow><TableHead>Tutor</TableHead><TableHead>Ngày</TableHead><TableHead>Khung giờ</TableHead><TableHead>Trạng thái</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>
                {tutorAvailability.map((slot) => (
                  <TableRow key={slot.id}>
                    <TableCell className="font-medium">{slot.tutorName}</TableCell>
                    <TableCell>{slot.date}</TableCell>
                    <TableCell>{slot.time}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={slot.booked ? 'bg-gray-50' : 'bg-green-50'}>{slot.booked ? 'Đã đặt' : 'Rảnh'}</Badge>
                    </TableCell>
                    <TableCell>
                      {!slot.booked && (
                        <Button size="sm" variant="outline" className="text-[#0B5FA5] border-blue-200" onClick={() => setIsCreateSessionDialogOpen(true)}>
                          <UserCheck className="w-4 h-4 mr-1" /> Gán Session
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Create Session */}
      <TabsContent value="create-session" className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold">Quản lý Session nhóm</h3>
            <p className="text-sm text-gray-500">Tạo session và điều phối tutors</p>
          </div>
          <Dialog open={isCreateSessionDialogOpen} onOpenChange={setIsCreateSessionDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#0B5FA5] hover:bg-[#094A7F]"><Plus className="w-4 h-4 mr-2" /> Tạo session mới</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white">
              <DialogHeader><DialogTitle>Tạo session nhóm</DialogTitle></DialogHeader>
              <form className="space-y-4" onSubmit={handleCreateSession}>
                <div className="space-y-2">
                  <Label htmlFor="program">Chương trình</Label>
                  <Select name="program">
                    <SelectTrigger><SelectValue placeholder="Chọn chương trình" /></SelectTrigger>
                    <SelectContent>
                      {programs.map((p) => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tutor</Label>
                  <Select name="tutor-select">
                    <SelectTrigger><SelectValue placeholder="Chọn tutor" /></SelectTrigger>
                    <SelectContent>
                      {MOCK_TUTORS.map((t) => <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {/* Thêm date time inputs nếu cần */}
                <div className="flex gap-4">
                  <Button type="submit" className="flex-1 bg-[#0B5FA5]">Tạo session</Button>
                  <Button type="button" variant="outline" onClick={() => setIsCreateSessionDialogOpen(false)}>Hủy</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {groupSessions.map((session) => (
                <div key={session.id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-slate-50">
                   <div>
                      <h4 className="font-bold text-[#0B5FA5]">{session.title}</h4>
                      <p className="text-sm text-gray-600">Tutor: {session.tutor} | {session.date} - {session.time}</p>
                   </div>
                   <div className="flex items-center gap-2">
                      <Badge variant="secondary">{session.enrolled}/{session.maxParticipants} ĐK</Badge>
                      <Button variant="ghost" size="sm">Chỉnh sửa</Button>
                   </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Card className="shadow-lg border-t-4 border-t-[#0B5FA5]">
        <CardHeader>
          <CardTitle className="text-2xl text-[#0B5FA5]">
            {userRole === 'student' && 'Lịch tư vấn & Session'}
            {userRole === 'tutor' && 'Cổng thông tin Tutor'}
            {(userRole === 'admin' || userRole === 'coordinator') && 'Quản trị Lịch & Session'}
          </CardTitle>
          <CardDescription>
            {userRole === 'student' && 'Quản lý lịch học, đặt tư vấn 1-1 và theo dõi lịch đặt'}
            {userRole === 'tutor' && 'Quản lý lịch rảnh cá nhân và phê duyệt yêu cầu từ sinh viên'}
            {(userRole === 'admin' || userRole === 'coordinator') && 'Điều phối chương trình, gán session và giám sát hoạt động'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userRole === 'student' && renderStudentView()}
          {userRole === 'tutor' && renderTutorView()}
          {(userRole === 'admin' || userRole === 'coordinator') && renderAdminView()}
        </CardContent>
      </Card>

      {/* Edit Booking Dialog (Dùng chung hoặc cho Admin) */}
      <Dialog open={isEditBookingDialogOpen} onOpenChange={setIsEditBookingDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa buổi tư vấn</DialogTitle>
            <DialogDescription>Cập nhật thông tin buổi tư vấn</DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <form className="space-y-4" onSubmit={handleUpdateBooking}>
              <div className="space-y-2">
                <Label htmlFor="edit-date">Ngày</Label>
                <Input id="edit-date" type="date" value={selectedBooking.date} onChange={(e) => setSelectedBooking({ ...selectedBooking, date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-time">Thời gian</Label>
                <Input id="edit-time" value={selectedBooking.time} onChange={(e) => setSelectedBooking({ ...selectedBooking, time: e.target.value })} />
              </div>
              <div className="flex gap-4">
                <Button type="submit" className="flex-1 bg-[#0B5FA5]">Cập nhật</Button>
                <Button type="button" variant="outline" onClick={() => setIsEditBookingDialogOpen(false)}>Hủy</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}