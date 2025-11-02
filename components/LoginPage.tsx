import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { GraduationCap, BookOpen, Chrome, Facebook } from 'lucide-react';
import { toast } from 'sonner';

interface LoginPageProps {
  onLogin: (role: 'student' | 'tutor' | 'coordinator' | 'admin') => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [activeTab, setActiveTab] = useState<'student' | 'tutor'>('student');
  const [studentFormData, setStudentFormData] = useState({
    studentId: '',
    password: '',
  });
  const [tutorFormData, setTutorFormData] = useState({
    tutorId: '',
    password: '',
  });

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin('student');
  };

  const handleTutorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin('tutor');
  };

  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    toast.info(`Đăng nhập bằng ${provider === 'google' ? 'Google' : 'Facebook'} (Demo)`);
  };

  const handleAdminLogin = () => {
    onLogin('admin');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Logo & Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#0B5FA5] rounded-2xl shadow-lg">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl mb-2">Chào mừng trở lại</h1>
              <p className="text-gray-500">
                Hệ thống Hỗ trợ Tutor - ĐH Bách Khoa ĐHQG TP.HCM
              </p>
            </div>
          </div>

          {/* Tabs for Student/Tutor */}
          <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 h-12">
              <TabsTrigger value="student" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Học viên
              </TabsTrigger>
              <TabsTrigger value="tutor" className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Gia sư
              </TabsTrigger>
            </TabsList>

            {/* Student Login Form */}
            <TabsContent value="student" className="space-y-4">
              <form onSubmit={handleStudentSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="studentId">Mã sinh viên</Label>
                  <Input
                    id="studentId"
                    type="text"
                    placeholder="Nhập mã sinh viên của bạn"
                    value={studentFormData.studentId}
                    onChange={(e) =>
                      setStudentFormData({ ...studentFormData, studentId: e.target.value })
                    }
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="studentPassword">Mật khẩu</Label>
                    <button
                      type="button"
                      className="text-sm text-[#0B5FA5] hover:underline"
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                  <Input
                    id="studentPassword"
                    type="password"
                    placeholder="Nhập mật khẩu"
                    value={studentFormData.password}
                    onChange={(e) =>
                      setStudentFormData({ ...studentFormData, password: e.target.value })
                    }
                    required
                    className="h-11"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="rememberStudent"
                    className="w-4 h-4 rounded border-gray-300 text-[#0B5FA5] focus:ring-[#0B5FA5]"
                  />
                  <label htmlFor="rememberStudent" className="text-sm text-gray-600">
                    Ghi nhớ đăng nhập
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-[#0B5FA5] hover:bg-[#094A7F]"
                >
                  Đăng nhập bằng HCMUT_SSO
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Hoặc đăng nhập với</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11"
                  onClick={() => handleSocialLogin('google')}
                >
                  <Chrome className="w-5 h-5 mr-2" />
                  Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11"
                  onClick={() => handleSocialLogin('facebook')}
                >
                  <Facebook className="w-5 h-5 mr-2" />
                  Facebook
                </Button>
              </div>

              <p className="text-center text-sm text-gray-600">
                Chưa có tài khoản?{' '}
                <a href="#" className="text-[#0B5FA5] hover:underline">
                  Đăng ký ngay
                </a>
              </p>
            </TabsContent>

            {/* Tutor Login Form */}
            <TabsContent value="tutor" className="space-y-4">
              <form onSubmit={handleTutorSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tutorId">Mã gia sư / Nhân viên</Label>
                  <Input
                    id="tutorId"
                    type="text"
                    placeholder="Nhập mã gia sư của bạn"
                    value={tutorFormData.tutorId}
                    onChange={(e) =>
                      setTutorFormData({ ...tutorFormData, tutorId: e.target.value })
                    }
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="tutorPassword">Mật khẩu</Label>
                    <button
                      type="button"
                      className="text-sm text-[#0B5FA5] hover:underline"
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                  <Input
                    id="tutorPassword"
                    type="password"
                    placeholder="Nhập mật khẩu"
                    value={tutorFormData.password}
                    onChange={(e) =>
                      setTutorFormData({ ...tutorFormData, password: e.target.value })
                    }
                    required
                    className="h-11"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="rememberTutor"
                    className="w-4 h-4 rounded border-gray-300 text-[#0B5FA5] focus:ring-[#0B5FA5]"
                  />
                  <label htmlFor="rememberTutor" className="text-sm text-gray-600">
                    Ghi nhớ đăng nhập
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-[#0B5FA5] hover:bg-[#094A7F]"
                >
                  Đăng nhập bằng HCMUT_SSO
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Hoặc đăng nhập với</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11"
                  onClick={() => handleSocialLogin('google')}
                >
                  <Chrome className="w-5 h-5 mr-2" />
                  Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11"
                  onClick={() => handleSocialLogin('facebook')}
                >
                  <Facebook className="w-5 h-5 mr-2" />
                  Facebook
                </Button>
              </div>

              <p className="text-center text-sm text-gray-600">
                Chưa đăng ký làm gia sư?{' '}
                <a href="#" className="text-[#0B5FA5] hover:underline">
                  Ứng tuyển ngay
                </a>
              </p>
            </TabsContent>
          </Tabs>

          {/* Admin Access Link */}
          <div className="text-center">
            <button
              onClick={handleAdminLogin}
              className="text-sm text-gray-500 hover:text-[#0B5FA5] transition-colors"
            >
              Truy cập quản trị viên →
            </button>
          </div>

          {/* Security Notice */}
          <div className="text-center text-xs text-gray-400">
            <p>🔒 Đăng nhập an toàn qua HCMUT Single Sign-On</p>
            <p className="mt-1">Thông tin của bạn được bảo mật theo tiêu chuẩn ISO 27001</p>
          </div>
        </div>
      </div>

      {/* Right Side - Campus Image */}
      <div className="hidden lg:block lg:w-1/2 relative bg-gradient-to-br from-[#0B5FA5] to-[#094A7F]">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1706016899218-ebe36844f70e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwY2FtcHVzJTIwYnVpbGRpbmd8ZW58MXx8fHwxNzYxOTg2ODQ2fDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="HCMUT Campus"
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        
        {/* Overlay Content */}
        <div className="relative h-full flex flex-col justify-between p-12 text-white">
          <div>
            <h2 className="text-4xl mb-4">
              Đại học Bách Khoa
              <br />
              ĐHQG TP.HCM
            </h2>
            <p className="text-lg text-white/90">
              Nền tảng hỗ trợ học tập thông minh
            </p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-2">1,248</div>
                <div className="text-sm text-white/80">Sinh viên</div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">45</div>
                <div className="text-sm text-white/80">Gia sư</div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">4.8</div>
                <div className="text-sm text-white/80">Đánh giá</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  ✓
                </div>
                <div>
                  <div className="text-sm">Kết nối với gia sư chất lượng cao</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  ✓
                </div>
                <div>
                  <div className="text-sm">Lịch học linh hoạt, phù hợp với bạn</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  ✓
                </div>
                <div>
                  <div className="text-sm">Thư viện tài liệu phong phú</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
