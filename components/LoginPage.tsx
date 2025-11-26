// src/components/LoginPage.tsx
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { GraduationCap, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface LoginPageProps {
  onLogin: (user: { role: 'student' | 'tutor' | 'admin'; name: string; email: string }) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSSOLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Vui lòng nhập email HCMUT');
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.endsWith('@student.hcmut.edu.vn') && !normalizedEmail.endsWith('@hcmut.edu.vn')) {
      toast.error('Chỉ chấp nhận email @student.hcmut.edu.vn hoặc @hcmut.edu.vn');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/sso-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Đăng nhập thất bại');
      }

      toast.success(`Chào mừng ${data.user.name || 'bạn'} trở lại!`);
      onLogin({
        role: data.user.role,
        name: data.user.name,
        email: data.user.email,
      });
    } catch (err: any) {
      toast.error(err.message || 'Lỗi kết nối hệ thống');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-10">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-[#0B5FA5] rounded-3xl shadow-xl">
              <GraduationCap className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">HCMUT Tutor</h1>
              <p className="text-lg text-gray-600 mt-3">
                Hệ thống Hỗ trợ Học tập Thông minh
                <br />
                <span className="text-sm font-medium text-[#0B5FA5]">
                  Đại học Bách Khoa - ĐHQG TP.HCM
                </span>
              </p>
            </div>
          </div>
          <form id="sso-form" onSubmit={handleSSOLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base">
                Email HCMUT của bạn
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="example@student.hcmut.edu.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 text-lg"
                required
                autoFocus
              />
              <p className="text-sm text-gray-500">
                Sử dụng email sinh viên hoặc cán bộ để đăng nhập
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 text-lg font-semibold bg-[#0B5FA5] hover:bg-[#094A7F] shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Đang xác thực với HCMUT_SSO...
                </>
              ) : (
                'Đăng nhập bằng HCMUT SSO'
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="text-center space-y-3">
            <p className="text-sm text-gray-500">
              Đăng nhập an toàn qua{' '}
              <span className="font-semibold text-[#0B5FA5]">HCMUT Single Sign-On</span>
            </p>
            <p className="text-xs text-gray-400">
              Bảo mật theo tiêu chuẩn ISO 27001 • Không lưu mật khẩu
            </p>
          </div>
        </div>
      </div>
      <div className="hidden lg:block lg:w-1/2 relative bg-gradient-to-br from-[#0B5FA5] to-[#094A7F] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1591122944015-f6ecbefd4e9d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80"
          alt="HCMUT Campus"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative h-full flex flex-col justify-between p-12 text-white">
          <div>
            <h2 className="text-5xl font-bold leading-tight">
              Đại học Bách Khoa
              <br />
              ĐHQG TP.HCM
            </h2>
            <p className="text-xl mt-6 opacity-90">
              Nơi khởi đầu của những kỹ sư xuất sắc
            </p>
          </div>

          <div className="space-y-8">
            <div className="grid grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold">1,248</div>
                <div className="text-sm opacity-80">Học viên đang học</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold">52</div>
                <div className="text-sm opacity-80">Gia sư chất lượng</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold">4.9</div>
                <div className="text-sm opacity-80">Đánh giá trung bình</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}