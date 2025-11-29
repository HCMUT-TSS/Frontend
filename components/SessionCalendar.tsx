import { useState, useEffect, useCallback } from 'react'; // Thêm useEffect, useCallback
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Calendar, Clock, MapPin, Video, Plus, Edit, Trash2, Users, Check, X, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

// ====================================================================
// 🛠️ 1. INTERFACES (ĐỊNH NGHĨA KIỂU DỮ LIỆU)
// ====================================================================

// Định nghĩa các kiểu dữ liệu tương ứng với dữ liệu trả về từ API
interface Tutor {
  id: number;
  name: string;
  subject: string;
  available: boolean;
}

interface GroupSession {
  id: number;
  title: string;
  tutor: string;
  date: string;
  time: string;
  location: string;
  type: 'online' | 'offline';
  enrolled: number;
  maxParticipants: number;
  program: string;
  subject?: string; 
}

interface AvailabilitySlot {
  id: number;
  tutorId: number;
  tutorName: string;
  date: string;
  time: string;
  booked: boolean;
  status: 'available' | 'booked';
}

interface OneOnOneRequest {
  id: number;
  studentName: string;
  studentId: string;
  subject: string;
  preferredDate: string;
  preferredTime: string;
  type: 'online' | 'offline';
  location?: string;
  status: 'pending' | 'approved' | 'rejected';
  note: string;
}

interface StudentBooking {
    id: number;
    type: '1-1' | 'group';
    tutor: string;
    date: string;
    time: string;
    subject: string;
    location: string;
    status: 'confirmed' | 'pending';
    title?: string;
}

interface Program {
    id: number;
    name: string;
    sessions: number;
    students: number;
}

// ⚠️ MOCK DỮ LIỆU TẠM THỜI CHO SELECT VÀ MẶT ĐỊNH
const EMPTY_GROUP_SESSIONS: GroupSession[] = [];
const EMPTY_TUTOR_AVAILABILITY: AvailabilitySlot[] = [];
const EMPTY_ONE_ON_ONE_REQUESTS: OneOnOneRequest[] = [];
const EMPTY_STUDENT_BOOKINGS: StudentBooking[] = [];
const EMPTY_TUTORS: Tutor[] = [];
const EMPTY_PROGRAMS: Program[] = [];

// ====================================================================
// 🔗 2. CHUẨN BỊ KẾT NỐI BACKEND (API CALLS)
// ====================================================================

// Giả lập một module API (Bạn sẽ thay thế bằng Axios, Fetch,...)
const API = {
    // 💡 Thay thế bằng hàm fetch thực tế của bạn
    async get(endpoint: string) {
        // Trong thực tế, bạn sẽ dùng: return await axios.get(endpoint);
        console.log(`[API MOCK] GET: ${endpoint}`);
        return { data: [] }; // Trả về dữ liệu trống/mặc định
    },
    async post(endpoint: string, data: any) {
        console.log(`[API MOCK] POST: ${endpoint}`, data);
        return { data: { id: Date.now(), ...data } }; // Trả về ID giả lập
    },
    async put(endpoint: string, data: any) {
        console.log(`[API MOCK] PUT: ${endpoint}`, data);
        return { data: data };
    },
    async delete(endpoint: string) {
        console.log(`[API MOCK] DELETE: ${endpoint}`);
        return { status: 200 };
    }
};

interface SessionCalendarProps {
  userRole: string;
  currentUserId?: number; // Ví dụ: ID người dùng hiện tại
}

const isOnline = (booking: StudentBooking): boolean => {
  if (typeof booking.location !== 'string') return false; 
  const lowerCaseLocation = booking.location.toLowerCase();
  return lowerCaseLocation.includes('meet') || 
         lowerCaseLocation.includes('zoom') || 
         lowerCaseLocation.includes('online');
};

