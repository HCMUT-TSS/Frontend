// src/components/SessionCalendar.tsx
import { useState, useEffect, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import axios from 'axios';
import { toast } from 'sonner';

import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
// import { Textarea } from './ui/text';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Calendar, Clock, Video, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import TutorDashboard from './tutor/TutorDashboard';

declare global {
  interface ImportMetaEnv {
    readonly VITE_API_URL?: string;
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
});

// ĐÚNG THEO DỮ LIỆU BẠN NHẬN ĐƯỢC TỪ POSTMAN
interface Availability {
  tutorId: number;
  tutorName: string;
  faculty?: string;
  msv?: string;
  date: string;           // "2025-12-04"
  startTime: string;      // "14:00"
  endTime: string;        // "16:00"
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
}

export default function SessionCalendar({ userRole = 'student' }: { userRole: 'student' | 'tutor' }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);

  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dialog đặt lịch
  const [requestOpen, setRequestOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Availability | null>(null);
  const [note, setNote] = useState('');

  const fetchData = useCallback(async () => {
  setIsLoading(true);
  try {
    const [availRes, bookingRes] = await Promise.all([
      api.get('/api/student/availabilities?days=14'),
      api.get('/api/student/my/bookings'),
    ]);

    console.log('DỮ LIỆU THÔ:', availRes.data);

    // SỬA DÒNG NÀY → LẤY ĐÚNG slots TỪ OBJECT
    setAvailabilities(availRes.data?.slots || []);

    setMyBookings(Array.isArray(bookingRes.data) ? bookingRes.data : bookingRes.data?.bookings || []);
  } catch (err: any) {
    console.error('LỖI:', err);
    toast.error('Lỗi tải dữ liệu');
  } finally {
    setIsLoading(false);
  }
}, []);

  useEffect(() => {
    if (userRole === 'student') fetchData();
  }, [userRole, fetchData]);

  // GỬI YÊU CẦU ĐẶT LỊCH – ĐÚNG THEO DEMO BẠN GỬI
  const handleBook = async () => {
    if (!selectedSlot) return;

    try {
      await api.post('/api/student/bookings/request', {
        tutorId: selectedSlot.tutorId,
        preferredDate: selectedSlot.date,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        subject: "Tư vấn học tập", // có thể để trống hoặc thêm input sau
        description: note || "Sinh viên cần hỗ trợ",
      });

      toast.success('Đã gửi yêu cầu thành công! Tutor sẽ phản hồi sớm');
      setRequestOpen(false);
      setNote('');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gửi thất bại');
    }
  };

  const monthDays = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  // Lọc slot theo ngày được chọn
  const slotsOnDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return availabilities.filter(s => s.date === dateStr);
  };

  // Lọc booking cá nhân theo ngày
  const bookingsOnDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return myBookings.filter(b => b.date === dateStr);
  };

  if (userRole === 'tutor') {
    return <TutorDashboard />;
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
        CỔNG ĐẶT LỊCH TƯ VẤN 1-1
      </h1>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8 bg-gray-100 p-1 rounded-xl">
          <TabsTrigger value="calendar" className="data-[state=active]:bg-[#0B5FA5] data-[state=active]:text-white rounded-lg">Lịch của tôi</TabsTrigger>
          <TabsTrigger value="tutor-slots" className="data-[state=active]:bg-[#0B5FA5] data-[state=active]:text-white rounded-lg">Chọn slot rảnh</TabsTrigger>
          <TabsTrigger value="my-requests" className="data-[state=active]:bg-[#0B5FA5] data-[state=active]:text-white rounded-lg">Yêu cầu của tôi</TabsTrigger>
        </TabsList>

        {/* TAB 1: LỊCH CÁ NHÂN */}
        <TabsContent value="calendar" className="space-y-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold">{format(currentMonth, 'MMMM yyyy', { locale: vi })}</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}><ChevronLeft /></Button>
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}><ChevronRight /></Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="grid grid-cols-7 gap-2 text-center font-bold text-gray-700 mb-4">
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
                  <div key={d} className="py-3 bg-[#0B5FA5] text-white rounded-lg">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-3">
                {monthDays.map(day => {
                  const slots = slotsOnDate(day);
                  const bookings = bookingsOnDate(day);
                  const total = slots.length + bookings.length;
                  const isToday = isSameDay(day, today);

                  return (
                    <div
                      key={day.toString()}
                      onClick={() => setSelectedDate(day)}
                      className={`min-h-28 p-3 rounded-2xl border-4 cursor-pointer transition-all
                        ${isToday ? 'border-[#0B5FA5] bg-blue-50 shadow-xl' : 'border-gray-300 bg-white'}
                        ${total > 0 ? 'ring-4 ring-green-400' : ''}
                        hover:shadow-lg
                      `}
                    >
                      <div className="font-bold text-lg">{format(day, 'd')}</div>
                      {total > 0 && (
                        <Badge className="mt-2 text-xs px-2 py-1 bg-green-600 text-white">
                          {total} buổi
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-1">
              <Card className="h-full bg-gradient-to-br from-[#0B5FA5] to-blue-700 text-white">
                <CardHeader>
                  <CardTitle className="text-2xl">
                    {format(selectedDate, 'EEEE, d MMMM yyyy', { locale: vi })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {[...slotsOnDate(selectedDate), ...bookingsOnDate(selectedDate)].length === 0 ? (
                    <p className="text-xl opacity-90">Không có lịch</p>
                  ) : (
                    <div className="space-y-3">
                      {slotsOnDate(selectedDate).map(slot => (
                        <div key={`${slot.tutorId}-${slot.date}-${slot.startTime}`} className="bg-white/20 p-3 rounded-lg">
                          <p className="font-bold">{slot.tutorName}</p>
                          <p>{slot.startTime} - {slot.endTime}</p>
                          <Badge className="mt-2 bg-green-500">Còn trống</Badge>
                        </div>
                      ))}
                      {bookingsOnDate(selectedDate).map(b => (
                        <div key={b.id} className="bg-white/20 p-3 rounded-lg">
                          <p className="font-bold">{b.tutorName}</p>
                          <p>{b.startTime} - {b.endTime}</p>
                          <Badge className={b.status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'}>
                            {b.status === 'pending' ? 'Chờ duyệt' : 'Đã xác nhận'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: CHỌN SLOT RẢNH */}
        <TabsContent value="tutor-slots">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-[#0B5FA5] mb-6">Chọn khung giờ tư vấn từ tutor</h3>
            {availabilities.length === 0 ? (
              <p className="text-center text-gray-500 py-12 text-xl">Hiện chưa có tutor nào đăng ký lịch rảnh</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tutor</TableHead>
                    <TableHead>Ngày</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Khoa</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availabilities.map(slot => (
                    <TableRow key={`${slot.tutorId}-${slot.date}-${slot.startTime}`}>
                      <TableCell className="font-bold text-[#0B5FA5]">{slot.tutorName}</TableCell>
                      <TableCell>{format(parseISO(slot.date), 'dd/MM/yyyy (EEEE)', { locale: vi })}</TableCell>
                      <TableCell className="font-medium">{slot.startTime} - {slot.endTime}</TableCell>
                      <TableCell className="text-sm text-gray-600">{slot.faculty || 'Khoa học máy tính'}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          className="bg-[#0B5FA5] hover:bg-blue-700"
                          onClick={() => {
                            setSelectedSlot(slot);
                            setRequestOpen(true);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-1" /> Đặt lịch
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        {/* TAB 3: YÊU CẦU CỦA TÔI */}
        <TabsContent value="my-requests">
          <h3 className="text-2xl font-bold text-[#0B5FA5] mb-6">Yêu cầu đặt lịch của bạn</h3>
          {myBookings.length === 0 ? (
            <Card className="py-20 text-center text-gray-500 text-xl">
              <CardContent>Bạn chưa gửi yêu cầu nào</CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {myBookings.map(b => (
                <Card key={b.id} className="border-l-8 border-l-[#0B5FA5]">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xl font-bold">{b.tutorName}</p>
                        <p className="text-lg mt-2">
                          <Calendar className="inline w-5 h-5 mr-2" />
                          {format(parseISO(b.date), 'dd/MM/yyyy (EEEE)', { locale: vi })} • {b.startTime} - {b.endTime}
                        </p>
                        {b.note && <p className="mt-3 italic text-gray-600">Ghi chú: {b.note}</p>}
                      </div>
                      <div className="text-right">
                        <Badge className={b.status === 'confirmed' ? 'bg-green-600' : 'bg-yellow-600'}>{b.status === 'pending' ? 'Đang chờ' : 'Đã xác nhận'}</Badge>
                        {b.meetLink && (
                          <Button size="sm" className="mt-3" asChild>
                            <a href={b.meetLink} target="_blank" rel="noopener">
                              <Video className="w-4 h-4 mr-1" /> Tham gia
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* DIALOG ĐẶT LỊCH */}
      <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl">Xác nhận đặt lịch tư vấn</DialogTitle>
          </DialogHeader>
          {selectedSlot && (
            <div className="space-y-6 py-4">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-[#0B5FA5]/10 rounded-xl">
                <p className="text-2xl font-bold text-[#0B5FA5]">{selectedSlot.tutorName}</p>
                <p className="text-lg mt-3">{format(parseISO(selectedSlot.date), 'EEEE, dd/MM/yyyy', { locale: vi })}</p>
                <p className="text-3xl font-bold mt-2 text-[#0B5FA5]">{selectedSlot.startTime} - {selectedSlot.endTime}</p>
              </div>

              <div>
                <label className="text-sm font-medium">Ghi chú cho tutor (không bắt buộc)</label>
                <textarea
                  className="w-full mt-2 p-4 border rounded-lg"
                  rows={4}
                  placeholder="Em cần hỗ trợ phần..."
                  value={note}
                  onChange={e => setNote(e.target.value)}
                />
              </div>

              <div className="flex gap-4 justify-end">
                <Button variant="outline" onClick={() => setRequestOpen(false)}>Hủy</Button>
                <Button onClick={handleBook} className="bg-[#0B5FA5] px-8">
                  Gửi yêu cầu ngay
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
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
