import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Upload, Mail, Phone, Award } from 'lucide-react';
import { toast } from 'sonner';

interface TutorProfileProps {
  userRole: string;
}

export default function TutorProfile({ userRole }: TutorProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: userRole === 'tutor' ? 'Trần Văn B' : 'Nguyễn Văn A',
    id: userRole === 'tutor' ? 'T2012345' : 'S2012345',
    email: userRole === 'tutor' ? 'tutor@hcmut.edu.vn' : 'student@hcmut.edu.vn',
    phone: '0912345678',
    faculty: 'Khoa Khoa học và Kỹ thuật Máy tính',
    expertise: ['Lập trình C/C++', 'Cấu trúc dữ liệu', 'Giải tích'],
    bio: 'Là sinh viên năm cuối với kinh nghiệm hỗ trợ học tập cho sinh viên năm nhất và năm hai.',
  });

  const handleSave = () => {
    setIsEditing(false);
    toast.success('Cập nhật hồ sơ thành công!');
  };

  const sessions = [
    { date: '15/10/2025', student: 'Nguyễn Thị C', topic: 'Lập trình C++', status: 'Hoàn thành' },
    { date: '20/10/2025', student: 'Lê Văn D', topic: 'Cấu trúc dữ liệu', status: 'Hoàn thành' },
    { date: '25/10/2025', student: 'Phạm Thị E', topic: 'Giải tích', status: 'Đã lên lịch' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="profile">Thông tin</TabsTrigger>
          <TabsTrigger value="history">Lịch sử</TabsTrigger>
          <TabsTrigger value="documents">Tài liệu</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Hồ sơ cá nhân</CardTitle>
              <CardDescription>
                Quản lý thông tin cá nhân và chuyên môn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-[#0B5FA5] text-white text-2xl">
                      {profile.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3>{profile.name}</h3>
                    <p className="text-sm text-gray-500">{profile.id}</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      <Upload className="w-4 h-4 mr-2" />
                      Tải ảnh đại diện
                    </Button>
                  </div>
                </div>

                {/* Profile Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Họ và tên</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="id">Mã số</Label>
                    <Input id="id" value={profile.id} disabled />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <Input
                        id="phone"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="faculty">Khoa</Label>
                    <Input
                      id="faculty"
                      value={profile.faculty}
                      onChange={(e) => setProfile({ ...profile, faculty: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                {userRole === 'tutor' && (
                  <>
                    <div className="space-y-2">
                      <Label>Chuyên môn</Label>
                      <div className="flex flex-wrap gap-2">
                        {profile.expertise.map((skill) => (
                          <Badge key={skill} className="bg-[#0B5FA5]">
                            <Award className="w-3 h-3 mr-1" />
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Giới thiệu</Label>
                      <Textarea
                        id="bio"
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        disabled={!isEditing}
                        rows={4}
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-4">
                  {!isEditing ? (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="bg-[#0B5FA5] hover:bg-[#094A7F]"
                    >
                      Chỉnh sửa hồ sơ
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={handleSave}
                        className="bg-[#0B5FA5] hover:bg-[#094A7F]"
                      >
                        Lưu thay đổi
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Hủy
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử tư vấn</CardTitle>
              <CardDescription>
                Danh sách các buổi tư vấn đã thực hiện
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessions.map((session, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <h4>{session.topic}</h4>
                      <p className="text-sm text-gray-500">
                        {userRole === 'tutor' ? `Sinh viên: ${session.student}` : `Ngày: ${session.date}`}
                      </p>
                    </div>
                    <Badge
                      variant={session.status === 'Hoàn thành' ? 'default' : 'secondary'}
                    >
                      {session.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Tài liệu</CardTitle>
              <CardDescription>
                Quản lý tài liệu hỗ trợ học tập
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 mb-4">Chưa có tài liệu nào</p>
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Tải tài liệu lên
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
