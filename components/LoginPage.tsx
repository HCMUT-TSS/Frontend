import { useState } from 'react';
import { GraduationCap } from 'lucide-react';
import { toast } from 'sonner';

// --- CUSTOM UI COMPONENTS (Định nghĩa trực tiếp để giải quyết lỗi import) ---

// 1. Button Component
const Button = ({ children, className = '', type = 'button', onClick, variant = 'default' }: React.ComponentProps<'button'> & { variant?: 'default' | 'secondary' }) => {
  const baseClasses = "h-11 px-4 py-2 inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  let style = '';
  if (variant === 'default') {
    // Phong cách button chính (HCMUT Blue)
    style = "bg-[#0B5FA5] text-white hover:bg-[#094A7F] shadow-lg hover:shadow-xl"; 
  } else if (variant === 'secondary') {
    // Phong cách button phụ (Gray for quick tests)
    style = "bg-gray-200 text-gray-800 hover:bg-gray-300 shadow-md"; 
  }

  return (
    <button
      type={type}
      className={`${baseClasses} ${style} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// 2. Input Component
const Input = ({ id, type = 'text', placeholder, value, onChange, required, className = '' }: React.ComponentProps<'input'>) => {
  const baseClasses = "flex h-11 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B5FA5] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-shadow";
  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className={`${baseClasses} ${className}`}
    />
  );
};

// 3. Label Component
const Label = ({ htmlFor, children }: React.ComponentProps<'label'>) => {
  return (
    <label 
      htmlFor={htmlFor} 
      className="text-sm font-medium leading-none text-gray-700"
    >
      {children}
    </label>
  );
};

// --- END CUSTOM UI COMPONENTS ---


interface LoginPageProps {
  onLogin: (role: 'student' | 'tutor' | 'coordinator' | 'admin') => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  // Sử dụng một state duy nhất cho form đăng nhập
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Giả định rằng nút này là đường dẫn chính cho người dùng (Student/Tutor)
    // Sau khi xóa các nút test, đây sẽ là logic đăng nhập SSO thực tế
    onLogin('student'); 
  };

  const handleAdminLogin = () => {
    onLogin('admin');
  };
  
  // --- HÀM ĐĂNG NHẬP NHANH ---
  const handleQuickLogin = (role: 'student' | 'tutor' | 'coordinator') => {
    onLogin(role);
    toast.info(`Đăng nhập nhanh với vai trò: ${role.toUpperCase()}`);
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Chào mừng trở lại</h1>
              <p className="text-gray-500">
                Hệ thống Hỗ trợ Tutor - ĐH Bách Khoa ĐHQG TP.HCM
              </p>
            </div>
          </div>

          {/* Unified Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Nhập email của bạn (Ví dụ: MSSV@hcmut.edu.vn)"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className="h-11"
                />
              </div>

{/*               <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <button
                    type="button"
                    className="text-sm text-[#0B5FA5] hover:underline"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  className="h-11"
                />
              </div> */}

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 rounded-md border-gray-300 text-[#0B5FA5] focus:ring-[#0B5FA5]"
                />
                <label htmlFor="remember" className="text-sm text-gray-600">
                  Ghi nhớ đăng nhập
                </label>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11"
            >
              Đăng nhập bằng HCMUT_SSO
            </Button>

            {/* --- TEST BUTTONS START --- */}
            <div className="pt-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 text-center">
                Truy cập nhanh (Chỉ dùng để Test)
              </div>
              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => handleQuickLogin('student')}
                >
                  Login as Student
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => handleQuickLogin('tutor')}
                >
                  Login as Tutor
                </Button>
              </div>
            </div>
            {/* --- TEST BUTTONS END --- */}

          </form>
          {/* END Unified Login Form */}

          {/* Admin Access Link */}
          <div className="text-center mt-4">
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
            src="https://hcmut.edu.vn/img/content/F2-AIKz4FvLVIvlqbyGJRySx.jpg"
            alt="HCMUT Campus"
            onError={(e) => {
                e.currentTarget.onerror = null; 
                e.currentTarget.src = "https://placehold.co/1080x1920/0B5FA5/ffffff?text=HCMUT+Campus";
            }}
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        
        {/* Overlay Content */}
        <div className="relative h-full flex flex-col justify-between p-12 text-white">
          <div>
            <h2 className="text-4xl font-extrabold mb-4">
              Trường Đại học Bách Khoa
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
                <div className="text-3xl font-bold mb-2">1,248</div>
                <div className="text-sm text-white/80">Sinh viên</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">45</div>
                <div className="text-sm text-white/80">Gia sư</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">4.8</div>
                <div className="text-sm text-white/80">Đánh giá</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-bold text-xl">
                  ✓
                </div>
                <div>
                  <div className="text-sm">Kết nối với gia sư chất lượng cao</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-bold text-xl">
                  ✓
                </div>
                <div>
                  <div className="text-sm">Lịch học linh hoạt, phù hợp với bạn</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-bold text-xl">
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