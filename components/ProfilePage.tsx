// src/components/ProfilePage.tsx
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Upload, Mail, Phone, Award, Calendar, Loader2, Building2 } from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  ssoSub: string;
  faculty: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  role: 'student' | 'tutor' | 'admin';
  expertise?: string[];
  bio?: string;
}

interface BookingHistory {
  id: number;
  preferredDate: string;
  startTime: string;
  subject: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed';
  tutorName?: string; // tên người còn lại
  tutor?: { name: string };
  student?: { name: string };
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<BookingHistory[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // GỌI API THẬT TỪ BACKEND
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include', // QUAN TRỌNG: lấy cookie token
        });

        if (!res.ok) throw new Error('Không thể tải hồ sơ');

        const data = await res.json();
        setProfile(data.user);

        // Lấy lịch sử đặt lịch
        const historyRes = await fetch('/api/student/my/bookings', {
          credentials: 'include',
        });
        const historyData = await historyRes.json();
        setHistory(historyData.bookings || []);

      } catch (err) {
        toast.error('Không thể tải thông tin hồ sơ. Vui lòng đăng nhập lại.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/update-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          phoneNumber: profile?.phoneNumber,
          bio: profile?.bio,
          expertise: profile?.role === 'tutor' ? profile.expertise : undefined,
        }),
      });

      if (res.ok) {
        toast.success('Cập nhật hồ sơ thành công!');
        setIsEditing(false);
      } else {
        throw new Error('Cập nhật thất bại');
      }
    } catch (err) {
      toast.error('Lỗi khi cập nhật hồ sơ');
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0B5FA5]" />
        <p className="mt-4 text-gray-600">Đang tải hồ sơ...</p>
      </div>
    );
  }

  if (!profile) {
    return <div className="p-6 text-center text-red-600">Không tìm thấy thông tin người dùng</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
          <TabsTrigger value="history">Lịch sử hoạt động</TabsTrigger>
          <TabsTrigger value="documents">Tài liệu</TabsTrigger>
        </TabsList>

        {/* THÔNG TIN CÁ NHÂN */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Hồ sơ cá nhân</CardTitle>
              <CardDescription>
                {profile.role === 'tutor' ? 'Quản lý thông tin gia sư' : 'Thông tin cá nhân'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="flex items-center gap-6">
                <Avatar className="w-28 h-28 border-4 border-[#0B5FA5]/20">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-gradient-to-br from-[#0B5FA5] to-[#094A7F] text-white text-3xl font-bold">
                    {profile.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">{profile.name}</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant={profile.role === 'tutor' ? 'default' : 'secondary'}>
                      {profile.role === 'tutor' ? 'Gia sư' : profile.role === 'admin' ? 'Quản trị viên' : 'Sinh viên'}
                    </Badge>
                    <span className="text-sm text-gray-600">MSSV/Mã GV: {profile.ssoSub}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Mail className="w-4 h-4" /> Email</Label>
                  <Input value={profile.email} disabled />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Phone className="w-4 h-4" /> Số điện thoại</Label>
                  <Input
                    value={profile.phoneNumber || 'Chưa cập nhật'}
                    onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Building2 className="w-4 h-4" /> Khoa</Label>
                  <Input value={profile.faculty} disabled />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Ngày sinh</Label>
                  <Input value={profile.dateOfBirth || 'Chưa cập nhật'} disabled />
                </div>
              </div>

              {/* Chỉ tutor có chuyên môn và bio */}
              {profile.role === 'tutor' && (
                <>
                  <div className="space-y-3">
                    <Label>Chuyên môn</Label>
                    <div className="flex flex-wrap gap-3">
                      {(profile.expertise || ['Chưa cập nhật']).map((skill, i) => (
                        <Badge key={i} className="bg-[#0B5FA5] text-white px-4 py-2">
                          <Award className="w-4 h-4 mr-2" />
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Giới thiệu bản thân</Label>
                    <Textarea
                      value={profile.bio || ''}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      disabled={!isEditing}
                      rows={5}
                      placeholder="Viết vài dòng về kinh nghiệm giảng dạy của bạn..."
                    />
                  </div>
                </>
              )}

              <div className="flex gap-4 pt-6 border-t">
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} className="bg-[#0B5FA5]">
                    Chỉnh sửa hồ sơ
                  </Button>
                ) : (
                  <>
                    <Button onClick={handleSave} className="bg-[#0B5FA5]">
                      Lưu thay đổi
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Hủy
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* LỊCH SỬ HOẠT ĐỘNG */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử {profile.role === 'tutor' ? 'tư vấn' : 'đặt lịch'}</CardTitle>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Chưa có buổi học nào</p>
              ) : (
                <div className="space-y-4">
                  {history.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-5 border rounded-xl hover:bg-gray-50">
                      <div>
                        <h4 className="font-semibold">{item.subject}</h4>
                        <p className="text-sm text-gray-600">
                          {profile.role === 'tutor'
                            ? `Sinh viên: ${item.student?.name || 'Ẩn danh'}`
                            : `Gia sư: ${item.tutor?.name || 'Chưa có'}`
                          }
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(item.preferredDate).toLocaleDateString('vi-VN')} • {item.startTime}
                        </p>
                      </div>
                      <Badge variant={item.status === 'confirmed' ? 'default' : 'secondary'}>
                        {item.status === 'pending' ? 'Đang chờ' : item.status === 'confirmed' ? 'Đã xác nhận' : 'Đã hủy'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TÀI LIỆU */}
        <TabsContent value="documents">
          <Card className="text-center py-16">
            <CardContent>
              <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Tính năng đang phát triển</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}