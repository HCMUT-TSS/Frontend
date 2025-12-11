import { useState } from 'react';
import { GraduationCap, Loader2, AlertCircle, Check, Key } from 'lucide-react';
import { toast } from 'sonner';

// ====================== CUSTOM UI COMPONENTS ======================
const Button = ({
  children,
  className = '',
  type = 'button' as const,
  onClick,
  variant = 'default' as const,
  disabled = false,
}: React.ComponentProps<'button'> & { variant?: 'default' | 'secondary' }) => {
  const base = 'h-11 px-6 inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  const styles = variant === 'secondary'
    ? 'bg-gray-200 text-gray-800 hover:bg-gray-300 shadow-md'
    : 'bg-[#0B5FA5] text-white hover:bg-[#094A7F] shadow-lg hover:shadow-xl';

  return (
    <button type={type} disabled={disabled} className={`${base} ${styles} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
};

const Input = ({
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  required,
  className = '',
}: React.ComponentProps<'input'>) => (
  <input
    id={id}
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    required={required}
    className={`flex h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B5FA5] focus-visible:ring-offset-2 ${className}`}
  />
);

const Label = ({ htmlFor, children }: React.ComponentProps<'label'>) => (
  <label htmlFor={htmlFor} className="text-sm font-medium text-gray-700">
    {children}
  </label>
);

// ====================== TYPE ======================
type Role = 'student' | 'tutor' | 'admin';

interface LoginPageProps {
  onLogin: (role: Role, email: string, user?: any) => void; // thêm user nếu cần
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!email.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu ');
      setIsLoading(false);
      return;
    }

    if (!email.toLowerCase().endsWith('@hcmut.edu.vn') && !email.toLowerCase().includes('@student.hcmut.edu.vn')) {
      setError('Email phải thuộc hệ thống HCMUT');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/sso-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim().toLowerCase(), password: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Đăng nhập thất bại');
      }

      if (data.user && data.message.includes('thành công')) {
        const name = data.user.name.split(' ').pop() || 'bạn';
        const roleLabel = data.user.role === 'tutor' ? 'Gia sư' : data.user.role === 'admin' ? 'Quản trị viên' : 'Sinh viên';

        toast.success(`Chào mừng ${name} trở lại!`, {
          description: `Đã đăng nhập với vai trò ${roleLabel}`,
        });

        onLogin(data.user.role as Role, data.user.email, data.user);
      }
    } catch (err: any) {
      const msg = err.message || 'Lỗi kết nối server';
      setError(msg.includes('Failed to fetch') ? 'Không thể kết nối đến server. Vui lòng kiểm tra backend.' : msg);
      toast.error('Đăng nhập thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  // ====================== TEST NHANH (chỉ hiện khi dev) ======================
  const quickLogin = async (emailExample: string) => {
    setEmail(emailExample);
    toast.info(`Test nhanh: ${emailExample}`);
    setTimeout(() => {
      const fakeEvent = { preventDefault: () => { } } as React.FormEvent;
      // @ts-ignore
      handleSubmit(fakeEvent);
    }, 500);
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT – FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#f7f7f7]">
        <div className="w-full max-w-md space-y-10">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-xl mb-6 overflow-hidden">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/d/de/HCMUT_official_logo.png"
                alt="Logo ĐH Bách Khoa TP.HCM"
                className="w-14 h-14 object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Chào mừng trở lại</h1>
            <p className="mt-2 text-gray-600">Hệ thống Hỗ trợ Tutor – ĐH Bách Khoa TP.HCM</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email HCMUT</Label>
              <Input
                id="email"
                type="email"
                placeholder="mssv@student.hcmut.edu.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <Key className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <Button type="submit" disabled={isLoading} className="w-full text-base font-semibold">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Đang xác thực với HCMUT SSO...
                </>
              ) : (
                'Đăng nhập bằng HCMUT_SSO'
              )}
            </Button>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Đăng nhập thất bại</p>
                  <p className="mt-1">{error}</p>
                </div>
              </div>
            )}
          </form>

          <p className="text-center text-xs text-gray-400 mt-10">
            Đăng nhập an toàn qua HCMUT Single Sign-On • ISO 27001
          </p>
        </div>
      </div>

      {/* RIGHT – HÌNH NỀN */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#0B5FA5] to-[#094A7F]">
        <img
          src="https://hcmut.edu.vn/img/content/F2-AIKz4FvLVIvlqbyGJRySx.jpg"
          alt="Campus"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          onError={(e) => {
            e.currentTarget.src = 'https://placehold.co/1200x1600/0B5FA5/ffffff?text=HCMUT+Campus&font=roboto';
          }}
        />
        <div className="relative h-full flex flex-col justify-between p-12 text-white">
          <div>
            <h2 className="text-5xl font-extrabold leading-tight">
              Trường Đại học Bách Khoa
              <br />
              ĐHQG TP.HCM
            </h2>
            <p className="mt-4 text-lg opacity-90">Nền tảng hỗ trợ học tập thông minh</p>
          </div>
          {/* ... phần còn lại giữ nguyên */}
        </div>
      </div>
    </div>
  );
}