export default function SessionCalendar({ userRole, currentUserId = 1 }: SessionCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<'week' | 'month'>('week');
  
  // ====================================================================
  // 💾 3. STATE VỚI KIỂU DỮ LIỆU ĐƯỢC KHỞI TẠO TỪ DỮ LIỆU TRỐNG
  // ====================================================================
  
  // Data States
  const [tutors, setTutors] = useState<Tutor[]>(EMPTY_TUTORS);
  const [groupSessions, setGroupSessions] = useState<GroupSession[]>(EMPTY_GROUP_SESSIONS);
  const [studentBookings, setStudentBookings] = useState<StudentBooking[]>(EMPTY_STUDENT_BOOKINGS);
  const [tutorAvailability, setTutorAvailability] = useState<AvailabilitySlot[]>(EMPTY_TUTOR_AVAILABILITY);
  const [oneOnOneRequests, setOneOnOneRequests] = useState<OneOnOneRequest[]>(EMPTY_ONE_ON_ONE_REQUESTS);
  const [programs, setPrograms] = useState<Program[]>(EMPTY_PROGRAMS);
  
  // UI States
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTutor, setSelectedTutor] = useState<number | null>(null);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isAvailabilityDialogOpen, setIsAvailabilityDialogOpen] = useState(false);
  const [isCreateSessionDialogOpen, setIsCreateSessionDialogOpen] = useState(false);
  const [isEditBookingDialogOpen, setIsEditBookingDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<StudentBooking | null>(null);

  const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const currentWeek = [1, 2, 3, 4, 5, 6, 7]; // Cần tính toán dựa trên selectedDate trong thực tế

  // ====================================================================
  // 🔄 4. HÀM FETCH DỮ LIỆU TỪ API (HÀM TẢI LẠI TRANG)
  // ====================================================================
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
        // Tải dữ liệu chung
        const [tutorRes, sessionRes, programRes] = await Promise.all([
            API.get('/tutors'), 
            API.get('/sessions/group'),
            API.get('/programs')
        ]);
        // Giả định API trả về mảng rỗng nếu không tìm thấy, trong thực tế cần xử lý .data
        setTutors(tutorRes.data as Tutor[] || EMPTY_TUTORS); 
        setGroupSessions(sessionRes.data as GroupSession[] || EMPTY_GROUP_SESSIONS);
        setPrograms(programRes.data as Program[] || EMPTY_PROGRAMS);

        // Tải dữ liệu theo vai trò
        if (userRole === 'student') {
            const [bookingRes, requestRes] = await Promise.all([
                API.get(`/students/${currentUserId}/bookings`),
                API.get(`/students/${currentUserId}/requests`),
            ]);
            setStudentBookings(bookingRes.data as StudentBooking[] || EMPTY_STUDENT_BOOKINGS);
            // Có thể dùng requestRes để hiển thị lịch sử yêu cầu 1-1
        } else if (userRole === 'tutor') {
            const [availRes, requestRes] = await Promise.all([
                API.get(`/tutors/${currentUserId}/availability`),
                API.get(`/tutors/${currentUserId}/requests/pending`),
            ]);
            setTutorAvailability(availRes.data as AvailabilitySlot[] || EMPTY_TUTOR_AVAILABILITY);
            setOneOnOneRequests(requestRes.data as OneOnOneRequest[] || EMPTY_ONE_ON_ONE_REQUESTS);
        } else if (userRole === 'admin' || userRole === 'coordinator') {
            // Admin có thể xem lịch rảnh của tất cả tutors hoặc requests chung
            const allAvailRes = await API.get('/tutors/availability/all');
            setTutorAvailability(allAvailRes.data as AvailabilitySlot[] || EMPTY_TUTOR_AVAILABILITY);
        }

    } catch (error) {
        console.error("Lỗi khi fetch data:", error);
        toast.error("Không thể tải dữ liệu từ máy chủ.");
    } finally {
        setIsLoading(false);
    }
  }, [userRole, currentUserId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
      return <div className="p-6 text-center text-gray-500">Đang tải dữ liệu...</div>;
  }
  
  // ====================================================================
  // ⚙️ 5. HANDLERS ĐÃ TÍCH HỢP API
  // ====================================================================
  
  // Student handlers
  const handleRequest1on1 = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    // Xây dựng payload request
    const payload = {
        studentId: currentUserId,
        tutorId: selectedTutor,
        subject: formData.get('subject'),
        preferredDate: formData.get('date'),
        preferredTime: formData.get('time'),
        type: formData.get('type'),
        note: formData.get('note'),
    };
    
    try {
        await API.post('/requests/1on1', payload);
        setIsRequestDialogOpen(false);
        toast.success('Đã gửi yêu cầu ghép cặp 1-1 thành công!');
        // Tải lại lịch sử yêu cầu của sinh viên
        // await fetchData(); 
    } catch (error) {
        toast.error('Lỗi khi gửi yêu cầu. Vui lòng thử lại.');
    }
  };

  const handleEnrollGroupSession = async (sessionId: number) => {
    const session = groupSessions.find(s => s.id === sessionId);
    if (!session || session.enrolled >= session.maxParticipants) {
      toast.error('Session không hợp lệ hoặc đã đầy.');
      return;
    }
    
    try {
        await API.post(`/sessions/${sessionId}/enroll`, { userId: currentUserId });
        toast.success('Đã đăng ký session thành công!');
        // Cập nhật lại danh sách booking và session nhóm (số lượng enrolled)
        await fetchData(); 
    } catch (error) {
        toast.error('Đăng ký không thành công.');
    }
  };

  const handleEditBooking = (booking: StudentBooking) => {
    setSelectedBooking(booking);
    setIsEditBookingDialogOpen(true);
  };

  const handleDeleteBooking = async (bookingId: number) => {
    try {
        await API.delete(`/bookings/${bookingId}`);
        toast.info('Đã hủy buổi tư vấn');
        // Cập nhật lại danh sách booking
        await fetchData();
    } catch (error) {
        toast.error('Không thể hủy buổi tư vấn.');
    }
  };

  const handleUpdateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;

    try {
        // Chỉ gửi những trường có thể chỉnh sửa
        const updatePayload = {
            date: selectedBooking.date,
            time: selectedBooking.time,
        };
        await API.put(`/bookings/${selectedBooking.id}`, updatePayload);
        toast.success('Đã cập nhật thông tin buổi tư vấn');
        // Cập nhật state cục bộ hoặc fetch lại
        await fetchData();
        setIsEditBookingDialogOpen(false);
    } catch (error) {
        toast.error('Cập nhật không thành công.');
    }
  };

  // Tutor handlers
  const handleAddAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const newSlot = {
        date: formData.get('date'),
        time: formData.get('time'),
        tutorId: currentUserId,
    };

    try {
        await API.post('/tutors/availability', newSlot);
        toast.success('Đã thêm lịch rảnh thành công!');
        // Cập nhật lại lịch rảnh
        await fetchData();
        setIsAvailabilityDialogOpen(false);
    } catch (error) {
        toast.error('Không thể thêm lịch rảnh.');
    }
  };

  const handleApproveRequest = async (requestId: number) => {
    try {
        await API.put(`/tutors/requests/${requestId}/approve`, {});
        toast.success('Đã chấp nhận yêu cầu ghép cặp');
        // Cập nhật lại danh sách yêu cầu và lịch trình
        await fetchData(); 
    } catch (error) {
        toast.error('Chấp nhận yêu cầu không thành công.');
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    try {
        await API.put(`/tutors/requests/${requestId}/reject`, {});
        toast.error('Đã từ chối yêu cầu');
        await fetchData();
    } catch (error) {
        toast.error('Từ chối yêu cầu không thành công.');
    }
  };

  // Admin handlers
  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const payload = {
        programId: formData.get('program'),
        title: formData.get('title'),
        tutorId: formData.get('tutor-select'),
        date: formData.get('session-date'),
        time: formData.get('session-time'),
        type: formData.get('session-type'),
        location: formData.get('session-location'),
        maxParticipants: parseInt(formData.get('max-participants') as string),
    };

    try {
        await API.post('/admin/sessions', payload);
        toast.success('Đã tạo session mới thành công!');
        await fetchData();
        setIsCreateSessionDialogOpen(false);
    } catch (error) {
        toast.error('Tạo session không thành công.');
    }
  };

  // ====================================================================
  // 🎨 RENDER VIEWS
  // ====================================================================

  // Render Student View
  // === CHỈ THAY ĐỔI PHẦN renderStudentView() ===
