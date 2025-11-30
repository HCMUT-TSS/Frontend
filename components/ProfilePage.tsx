import { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Mail, Phone, Award, Calendar, Building2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/user/me', { credentials: 'include' });
        if (!res.ok) throw new Error('Không thể tải hồ sơ');
        const data = await res.json();
        setProfile(data.user);
      } catch (err) {
        toast.error('Không tải được hồ sơ');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="p-6 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>;
  if (!profile) return <div className="p-6 text-center text-red-600">Không tìm thấy hồ sơ</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
          <TabsTrigger value="history">Lịch sử hoạt động</TabsTrigger>
          <TabsTrigger value="documents">Tài liệu</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Hồ sơ cá nhân</CardTitle>
              <CardDescription>
                {profile.role === 'tutor' ? 'Thông tin gia sư' : 'Thông tin cá nhân'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="flex items-center gap-6">
                <Avatar className="w-28 h-28 border-4 border-[#0B5FA5]/20">
                  <AvatarImage src={profile.avatar || ''} />
                  <AvatarFallback className="bg-gradient-to-br from-[#0B5FA5] to-[#094A7F] text-white text-3xl font-bold">
                    {profile.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">{profile.name}</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant={profile.role === 'tutor' ? 'default' : 'secondary'}>
                      {profile.role === 'tutor' ? 'Gia sư' : profile.role === 'admin' ? 'Quản trị viên' : 'Sinh viên'}
                    </Badge>
                    <span className="text-sm text-gray-600">MSSV: {profile.ssoSub}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label><Mail className="w-4 h-4 inline mr-2" />Email</Label>
                  <Input value={profile.email} disabled />
                </div>
                <div className="space-y-2">
                  <Label><Phone className="w-4 h-4 inline mr-2" />Số điện thoại</Label>
                  <Input value={profile.phoneNumber || ''} disabled />
                </div>
                <div className="space-y-2">
                  <Label><Building2 className="w-4 h-4 inline mr-2" />Khoa</Label>
                  <Input value={profile.faculty || 'Chưa có'} disabled className="bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <Label>
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Ngày sinh
                  </Label>
                  <Input
                    value={
                      profile.dateOfBirth
                        ? format(new Date(profile.dateOfBirth), 'dd/MM/yyyy')
                        : 'Chưa cập nhật'
                    }
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>

              {profile.role === 'tutor' && (
                <>
                  <div className="space-y-3">
                    <Label>Chuyên môn</Label>
                    <div className="flex flex-wrap gap-3">
                      {profile.expertise?.length > 0
                        ? profile.expertise.map((s: string, i: number) => (
                          <Badge key={i} className="bg-[#0B5FA5] text-white"><Award className="w-4 h-4 mr-2" />{s}</Badge>
                        ))
                        : <span className="text-gray-500">Chưa có chuyên môn</span>}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Giới thiệu bản thân</Label>
                    <Textarea value={profile.bio || ''} disabled rows={5} />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
