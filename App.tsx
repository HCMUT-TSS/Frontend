import { useState } from 'react';
import {
  Calendar, User, BookOpen, MessageSquare, FileText,
  BarChart3, Users, LogOut
} from 'lucide-react';

import LoginPage from './components/LoginPage';
import SessionCalendar from './components/SessionCalendar';
import ProfilePage from './components/ProfilePage';        // ← Đảm bảo tên đúng
import TutorMatching from './components/TutorMatching';
import SessionRecord from './components/SessionRecord';
import Feedback from './components/Feedback';
import Reports from './components/Reports';
import Library from './components/Library';
import Community from './components/Community';

import { Button } from './components/ui/button';

type Role = 'student' | 'tutor' | 'admin';

export default function App() {
  // ← TẤT CẢ useState PHẢI NẰM TRONG ĐÂY!
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<Role>('student');
  const [userEmail, setUserEmail] = useState<string>('');        // ← Bắt đầu rỗng
  const [currentPage, setCurrentPage] = useState<string>('calendar');

  // Nhận cả email từ LoginPage
  const handleLogin = (role: Role, email: string) => {
    setUserRole(role);
    setUserEmail(email);           // ← Lưu email thật
    setIsLoggedIn(true);
    setCurrentPage('calendar');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole('student');
    setUserEmail('');
    setCurrentPage('calendar');
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Menu...
  const baseNav = [
    { id: 'calendar', label: 'Lịch tư vấn', icon: Calendar },
    { id: 'profile', label: 'Hồ sơ', icon: User },
    { id: 'library', label: 'Thư viện', icon: BookOpen },
    { id: 'community', label: 'Cộng đồng', icon: MessageSquare },
    { id: 'feedback', label: 'Đánh giá', icon: FileText },
  ];

  const navItems = [...baseNav];
  if (userRole === 'admin') {
    navItems.splice(1, 0, { id: 'matching', label: 'Ghép đôi', icon: Users });
    navItems.push({ id: 'reports', label: 'Báo cáo', icon: BarChart3 });
  }
  if (userRole === 'tutor') {
    navItems.splice(3, 0, { id: 'record', label: 'Ghi nhận buổi học', icon: FileText });
  }

  const roleDisplay = {
    student: 'Sinh viên',
    tutor: 'Gia sư',
    admin: 'Quản trị viên',
  }[userRole];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0B5FA5] text-white flex flex-col fixed inset-y-0 z-10">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <img src="https://upload.wikimedia.org/wikipedia/commons/d/de/HCMUT_official_logo.png" alt="HCMUT" className="w-9 h-9" />
            </div>
            <div>
              <h1 className="text-xl font-bold">HCMUT Tutor</h1>
              <p className="text-xs opacity-80">Hỗ trợ học tập BK</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  currentPage === item.id
                    ? 'bg-white text-[#0B5FA5] font-medium shadow-md'
                    : 'hover:bg-white/10'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="p-3 bg-white/10 rounded-lg text-sm">
            <p className="opacity-80">Đã đăng nhập:</p>
            <p className="font-semibold truncate">{userEmail}</p>
            <p className="text-xs opacity-80">Vai trò: {roleDisplay}</p>
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
      <main className="flex-1 pl-64 min-h-screen bg-gray-50">
        <div className="p-6">
          {currentPage === 'calendar' && <SessionCalendar userRole={userRole} />}
          
          {currentPage === 'profile' && (
            <ProfilePage 
              userRole={userRole} 
              userEmail={userEmail}     // ← ĐÃ TRUYỀN ĐÚNG!
            />
          )}
          
          {currentPage === 'matching' && userRole === 'admin' && <TutorMatching />}
          {currentPage === 'record' && userRole === 'tutor' && <SessionRecord />}
          {currentPage === 'feedback' && <Feedback userRole={userRole} />}
          {currentPage === 'reports' && userRole === 'admin' && <Reports />}
          {currentPage === 'library' && <Library />}
          {currentPage === 'community' && <Community />}
        </div>
      </main>
    </div>
  );
}