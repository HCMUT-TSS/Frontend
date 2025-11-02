import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Calendar, Clock, MapPin, Video, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface SessionCalendarProps {
  userRole: string;
}

export default function SessionCalendar({ userRole }: SessionCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<'week' | 'month'>('week');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const sessions = [
    {
      id: 1,
      date: '2025-11-03',
      time: '14:00 - 15:30',
      tutor: 'Phạm Văn D',
      student: 'Nguyễn Văn A',
      topic: 'Lập trình C++ - Con trỏ',
      type: 'online',
      status: 'scheduled',
    },
    {
      id: 2,
      date: '2025-11-05',
      time: '09:00 - 10:30',
      tutor: 'Hoàng Thị E',
      student: 'Trần Thị B',
      topic: 'Cấu trúc dữ liệu - Cây',
      type: 'offline',
      location: 'Phòng H1-302',
      status: 'scheduled',
    },
    {
      id: 3,
      date: '2025-11-01',
      time: '15:00 - 16:30',
      tutor: 'Võ Văn F',
      student: 'Lê Văn C',
      topic: 'Giải tích - Tích phân',
      type: 'online',
      status: 'completed',
    },
  ];

  const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const currentWeek = [1, 2, 3, 4, 5, 6, 7];

  const handleCreateSession = () => {
    setIsDialogOpen(false);
    toast.success('Đã tạo lịch tư vấn thành công!');
  };

  const handleCancelSession = (id: number) => {
    toast.info('Đã hủy buổi tư vấn');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Lịch tư vấn</CardTitle>
              <CardDescription>
                Quản lý lịch các buổi tư vấn của bạn
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#0B5FA5] hover:bg-[#094A7F]">
                  <Plus className="w-4 h-4 mr-2" />
                  Đặt lịch mới
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Tạo lịch tư vấn</DialogTitle>
                  <DialogDescription>
                    Điền thông tin để đặt lịch buổi tư vấn
                  </DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleCreateSession(); }}>
                  <div className="space-y-2">
                    <Label htmlFor="date">Ngày</Label>
                    <Input id="date" type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Thời gian</Label>
                    <Input id="time" type="time" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Hình thức</Label>
                    <Select>
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Chọn hình thức" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">Trực tuyến</SelectItem>
                        <SelectItem value="offline">Trực tiếp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Địa điểm / Link</Label>
                    <Input id="location" placeholder="Phòng hoặc link Meet..." required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="topic">Chủ đề</Label>
                    <Textarea id="topic" placeholder="Mô tả nội dung buổi tư vấn..." rows={3} required />
                  </div>
                  <div className="flex gap-4">
                    <Button type="submit" className="flex-1 bg-[#0B5FA5] hover:bg-[#094A7F]">
                      Tạo lịch
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Hủy
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar View Controls */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                Hôm nay
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">←</Button>
                <span>Tháng 11, 2025</span>
                <Button variant="ghost" size="icon">→</Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={view === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('week')}
                className={view === 'week' ? 'bg-[#0B5FA5]' : ''}
              >
                Tuần
              </Button>
              <Button
                variant={view === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('month')}
                className={view === 'month' ? 'bg-[#0B5FA5]' : ''}
              >
                Tháng
              </Button>
            </div>
          </div>

          {/* Week View */}
          {view === 'week' && (
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day, index) => (
                <div key={day} className="text-center">
                  <div className="text-sm text-gray-500 mb-2">{day}</div>
                  <div
                    className={`aspect-square flex items-center justify-center rounded-lg ${
                      currentWeek[index] === 1
                        ? 'bg-[#0B5FA5] text-white'
                        : 'bg-gray-100'
                    }`}
                  >
                    {currentWeek[index]}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sessions List */}
          <div className="mt-6 space-y-4">
            <h3>Các buổi tư vấn sắp tới</h3>
            {sessions.map((session) => (
              <Card key={session.id} className={session.status === 'completed' ? 'opacity-60' : ''}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`w-1 h-16 rounded ${session.status === 'completed' ? 'bg-gray-400' : 'bg-[#0B5FA5]'}`} />
                        <div className="flex-1">
                          <h4 className="mb-1">{session.topic}</h4>
                          <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {session.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {session.time}
                            </span>
                            {session.type === 'online' ? (
                              <span className="flex items-center gap-1">
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
                          <div className="mt-2 flex gap-2">
                            {userRole === 'tutor' && (
                              <p className="text-sm">Sinh viên: <span className="text-gray-600">{session.student}</span></p>
                            )}
                            {userRole === 'student' && (
                              <p className="text-sm">Tutor: <span className="text-gray-600">{session.tutor}</span></p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <Badge
                        variant={session.status === 'completed' ? 'secondary' : 'default'}
                        className={session.status === 'scheduled' ? 'bg-green-500' : ''}
                      >
                        {session.status === 'completed' ? 'Hoàn thành' : 'Đã lên lịch'}
                      </Badge>
                      {session.status === 'scheduled' && (
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleCancelSession(session.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
