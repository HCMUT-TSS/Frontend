declare global {
  interface ImportMetaEnv {
    readonly VITE_API_URL?: string;
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
// src/components/SessionCalendar.tsx
import { useState, useEffect, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { vi } from 'date-fns/locale';
import axios from 'axios';
import { toast } from 'sonner';

import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Calendar, Clock, Video, Plus, ChevronLeft, ChevronRight, UserCheck, XCircle } from 'lucide-react';
import TutorDashboard from './tutor/TutorDashboard';

// Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
});


// Types từ backend
interface Availability {
  id: string;
  tutorId: string;
  tutor: { fullName: string };
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

interface Booking {
  id: string;
  tutor: { fullName: string };
  availability?: { startTime: string; endTime: string };
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED';
  notes?: string;
  meetingLink?: string;
}

export default function SessionCalendar({ userRole = 'student' }: { userRole: 'student' | 'tutor' }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);

  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dialog
  const [requestOpen, setRequestOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Availability | null>(null);
  const [notes, setNotes] = useState('');

  // Fetch data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [availRes, bookingRes] = await Promise.all([
        api.get('/api/availabilities'),
        api.get('/api/my/bookings'),
      ]);
      setAvailabilities(availRes.data || []);
      setMyBookings(bookingRes.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi tải dữ liệu');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userRole === 'student') fetchData();
  }, [userRole, fetchData]);

  // Đặt lịch
  const handleBook = async () => {
    if (!selectedSlot) return;
    try {
      await api.post('/api/bookings/request', {
        availabilityId: selectedSlot.id,
        notes,
      });
      toast.success('Đã gửi yêu cầu đặt lịch thành công!');
      setRequestOpen(false);
      setNotes('');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể đặt lịch');
    }
  };

  // Helper
  const formatDate = (date: string) => format(new Date(date), 'dd/MM/yyyy');
  const formatTime = (date: string) => format(new Date(date), 'HH:mm');
  const formatDateTime = (date: string) => format(new Date(date), 'dd/MM/yyyy HH:mm');

  const eventsOnDate = (date: Date) => {
    return myBookings.filter(b => 
      b.availability && isSameDay(new Date(b.availability.startTime), date)
    );
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

if (userRole === 'tutor') {
    return <TutorDashboard />;
  }

  // Chỉ student mới cần loading
  if (isLoading) {
    return <div className="p-8 text-center text-xl">Đang tải lịch của bạn...</div>;
  }
  return (
    <>
    
      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="calendar" className="data-[state=active]:bg-[#0B5FA5] data-[state=active]:text-white rounded-md font-medium">
            Lịch của tôi
          </TabsTrigger>
          <TabsTrigger value="tutor-slots" className="data-[state=active]:bg-[#0B5FA5] data-[state=active]:text-white rounded-md font-medium">
            Lịch rảnh Tutor
          </TabsTrigger>
          <TabsTrigger value="requests" className="data-[state=active]:bg-[#0B5FA5] data-[state=active]:text-white rounded-md font-medium">
            Yêu cầu của tôi
          </TabsTrigger>
        </TabsList>

        {/* === TAB 1: LỊCH CÁ NHÂN (Calendar View) === */}
        <TabsContent value="calendar" className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">{format(currentMonth, 'MMMM yyyy', { locale: vi })}</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}><ChevronLeft /></Button>
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}><ChevronRight /></Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-700 mb-2">
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => <div key={d} className="py-2">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {monthDays.map(day => {
                  const events = eventsOnDate(day);
                  const isToday = isSameDay(day, today);
                  const hasEvent = events.length > 0;
                  const isCurrent = isSameMonth(day, currentMonth);

                  return (
                    <div
                      key={day.toString()}
                      onClick={() => setSelectedDate(day)}
                      className={`relative min-h-20 rounded-lg border cursor-pointer text-xs transition-all
                        ${!isCurrent ? 'bg-gray-50 text-gray-400' : 'bg-white'}
                        ${isToday ? 'border-blue-600 border-2 font-bold shadow-md' : 'border-gray-200'}
                        ${hasEvent ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'}
                      `}
                    >
                      <div className={`p-1 text-right font-medium ${isToday ? 'text-blue-600' : ''}`}>
                        {format(day, 'd')}
                      </div>
                      {hasEvent && (
                        <div className="absolute top-1 left-1">
                          <Badge className="text-[10px] px-1.5 py-0 bg-blue-600 text-white">
                            {events.length} buổi
                          </Badge>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chi tiết ngày được chọn */}
            <div className="lg:col-span-1">
              <Card className="h-full sticky top-6 border-blue-200">
                <CardHeader className="bg-blue-50 border-b">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    {format(selectedDate, 'EEEE', { locale: vi })}
                  </CardTitle>
                  <p className="text-2xl font-bold text-blue-700">{format(selectedDate, 'd')}</p>
                  <p className="text-sm text-gray-600">{format(selectedDate, 'MMMM yyyy', { locale: vi })}</p>
                </CardHeader>
                <CardContent className="pt-4">
                  {eventsOnDate(selectedDate).length === 0 ? (
                    <p className="text-center text-gray-500 py-8">Không có buổi học nào</p>
                  ) : (
                    <div className="space-y-4">
                      {eventsOnDate(selectedDate).map(booking => (
                        <div key={booking.id} className="p-4 bg-gradient-to-r from-blue-50 to-white border border-blue-200 rounded-lg">
                          <p className="font-semibold">Tư vấn 1-1</p>
                          <p className="text-sm text-gray-700">Với: <strong>{booking.tutor.fullName}</strong></p>
                          {booking.availability && (
                            <>
                              <p className="text-sm mt-1">
                                <Clock className="w-4 h-4 inline mr-1" />
                                {formatTime(booking.availability.startTime)} - {formatTime(booking.availability.endTime)}
                              </p>
                            </>
                          )}
                          <div className="mt-3">
                            <Badge
                              variant={booking.status === 'CONFIRMED' ? 'default' : booking.status === 'PENDING' ? 'secondary' : 'destructive'}
                            >
                              {booking.status === 'PENDING' && 'Đang chờ'}
                              {booking.status === 'CONFIRMED' && 'Đã xác nhận'}
                              {booking.status === 'REJECTED' && 'Bị từ chối'}
                            </Badge>
                          </div>
                          {booking.meetingLink && (
                            <Button size="sm" className="mt-3 w-full" asChild>
                              <a href={booking.meetingLink} target="_blank" rel="noopener">
                                <Video className="w-4 h-4 mr-1" /> Tham gia Zoom
                              </a>
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* === TAB 2: LỊCH RẢNH TUTOR === */}
        <TabsContent value="tutor-slots" className="space-y-6">
          <h3 className="text-xl font-bold">Chọn khung giờ tư vấn</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tutor</TableHead>
                <TableHead>Ngày</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {availabilities
                .filter(s => !s.isBooked)
                .map(slot => (
                  <TableRow key={slot.id}>
                    <TableCell className="font-medium">{slot.tutor.fullName}</TableCell>
                    <TableCell>{formatDate(slot.startTime)}</TableCell>
                    <TableCell>{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</TableCell>
                    <TableCell><Badge variant="outline" className="bg-green-100 text-green-700">Còn trống</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        className="bg-[#0B5FA5]"
                        onClick={() => {
                          setSelectedSlot(slot);
                          setRequestOpen(true);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-1" /> Đặt ngay
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          {availabilities.filter(s => !s.isBooked).length === 0 && (
            <div className="text-center py-12 text-gray-500">Hiện chưa có khung giờ trống nào</div>
          )}
        </TabsContent>

        {/* === TAB 3: YÊU CẦU CỦA TÔI === */}
        <TabsContent value="requests" className="space-y-6">
          <h3 className="text-xl font-bold">Yêu cầu đã gửi</h3>
          {myBookings.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-gray-500">Bạn chưa gửi yêu cầu nào</CardContent></Card>
          ) : (
            <div className="space-y-4">
              {myBookings.map(booking => (
                <Card key={booking.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">Tư vấn 1-1 với {booking.tutor.fullName}</h4>
                        {booking.availability && (
                          <p className="text-sm text-gray-600 mt-1">
                            {formatDateTime(booking.availability.startTime)} → {formatTime(booking.availability.endTime)}
                          </p>
                        )}
                        {booking.notes && <p className="text-sm italic mt-2 text-gray-700">Ghi chú: {booking.notes}</p>}
                      </div>
                      <Badge
                        variant={booking.status === 'CONFIRMED' ? 'default' : booking.status === 'PENDING' ? 'secondary' : 'destructive'}
                      >
                        {booking.status === 'PENDING' && 'Đang chờ duyệt'}
                        {booking.status === 'CONFIRMED' && 'Đã xác nhận'}
                        {booking.status === 'REJECTED' && 'Bị từ chối'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog đặt lịch */}
      <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận đặt lịch tư vấn 1-1</DialogTitle>
          </DialogHeader>
          {selectedSlot && (
            <div className="space-y-5">
              <div className="bg-blue-50 p-5 rounded-lg text-center">
                <p className="font-bold text-lg">{selectedSlot.tutor.fullName}</p>
                <p className="text-sm mt-2">{formatDate(selectedSlot.startTime)}</p>
                <p className="text-lg font-semibold">
                  {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
                </p>
              </div>

              <div>
                <Label>Ghi chú cho tutor (không bắt buộc)</Label>
                <Textarea
                  placeholder="Ví dụ: Em cần hỗ trợ phần đạo hàm, tích phân..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setRequestOpen(false)}>Hủy</Button>
                <Button onClick={handleBook} className="bg-[#0B5FA5]">
                  Gửi yêu cầu đặt lịch
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
    </>
    
  );
  
}

// 2. RENDER TUTOR VIEW – ĐÃ KẾT NỐI THẬT VỚI BACKEND


  // // 3. RENDER ADMIN VIEW
  // const renderAdminView = () => (
  //   <Tabs defaultValue="overview" className="w-full">
  //     <TabsList className="grid w-full grid-cols-3 mb-8 bg-gray-100 p-1 rounded-lg">
  //       <TabsTrigger value="overview" className="data-[state=active]:bg-[#0B5FA5] data-[state=active]:text-white rounded-md">Tổng quan</TabsTrigger>
  //       <TabsTrigger value="tutor-availability" className="data-[state=active]:bg-[#0B5FA5] data-[state=active]:text-white rounded-md">Lịch rảnh Tutors</TabsTrigger>
  //       <TabsTrigger value="create-session" className="data-[state=active]:bg-[#0B5FA5] data-[state=active]:text-white rounded-md">Quản lý Session</TabsTrigger>
  //     </TabsList>

  //     {/* Overview */}
  //     <TabsContent value="overview" className="space-y-4">
  //       <h3 className="text-lg font-semibold mb-4">Danh sách chương trình & Thống kê</h3>
  //       <div className="grid gap-4 md:grid-cols-3">
  //           {programs.map((program) => (
  //               <Card key={program.id} className="border-l-4 border-l-[#0B5FA5]">
  //                   <CardHeader className="pb-2">
  //                       <CardTitle className="text-base">{program.name}</CardTitle>
  //                       <CardDescription>{program.code}</CardDescription>
  //                   </CardHeader>
  //                   <CardContent>
  //                       <div className="text-2xl font-bold">
  //                           {/* Giả lập số liệu thống kê */}
  //                           {Math.floor(Math.random() * 5) + 2} Sessions
  //                       </div>
  //                       <p className="text-xs text-muted-foreground">trong tháng này</p>
  //                   </CardContent>
  //               </Card>
  //           ))}
  //       </div>
  //     </TabsContent>

  //     {/* Tutor Availability */}
  //     <TabsContent value="tutor-availability" className="space-y-4">
  //       <h3 className="text-lg font-semibold">Toàn bộ lịch rảnh của Tutor</h3>
  //       <Card>
  //         <CardContent className="pt-6">
  //           <Table>
  //             <TableHeader><TableRow><TableHead>Tutor</TableHead><TableHead>Ngày</TableHead><TableHead>Khung giờ</TableHead><TableHead>Trạng thái</TableHead><TableHead></TableHead></TableRow></TableHeader>
  //             <TableBody>
  //               {tutorAvailability.map((slot) => (
  //                 <TableRow key={slot.id}>
  //                   <TableCell className="font-medium">{slot.tutorName}</TableCell>
  //                   <TableCell>{slot.date}</TableCell>
  //                   <TableCell>{slot.time}</TableCell>
  //                   <TableCell>
  //                     <Badge variant="outline" className={slot.booked ? 'bg-gray-50' : 'bg-green-50'}>{slot.booked ? 'Đã đặt' : 'Rảnh'}</Badge>
  //                   </TableCell>
  //                   <TableCell>
  //                     {!slot.booked && (
  //                       <Button size="sm" variant="outline" className="text-[#0B5FA5] border-blue-200" onClick={() => setIsCreateSessionDialogOpen(true)}>
  //                         <UserCheck className="w-4 h-4 mr-1" /> Gán Session
  //                       </Button>
  //                     )}
  //                   </TableCell>
  //                 </TableRow>
  //               ))}
  //             </TableBody>
  //           </Table>
  //         </CardContent>
  //       </Card>
  //     </TabsContent>

  //     {/* Create Session */}
  //     <TabsContent value="create-session" className="space-y-4">
  //       <div className="flex justify-between items-center">
  //         <div>
  //           <h3 className="font-semibold">Quản lý Session nhóm</h3>
  //           <p className="text-sm text-gray-500">Tạo session và điều phối tutors</p>
  //         </div>
  //         <Dialog open={isCreateSessionDialogOpen} onOpenChange={setIsCreateSessionDialogOpen}>
  //           <DialogTrigger asChild>
  //             <Button className="bg-[#0B5FA5] hover:bg-[#094A7F]"><Plus className="w-4 h-4 mr-2" /> Tạo session mới</Button>
  //           </DialogTrigger>
  //           <DialogContent className="max-w-md bg-white">
  //             <DialogHeader><DialogTitle>Tạo session nhóm</DialogTitle></DialogHeader>
  //             <form className="space-y-4" onSubmit={handleCreateSession}>
  //               <div className="space-y-2">
  //                 <Label htmlFor="program">Chương trình</Label>
  //                 <Select name="program">
  //                   <SelectTrigger><SelectValue placeholder="Chọn chương trình" /></SelectTrigger>
  //                   <SelectContent>
  //                     {programs.map((p) => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}
  //                   </SelectContent>
  //                 </Select>
  //               </div>
  //               <div className="space-y-2">
  //                 <Label>Tutor</Label>
  //                 <Select name="tutor-select">
  //                   <SelectTrigger><SelectValue placeholder="Chọn tutor" /></SelectTrigger>
  //                   <SelectContent>
  //                     {MOCK_TUTORS.map((t) => <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>)}
  //                   </SelectContent>
  //                 </Select>
  //               </div>
  //               {/* Thêm date time inputs nếu cần */}
  //               <div className="flex gap-4">
  //                 <Button type="submit" className="flex-1 bg-[#0B5FA5]">Tạo session</Button>
  //                 <Button type="button" variant="outline" onClick={() => setIsCreateSessionDialogOpen(false)}>Hủy</Button>
  //               </div>
  //             </form>
  //           </DialogContent>
  //         </Dialog>
  //       </div>

  //       <Card>
  //         <CardContent className="pt-6">
  //           <div className="space-y-3">
  //             {groupSessions.map((session) => (
  //               <div key={session.id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-slate-50">
  //                  <div>
  //                     <h4 className="font-bold text-[#0B5FA5]">{session.title}</h4>
  //                     <p className="text-sm text-gray-600">Tutor: {session.tutor} | {session.date} - {session.time}</p>
  //                  </div>
  //                  <div className="flex items-center gap-2">
  //                     <Badge variant="secondary">{session.enrolled}/{session.maxParticipants} ĐK</Badge>
  //                     <Button variant="ghost" size="sm">Chỉnh sửa</Button>
  //                  </div>
  //               </div>
  //             ))}
  //           </div>
  //         </CardContent>
  //       </Card>
  //     </TabsContent>
  //   </Tabs>
  // );

  // return (
  //   <div className="p-6 max-w-7xl mx-auto">
  //     <Card className="shadow-lg border-t-4 border-t-[#0B5FA5]">
  //       <CardHeader>
  //         <CardTitle className="text-2xl text-[#0B5FA5]">
  //           {userRole === 'student' && 'Lịch tư vấn & Session'}
  //           {userRole === 'tutor' && 'Cổng thông tin Tutor'}
  //           {(userRole === 'admin' || userRole === 'coordinator') && 'Quản trị Lịch & Session'}
  //         </CardTitle>
  //         <CardDescription>
  //           {userRole === 'student' && 'Quản lý lịch học, đặt tư vấn 1-1 và theo dõi lịch đặt'}
  //           {userRole === 'tutor' && 'Quản lý lịch rảnh cá nhân và phê duyệt yêu cầu từ sinh viên'}
  //           {(userRole === 'admin' || userRole === 'coordinator') && 'Điều phối chương trình, gán session và giám sát hoạt động'}
  //         </CardDescription>
  //       </CardHeader>
  //       <CardContent>
  //         {userRole === 'student' && renderStudentView()}
  //         {userRole === 'tutor' && renderTutorView()}
  //         {(userRole === 'admin' || userRole === 'coordinator') && renderAdminView()}
  //       </CardContent>
  //     </Card>

  //     {/* Edit Booking Dialog (Dùng chung hoặc cho Admin) */}
  //     <Dialog open={isEditBookingDialogOpen} onOpenChange={setIsEditBookingDialogOpen}>
  //       <DialogContent className="bg-white">
  //         <DialogHeader>
  //           <DialogTitle>Chỉnh sửa buổi tư vấn</DialogTitle>
  //           <DialogDescription>Cập nhật thông tin buổi tư vấn</DialogDescription>
  //         </DialogHeader>
  //         {selectedBooking && (
  //           <form className="space-y-4" onSubmit={handleUpdateBooking}>
  //             <div className="space-y-2">
  //               <Label htmlFor="edit-date">Ngày</Label>
  //               <Input id="edit-date" type="date" value={selectedBooking.date} onChange={(e) => setSelectedBooking({ ...selectedBooking, date: e.target.value })} />
  //             </div>
  //             <div className="space-y-2">
  //               <Label htmlFor="edit-time">Thời gian</Label>
  //               <Input id="edit-time" value={selectedBooking.time} onChange={(e) => setSelectedBooking({ ...selectedBooking, time: e.target.value })} />
  //             </div>
  //             <div className="flex gap-4">
  //               <Button type="submit" className="flex-1 bg-[#0B5FA5]">Cập nhật</Button>
  //               <Button type="button" variant="outline" onClick={() => setIsEditBookingDialogOpen(false)}>Hủy</Button>
  //             </div>
  //           </form>
  //         )}
  //       </DialogContent>
  //     </Dialog>
  //   </div>
  // );