// Thay thế toàn bộ hàm renderStudentView() bằng đoạn code dưới đây

const renderStudentView = () => (
  <Tabs defaultValue="my-schedule" className="w-full">
    <TabsList className="grid w-full grid-cols-4">
      <TabsTrigger value="my-schedule">Lịch của tôi</TabsTrigger>
      <TabsTrigger value="tutor-availability">Lịch rảnh Tutor</TabsTrigger>
      <TabsTrigger value="one-on-one-requests">Yêu cầu 1-1</TabsTrigger>
      <TabsTrigger value="group-sessions">Session nhóm</TabsTrigger>
    </TabsList>

    {/* ====================== 1. LỊCH CỦA TÔI ====================== */}
    <TabsContent value="my-schedule" className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Lịch tư vấn của tôi</h3>
          <p className="text-sm text-gray-500">Các buổi 1-1 và nhóm đã được xác nhận</p>
        </div>
      </div>

      {studentBookings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            Chưa có lịch tư vấn nào. Hãy đặt lịch 1-1 hoặc đăng ký session nhóm!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {studentBookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1 flex items-start gap-4">
                    <div className="w-1 h-20 bg-[#0B5FA5] rounded" />
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={booking.type === '1-1' ? 'default' : 'secondary'}>
                          {booking.type === '1-1' ? '1-1' : 'Nhóm'}
                        </Badge>
                        <h4 className="font-medium">
                          {booking.title || booking.subject}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">Tutor: {booking.tutor}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {booking.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {booking.time}
                        </span>
                        {isOnline(booking) ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <Video className="w-4 h-4" />
                            Trực tuyến
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {booking.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditBooking(booking)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteBooking(booking.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </TabsContent>

    {/* ====================== 2. LỊCH RẢNH TUTOR ====================== */}
    <TabsContent value="tutor-availability" className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Lịch rảnh của Tutor</h3>
          <p className="text-sm text-gray-500">Chọn khung giờ rảnh để đặt tư vấn 1-1</p>
        </div>
        <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#0B5FA5] hover:bg-[#094A7F]">
              <Plus className="w-4 h-4 mr-2" />
              Đặt lịch 1-1
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Đặt lịch tư vấn 1-1</DialogTitle>
              <DialogDescription>Chọn tutor và khung giờ rảnh</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleRequest1on1} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Chọn Tutor</Label>
                  <Select onValueChange={(v) => setSelectedTutor(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn tutor" />
                    </SelectTrigger>
                    <SelectContent>
                      {tutors.map((t) => (
                        <SelectItem key={t.id} value={t.id.toString()}>
                          {t.name} - {t.subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Môn học</Label>
                  <Input name="subject" required placeholder="VD: Toán cao cấp" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Ngày mong muốn</Label>
                  <Input name="date" type="date" required />
                </div>
                <div>
                  <Label>Thời gian</Label>
                  <Input name="time" required placeholder="14:00 - 15:30" />
                </div>
              </div>
              <div>
                <Label>Hình thức</Label>
                <Select name="type">
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn hình thức" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Trực tuyến</SelectItem>
                    <SelectItem value="offline">Trực tiếp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Ghi chú (nếu có)</Label>
                <Textarea name="note" placeholder="Nội dung cần hỗ trợ..." />
              </div>
              <div className="flex gap-3">
                <Button type="submit" className="flex-1 bg-[#0B5FA5]">
                  Gửi yêu cầu
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsRequestDialogOpen(false)}>
                  Hủy
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tutor</TableHead>
                <TableHead>Ngày</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tutorAvailability
                .filter((slot) => !slot.booked)
                .map((slot) => (
                  <TableRow key={slot.id}>
                    <TableCell className="font-medium">{slot.tutorName}</TableCell>
                    <TableCell>{slot.date}</TableCell>
                    <TableCell>{slot.time}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Còn trống
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedTutor(slot.tutorId);
                          setIsRequestDialogOpen(true);
                        }}
                      >
                        Đặt ngay
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          {tutorAvailability.filter((s) => !s.booked).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Hiện tại chưa có lịch rảnh nào. Vui lòng quay lại sau!
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>

    {/* ====================== 3. YÊU CẦU 1-1 ====================== */}
    <TabsContent value="one-on-one-requests" className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Lịch sử yêu cầu 1-1</h3>
        <p className="text-sm text-gray-500">Theo dõi trạng thái các yêu cầu đã gửi</p>
      </div>

      <div className="space-y-4">
        {oneOnOneRequests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              Chưa có yêu cầu nào được gửi.
            </CardContent>
          </Card>
        ) : (
          oneOnOneRequests.map((req) => (
            <Card key={req.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge
                        variant={
                          req.status === 'approved' ? 'default' :
                          req.status === 'rejected' ? 'destructive' : 'secondary'
                        }
                      >
                        {req.status === 'pending' && 'Đang chờ'}
                        {req.status === 'approved' && 'Đã duyệt'}
                        {req.status === 'rejected' && 'Bị từ chối'}
                      </Badge>
                      <span className="font-medium">{req.subject}</span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Yêu cầu với: <strong>{tutors.find(t => t.id === selectedTutor)?.name || 'Tutor'}</strong></p>
                      <p>Thời gian mong muốn: {req.preferredDate} - {req.preferredTime}</p>
                      {req.note && <p className="italic mt-2">Ghi chú: {req.note}</p>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </TabsContent>

    {/* ====================== 4. SESSION NHÓM ====================== */}
    <TabsContent value="group-sessions" className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Session nhóm</h3>
        <p className="text-sm text-gray-500">Đăng ký tham gia các buổi học nhóm</p>
      </div>

      <div className="grid gap-4">
        {groupSessions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              Chưa có session nhóm nào được tạo.
            </CardContent>
          </Card>
        ) : (
          groupSessions.map((session) => {
            const isEnrolled = studentBookings.some(b => b.type === 'group' && b.title === session.title);
            const isFull = session.enrolled >= session.maxParticipants;

            return (
              <Card key={session.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 flex items-start gap-4">
                      <div className="w-1 h-24 bg-[#0B5FA5] rounded" />
                      <div>
                        <h4 className="font-semibold text-lg mb-1">{session.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">Giảng viên: {session.tutor}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {session.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {session.time}
                          </span>
                          {session.type === 'online' ? (
                            <span className="flex items-center gap-1 text-green-600">
                              <Video className="w-4 h-4" />
                              Trực tuyến
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {session.location}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-3">
                          <Badge variant="outline" className="bg-blue-50">
                            {session.program}
                          </Badge>
                          <span className="text-sm flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {session.enrolled}/{session.maxParticipants} đã đăng ký
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleEnrollGroupSession(session.id)}
                      disabled={isEnrolled || isFull}
                      className={isEnrolled ? 'bg-gray-400' : ''}
                    >
                      {isEnrolled ? 'Đã đăng ký' : isFull ? 'Đã đầy' : 'Đăng ký ngay'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </TabsContent>
  </Tabs>
);

  // Render Tutor View
  const renderTutorView = () => (
    <Tabs defaultValue="schedule" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="schedule">Lịch của tôi</TabsTrigger>
        <TabsTrigger value="availability">Lịch rảnh</TabsTrigger>
        <TabsTrigger value="requests">Yêu cầu 1-1</TabsTrigger>
      </TabsList>

      {/* My Schedule (Cần lọc booking theo currentUserId/TutorId) */}
      <TabsContent value="schedule" className="space-y-4">
        {/* ... (Phần hiển thị lịch đã xác nhận) ... */}
        <div className="space-y-3">
            {studentBookings
                .filter(b => b.tutor === (tutors.find(t => t.id === currentUserId)?.name || '')) // Cần tìm tutorName từ currentUserId
                .map((booking) => (
                    // ... (Card hiển thị booking)
                    <Card key={booking.id}>
                        <CardContent className="pt-6">
                            {/* ... */}
                            <Badge className="bg-green-500">Đã xác nhận</Badge>
                        </CardContent>
                    </Card>
            ))}
        </div>
      </TabsContent>

      {/* Availability */}
      <TabsContent value="availability" className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3>Đăng ký lịch rảnh</h3>
            <p className="text-sm text-gray-500">Đăng ký các khung giờ rảnh để admin sắp xếp</p>
          </div>
          <Dialog open={isAvailabilityDialogOpen} onOpenChange={setIsAvailabilityDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#0B5FA5] hover:bg-[#094A7F]">
                <Plus className="w-4 h-4 mr-2" />
                Thêm lịch rảnh
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thêm lịch rảnh</DialogTitle>
                <DialogDescription>
                  Đăng ký khung giờ bạn có thể tư vấn
                </DialogDescription>
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
                  <Button type="submit" className="flex-1 bg-[#0B5FA5] hover:bg-[#094A7F]">
                    Thêm
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAvailabilityDialogOpen(false)}
                  >
                    Hủy
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Khung giờ</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tutorAvailability.map((slot) => (
                  <TableRow key={slot.id}>
                    <TableCell>{slot.date}</TableCell>
                    <TableCell>{slot.time}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={slot.booked ? 'bg-gray-50' : 'bg-green-50'}>
                        {slot.booked ? 'Đã đặt' : 'Rảnh'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
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
          <h3>Yêu cầu ghép cặp 1-1</h3>
          <p className="text-sm text-gray-500">Xem và xử lý yêu cầu từ sinh viên</p>
        </div>

        <div className="space-y-3">
          {oneOnOneRequests.map((request) => (
            <Card key={request.id}>
                {/* ... (Nội dung hiển thị yêu cầu) ... */}
                <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            {/* ... chi tiết yêu cầu */}
                        </div>
                        {request.status === 'pending' && (
                            <div className="flex gap-2 ml-4">
                                <Button
                                    size="sm"
                                    className="bg-green-500 hover:bg-green-600"
                                    onClick={() => handleApproveRequest(request.id)}
                                >
                                    <Check className="w-4 h-4 mr-1" />
                                    Chấp nhận
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-red-500 text-red-500 hover:bg-red-50"
                                    onClick={() => handleRejectRequest(request.id)}
                                >
                                    <X className="w-4 h-4 mr-1" />
                                    Từ chối
                                </Button>
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

  // Render Admin View
  const renderAdminView = () => (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview">Tổng quan</TabsTrigger>
        <TabsTrigger value="tutor-availability">Lịch rảnh tutors</TabsTrigger>
        <TabsTrigger value="create-session">Tạo session</TabsTrigger>
      </TabsList>

      {/* Overview */}
      <TabsContent value="overview" className="space-y-4">
        {/* ... (Phần hiển thị Programs) ... */}
        <div className="grid gap-4 md:grid-cols-2">
            {programs.map((program) => (
                <Card key={program.id}>
                    {/* ... (Nội dung Program) */}
                </Card>
            ))}
        </div>
      </TabsContent>

      {/* Tutor Availability */}
      <TabsContent value="tutor-availability" className="space-y-4">
        {/* ... (Phần hiển thị lịch rảnh tất cả tutor) ... */}
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tutor</TableHead>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Khung giờ</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tutorAvailability.map((slot) => ( // Sử dụng tutorAvailability chung
                  <TableRow key={slot.id}>
                    <TableCell>{slot.tutorName}</TableCell>
                    <TableCell>{slot.date}</TableCell>
                    <TableCell>{slot.time}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={slot.booked ? 'bg-gray-50' : 'bg-green-50'}
                      >
                        {slot.booked ? 'Đã đặt' : 'Rảnh'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {!slot.booked && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-[#0B5FA5]"
                          onClick={() => setIsCreateSessionDialogOpen(true)}
                        >
                          <UserCheck className="w-4 h-4 mr-1" />
                          Tạo session
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
            <h3>Tạo session nhóm</h3>
            <p className="text-sm text-gray-500">Tạo session và điều phối tutors</p>
          </div>
          <Dialog open={isCreateSessionDialogOpen} onOpenChange={setIsCreateSessionDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#0B5FA5] hover:bg-[#094A7F]">
                <Plus className="w-4 h-4 mr-2" />
                Tạo session mới
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Tạo session nhóm</DialogTitle>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleCreateSession}>
                <div className="space-y-2">
                  <Label htmlFor="program">Chương trình</Label>
                  <Select name="program">
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn chương trình" />
                    </SelectTrigger>
                    <SelectContent>
                      {programs.map((program) => (
                        <SelectItem key={program.id} value={program.id.toString()}>
                          {program.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* ... (Các trường input khác) ... */}
                <div className="space-y-2">
                  <Label htmlFor="tutor-select">Tutor</Label>
                  <Select name="tutor-select">
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn tutor" />
                    </SelectTrigger>
                    <SelectContent>
                      {tutors.map((tutor) => (
                        <SelectItem key={tutor.id} value={tutor.id.toString()}>
                          {tutor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* ... */}
                <div className="flex gap-4">
                  <Button type="submit" className="flex-1 bg-[#0B5FA5] hover:bg-[#094A7F]">
                    Tạo session
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateSessionDialogOpen(false)}
                  >
                    Hủy
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {groupSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex justify-between items-center p-4 border rounded-lg"
                >
                  {/* ... (Nội dung hiển thị sessions hiện có) */}
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
        {/* ... (Card title và descriptions) */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch tư vấn</CardTitle>
          <CardDescription>
            {userRole === 'student' && 'Quản lý lịch tư vấn và đăng ký session'}
            {userRole === 'tutor' && 'Quản lý lịch rảnh và yêu cầu tư vấn'}
            {(userRole === 'admin' || userRole === 'coordinator') && 'Quản lý chương trình và tạo session'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userRole === 'student' && renderStudentView()}
          {userRole === 'tutor' && renderTutorView()}
          {(userRole === 'admin' || userRole === 'coordinator') && renderAdminView()}
        </CardContent>
      </Card>

      {/* Edit Booking Dialog */}
      <Dialog open={isEditBookingDialogOpen} onOpenChange={setIsEditBookingDialogOpen}>
        {/* ... (Nội dung Edit Dialog) */}
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa buổi tư vấn</DialogTitle>
            <DialogDescription>Cập nhật thông tin buổi tư vấn</DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <form className="space-y-4" onSubmit={handleUpdateBooking}>
              <div className="space-y-2">
                <Label htmlFor="edit-date">Ngày</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={selectedBooking.date}
                  onChange={(e) => setSelectedBooking({ ...selectedBooking, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-time">Thời gian</Label>
                <Input
                  id="edit-time"
                  value={selectedBooking.time}
                  onChange={(e) => setSelectedBooking({ ...selectedBooking, time: e.target.value })}
                />
              </div>
              <div className="flex gap-4">
                <Button type="submit" className="flex-1 bg-[#0B5FA5] hover:bg-[#094A7F]">
                  Cập nhật
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditBookingDialogOpen(false)}
                >
                  Hủy
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}