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
import { Upload, Mail, Phone, Award, Calendar, User, Building2 } from 'lucide-react';
import { toast } from 'sonner';

// Import mock data từ file bạn đã có
import { getProfileFromDATACORE, HCMUT_DATABASE } from '../src/mock/mockHcmut';
import { MOCK_STUDENT_BOOKINGS, MOCK_ONE_ON_ONE_REQUESTS } from '../src/mock/mockHcmut';

interface ProfilePageProps {
  userEmail: string; // Email người đang đăng nhập (lấy từ login)
  userRole: 'student' | 'tutor' | 'admin';
}

export default function ProfilePage({ userRole, userEmail }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Lấy thông tin từ mock database
  useEffect(() => {
    try {
      const userData = getProfileFromDATACORE(userEmail);
      setProfile({
        ...userData,
        // Dữ liệu bổ sung cho tutor
        expertise: userRole === 'tutor' ? ['Lập trình C++', 'Cấu trúc dữ liệu', 'Giải tích'] : [],
        bio: userRole === 'tutor' 
          ? 'Tutor xuất sắc với kinh nghiệm hỗ trợ hơn 50 sinh viên năm nhất và năm hai.'
          : 'Sinh viên đang tích cực tham gia các chương trình hỗ trợ học tập.',
      });
      setLoading(false);
    } catch (err) {
      toast.error('Không tải được thông tin hồ sơ');
      setLoading(false);
    }
  }, [userEmail, userRole]);

  const handleSave = () => {
    setIsEditing(false);
    toast.success('Cập nhật hồ sơ thành công!');
  };

  // Lịch sử tư vấn (dùng mock)
  const historySessions = userRole === 'tutor' 
    ? MOCK_ONE_ON_ONE_REQUESTS.map(r => ({
        date: r.preferredDate,
        student: r.studentName,
        topic: r.subject,
        status: r.status === 'approved' ? 'Đã lên lịch' : r.status === 'pending' ? 'Đang chờ' : 'Hoàn thành'
      }))
    : MOCK_STUDENT_BOOKINGS.map(b => ({
        date: b.date,
        topic: b.subject,
        tutor: b.tutor,
        status: b.status === 'confirmed' ? 'Đã xác nhận' : 'Đang chờ'
      }));

  if (loading) {
    return <div className="p-6 text-center">Đang tải hồ sơ...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
          <TabsTrigger value="history">Lịch sử hoạt động</TabsTrigger>
          <TabsTrigger value="documents">Tài liệu</TabsTrigger>
        </TabsList>

        {/* ==================== THÔNG TIN CÁ NHÂN ==================== */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Hồ sơ cá nhân</CardTitle>
              <CardDescription>
                {userRole === 'tutor' ? 'Quản lý thông tin tutor và chuyên môn' : 'Thông tin sinh viên'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Avatar + Tên */}
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
                    <Badge variant={userRole === 'tutor' ? 'default' : 'secondary'} className="text-sm">
                      {userRole === 'tutor' ? 'Tutor' : userRole === 'admin' ? 'Quản trị viên' : 'Sinh viên'}
                    </Badge>
                    <span className="text-sm text-gray-600">Mã số: {profile.ssoSub}</span>
                  </div>
                  {isEditing && (
                    <Button variant="outline" size="sm" className="mt-3">
                      <Upload className="w-4 h-4 mr-2" />
                      Đổi ảnh đại diện
                    </Button>
                  )}
                </div>
              </div>

              {/* Thông tin chi tiết */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Email
                  </Label>
                  <Input value={profile.email} disabled={!isEditing} />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Phone className="w-4 h-4" /> Số điện thoại
                  </Label>
                  <Input 
                    value={profile.phoneNumber || 'Chưa cập nhật'} 
                    onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" /> Khoa
                  </Label>
                  <Input value={profile.faculty} disabled />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Ngày sinh
                  </Label>
                  <Input 
                    value={profile.dateOfBirth ? profile.dateOfBirth.toLocaleDateString('vi-VN') : 'Chưa cập nhật'} 
                    disabled 
                  />
                </div>
              </div>

              {/* Chỉ tutor có chuyên môn và bio */}
              {userRole === 'tutor' && (
                <>
                  <div className="space-y-3">
                    <Label>Chuyên môn</Label>
                    <div className="flex flex-wrap gap-3">
                      {profile.expertise.map((skill: string) => (
                        <Badge key={skill} className="bg-[#0B5FA5] text-white px-4 py-2">
                          <Award className="w-4 h-4 mr-2" />
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Giới thiệu bản thân</Label>
                    <Textarea
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      disabled={!isEditing}
                      rows={5}
                      className="resize-none"
                    />
                  </div>
                </>
              )}

              {/* Nút chỉnh sửa */}
              <div className="flex gap-4 pt-6 border-t">
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} className="bg-[#0B5FA5] hover:bg-[#094A7F]">
                    Chỉnh sửa hồ sơ
                  </Button>
                ) : (
                  <>
                    <Button onClick={handleSave} className="bg-[#0B5FA5] hover:bg-[#094A7F]">
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

        {/* ==================== LỊCH SỬ HOẠT ĐỘNG ==================== */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử {userRole === 'tutor' ? 'tư vấn' : 'đặt lịch'}</CardTitle>
              <CardDescription>
                {userRole === 'tutor' ? 'Các buổi đã hỗ trợ sinh viên' : 'Các buổi bạn đã đăng ký'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {historySessions.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Chưa có hoạt động nào</p>
                ) : (
                  historySessions.map((session: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-5 border rounded-xl hover:bg-gray-50 transition">
                      <div>
                        <h4 className="font-semibold">{session.topic}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {userRole === 'tutor' 
                            ? `Sinh viên: ${session.student}` 
                            : `Tutor: ${session.tutor || 'Chưa xác định'}`
                          }
                        </p>
                        <p className="text-sm text-gray-500">Ngày: {session.date}</p>
                      </div>
                      <Badge variant={session.status.includes('xác nhận') || session.status === 'Đã lên lịch' ? 'default' : 'secondary'}>
                        {session.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== TÀI LIỆU ==================== */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Tài liệu hỗ trợ</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-16">
              <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Upload className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg mb-6">Chưa có tài liệu nào được tải lên</p>
              <Button variant="outline" size="lg">
                <Upload className="w-5 h-5 mr-2" />
                Tải tài liệu lên
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}