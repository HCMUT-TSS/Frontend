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
  const [currentPage, setCurrentPage] = useState('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'student' | 'tutor' | 'coordinator' | 'admin'>('student');

  const handleLogin = (role: 'student' | 'tutor' | 'coordinator' | 'admin') => {
    setIsLoggedIn(true);
    setUserRole(role);
    setCurrentPage('calendar');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('login');
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const navItems = [
    { id: 'calendar', label: 'Lịch tư vấn', icon: Calendar },
    { id: 'profile', label: 'Hồ sơ', icon: User },
    { id: 'library', label: 'Thư viện', icon: BookOpen },
    { id: 'community', label: 'Cộng đồng', icon: MessageSquare },
    { id: 'feedback', label: 'Đánh giá', icon: FileText },
  ];

  if (userRole === 'coordinator' || userRole === 'admin') {
    navItems.splice(1, 0, { id: 'matching', label: 'Ghép đôi', icon: Users });
    navItems.push({ id: 'reports', label: 'Báo cáo', icon: BarChart3 });
  }

  if (userRole === 'tutor') {
    navItems.splice(4, 0, { id: 'record', label: 'Ghi nhận', icon: FileText });
  }

  // if (userRole === 'student' && currentPage === 'profile') {
  //   navItems.splice(1, 0, { id: 'register', label: 'Đăng ký', icon: Home });
  // }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#0B5FA5] text-white flex flex-col fixed min-h-screen">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl">HCMUT</h1>
          <p className="text-sm text-white/80">Hệ thống Hỗ trợ Tutor</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentPage === item.id
                    ? 'bg-white text-[#0B5FA5]'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="mb-4 p-3 bg-white/10 rounded-lg">
            <p className="text-sm">Vai trò: <span className="capitalize">{userRole === 'student' ? 'Sinh viên' : userRole === 'tutor' ? 'Tutor' : userRole === 'coordinator' ? 'Điều phối viên' : 'Quản trị viên'}</span></p>
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

      {/* Main Content */}
      <main className="flex-1 overflow-auto pl-64 min-h-screen bg-gray-50">
        {currentPage === 'calendar' && <SessionCalendar userRole={userRole} />}
        {currentPage === 'profile' && <TutorProfile userRole={userRole} />}
        {currentPage === 'register' && <StudentRegistration />}
        {currentPage === 'matching' && <TutorMatching />}
        {currentPage === 'record' && <SessionRecord />}
        {currentPage === 'feedback' && <Feedback userRole={userRole} />}
        {currentPage === 'reports' && <Reports />}
        {currentPage === 'library' && <Library />}
        {currentPage === 'community' && <Community />}
      </main>
    </div>
  );
}
