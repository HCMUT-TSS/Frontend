import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ChevronLeft, MessageCircle, Calendar, Users, MapPin, Video } from 'lucide-react';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
});

interface ClassSession {
  id: number;
  title: string;           // Lấy từ cột title trong Schedules
  tutorName: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  location?: string;
  meetLink?: string;
}

export default function Community() {
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassSession | null>(null);
  const [loading, setLoading] = useState(true);

  const dayNames = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

  // LẤY DANH SÁCH LỚP HỌC (dùng API tutor/schedule vì có title)
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get('/api/tutor/schedule');
        const data = res.data.schedules || res.data || [];

        const formatted = data
          .filter((s: any) => s.isActive)
          .map((s: any) => ({
            id: s.id,
            title: s.title || 'Buổi tư vấn 1:1',
            tutorName: 'Tutor', // bạn có thể join với User sau nếu cần
            dayOfWeek: s.dayOfWeek,
            startTime: s.startTime,
            endTime: s.endTime,
            location: s.location,
            meetLink: s.meetLink,
          }));
        setClasses(formatted);
      } catch (err) {
        toast.error('Không tải được danh sách lớp');
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  if (loading) {
    return <div className="p-20 text-center text-2xl">Đang tải lớp học...</div>;
  }

  // TRANG CHỦ: DANH SÁCH LỚP HỌC
  if (!selectedClass) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <h1 className="text-5xl font-extrabold text-center text-[#0B5FA5] mb-12">
          CỘNG ĐỒNG LỚP HỌC
        </h1>

        {classes.length === 0 ? (
          <Card className="text-center py-32">
            <p className="text-3xl font-bold text-gray-600">Chưa có lớp học nào</p>
          </Card>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {classes.map((cls) => (
              <Card
                key={cls.id}
                className="cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
                onClick={() => setSelectedClass(cls)}
              >
                <CardContent className="p-8 text-center">
                  <h3 className="text-3xl font-bold text-[#0B5FA5] mb-6 line-clamp-2 min-h-24">
                    {cls.title}
                  </h3>

                  <div className="space-y-4 mb-8">
                    <p className="text-2xl font-semibold text-gray-800">
                      {dayNames[cls.dayOfWeek]}
                    </p>
                    <p className="text-4xl font-extrabold text-[#0B5FA5]">
                      {cls.startTime} - {cls.endTime}
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-3 text-lg">
                    {cls.meetLink ? (
                      <>
                        <Video className="w-8 h-8 text-blue-600" />
                        <span className="font-bold text-blue-700">Online</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="w-8 h-8 text-red-600" />
                        <span className="font-bold text-red-700">Offline</span>
                      </>
                    )}
                  </div>

                  <Button className="w-full mt-8 bg-[#0B5FA5] hover:bg-[#094a85] text-white font-bold text-xl py-8 text-2xl">
                    <MessageCircle className="w-8 h-8 mr-4" />
                    Vào thảo luận
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // TRANG THẢO LUẬN CỦA 1 LỚP
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Button
        variant="ghost"
        className="mb-8 text-xl"
        onClick={() => setSelectedClass(null)}
      >
        <ChevronLeft className="w-6 h-6 mr-2" /> Quay lại danh sách lớp
      </Button>

      <Card className="shadow-2xl">
        <CardContent className="pt-10">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-extrabold text-[#0B5FA5] mb-4">
              {selectedClass.title}
            </h1>
            <p className="text-2xl text-gray-700">
              {dayNames[selectedClass.dayOfWeek]} • {selectedClass.startTime} - {selectedClass.endTime}
            </p>
            <div className="flex items-center justify-center gap-4 mt-6">
              <Users className="w-8 h-8 text-gray-600" />
              <span className="text-xl font-semibold">12 thành viên</span>
            </div>
          </div>

          <div className="text-center py-20 text-gray-500">
            <MessageCircle className="w-32 h-32 mx-auto mb-6 text-gray-300" />
            <p className="text-3xl font-bold">Phòng thảo luận đang phát triển</p>
            <p className="text-xl mt-4">Sắp có bình luận, tài liệu, thông báo...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}