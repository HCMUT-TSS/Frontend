import { useState } from 'react';
import { GraduationCap, Loader2, AlertCircle, Check } from 'lucide-react';
import { toast } from 'sonner';
import { mockLoginWithEmail } from '../src/lib/mockAuth'; // Đảm bảo đường dẫn đúng

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
  onLogin: (role: Role, email: string) => void; // ← ĐÃ SỬA: nhận cả email
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Vui lòng nhập email HCMUT');
      return;
    }

    if (!email.toLowerCase().endsWith('@hcmut.edu.vn')) {
      setError('Email phải thuộc hệ thống HCMUT (@hcmut.edu.vn)');
      return;
    }

    setIsLoading(true);

    try {
      const result = await mockLoginWithEmail(email.trim().toLowerCase()) as {
            success: boolean;
            user?: any;
            error?: string;
        };

      if (result.success && result.user) {
        const name = result.user.name.split(' ').pop() || 'bạn';
        toast.success(`Chào mừng ${name} trở lại!`, {
          description: `Đã đăng nhập với vai trò ${result.user.role === 'tutor' ? 'Gia sư' : result.user.role === 'admin' ? 'Quản trị viên' : 'Sinh viên'}`,
        });

        // ← TRUYỀN ĐÚNG ROLE + EMAIL
        onLogin(result.user.role as Role, result.user.email);
      } else {
        throw new Error(result.error || 'Không tìm thấy tài khoản');
      }
    } catch (err: any) {
      const msg = err.message || 'Lỗi hệ thống';

      if (msg.includes('không tìm thấy') || msg.includes('Không tìm thấy')) {
        setError('Không tìm thấy tài khoản này trong hệ thống HCMUT');
      } else {
        setError(msg);
      }

      toast.error('Đăng nhập thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = (role: Role, emailExample: string) => {
    toast.info(`Đăng nhập nhanh – ${role === 'student' ? 'Sinh viên' : role === 'tutor' ? 'Gia sư' : 'Quản trị viên'}`);
    onLogin(role, emailExample);
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
                placeholder="mssv@hcmut.edu.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
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

            {/* HIỂN THỊ LỖI */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Đăng nhập thất bại</p>
                  <p className="mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* TEST NHANH (chỉ hiện khi dev) */}
            {import.meta.env.DEV && (
              <div className="pt-8 border-t border-gray-200">
                <p className="text-xs font-bold text-gray-500 text-center mb-4 uppercase tracking-wider">
                  Test nhanh (dev only)
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <Button variant="secondary" onClick={() => quickLogin('student', 'phat.nguyenchlorcale@hcmut.edu.vn')}>
                    Student
                  </Button>
                  <Button variant="secondary" onClick={() => quickLogin('tutor', 'tam.nguyen272@hcmut.edu.vn')}>
                    Tutor
                  </Button>
                  <Button variant="secondary" onClick={() => quickLogin('admin', 'ctsv@hcmut.edu.vn')}>
                    Admin
                  </Button>
                </div>

                <div className="mt-4 text-xs text-gray-500 space-y-1">
                  <p>• Student: <code className="bg-gray-100 px-1 rounded">phat.nguyenchlorcale@hcmut.edu.vn</code></p>
                  <p>• Tutor: <code className="bg-gray-100 px-1 rounded">tam.nguyen272@hcmut.edu.vn</code></p>
                  <p>• Admin: <code className="bg-gray-100 px-1 rounded">ctsv@hcmut.edu.vn</code></p>
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

          <div className="space-y-10">
            <div className="grid grid-cols-3 gap-8">
              {[
                { num: '1,248', label: 'Sinh viên' },
                { num: '45', label: 'Gia sư' },
                { num: '4.8', label: 'Đánh giá' },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-4xl font-bold">{s.num}</div>
                  <div className="text-sm opacity-80">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              {[
                'Kết nối với gia sư chất lượng cao',
                'Lịch học linh hoạt 24/7',
                'Thư viện tài liệu phong phú',
              ].map((text) => (
                <div key={text} className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm text-white">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}