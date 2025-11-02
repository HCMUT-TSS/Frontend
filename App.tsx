import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Home, Users, Calendar, FileText, BarChart3, BookOpen, MessageSquare, User, LogOut } from 'lucide-react';
import LoginPage from './components/LoginPage';
import StudentRegistration from './components/StudentRegistration';
import TutorProfile from './components/TutorProfile';
import TutorMatching from './components/TutorMatching';
import SessionCalendar from './components/SessionCalendar';
import SessionRecord from './components/SessionRecord';
import Feedback from './components/Feedback';
import Reports from './components/Reports';
import Library from './components/Library';
import Community from './components/Community';
import { Button } from './components/ui/button';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'student' | 'tutor' | 'coordinator' | 'admin'>('student');
  const navigate = useNavigate();

  const handleLogin = (role: 'student' | 'tutor' | 'coordinator' | 'admin') => {
    setIsLoggedIn(true);
    setUserRole(role);
    navigate('/calendar');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate('/');
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const navItems = [
    { path: '/calendar', label: 'Lịch tư vấn', icon: Calendar },
    { path: '/profile', label: 'Hồ sơ', icon: User },
    { path: '/library', label: 'Thư viện', icon: BookOpen },
    { path: '/community', label: 'Cộng đồng', icon: MessageSquare },
    { path: '/feedback', label: 'Đánh giá', icon: FileText },
  ];

  if (userRole === 'coordinator' || userRole === 'admin') {
    navItems.splice(1, 0, { path: '/matching', label: 'Ghép đôi', icon: Users });
    navItems.push({ path: '/reports', label: 'Báo cáo', icon: BarChart3 });
  }

  if (userRole === 'tutor') {
    navItems.splice(4, 0, { path: '/record', label: 'Ghi nhận', icon: FileText });
  }

  if (userRole === 'student') {
    navItems.splice(1, 0, { path: '/register', label: 'Đăng ký', icon: Home });
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0B5FA5] text-white flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl">HCMUT</h1>
          <p className="text-sm text-white/80">Hệ thống Hỗ trợ Tutor</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-white/10"
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="mb-4 p-3 bg-white/10 rounded-lg">
            <p className="text-sm">Vai trò: <span className="capitalize">{userRole}</span></p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full bg-transparent border-white text-white hover:bg-white hover:text-[#0B5FA5]"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Đăng xuất
          </Button>
        </div>
      </aside>

      {/* Routes */}
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/calendar" element={<SessionCalendar userRole={userRole} />} />
          <Route path="/profile" element={<TutorProfile userRole={userRole} />} />
          <Route path="/register" element={<StudentRegistration />} />
          <Route path="/matching" element={<TutorMatching />} />
          <Route path="/record" element={<SessionRecord />} />
          <Route path="/feedback" element={<Feedback userRole={userRole} />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/library" element={<Library />} />
          <Route path="/community" element={<Community />} />
        </Routes>
      </main>
    </div>
  );
}