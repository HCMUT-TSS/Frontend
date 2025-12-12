import { useState, useEffect } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import axios from 'axios';
import { toast } from 'sonner';

import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  ChevronLeft, MessageCircle, Video, MapPin, Users, 
  Send, Clock, MessageSquare, MoreHorizontal, PenSquare 
} from 'lucide-react';

// --- CONFIG API ---
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
});

// --- TYPE DEFINITIONS (Khớp với Prisma Schema & Controller) ---
interface UserSimple {
  name: string;
}

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  author: UserSimple;
}

interface Post {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  author: UserSimple;
  comments: Comment[];
  _count?: { comments: number };
}

interface ClassSession {
  id: number;
  title: string;
  tutorName: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  location?: string;
  meetLink?: string;
}

const dayNames = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

export default function Community() {
  // --- STATE QUẢN LÝ ---
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassSession | null>(null);
  const [loading, setLoading] = useState(true);

  // State phòng thảo luận
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  
  // State form đăng bài
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // State form bình luận (Object lưu text theo ID bài viết)
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [submittingComment, setSubmittingComment] = useState<number | null>(null);

  // 1. LOAD DANH SÁCH LỚP HỌC (Khi vào trang)
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        // Gọi API lấy danh sách session đang active
        const res = await api.get('/api/community/sessions'); 
        setClasses(res.data.classes || []);
      } catch (err) {
        console.error("Lỗi tải lớp:", err);
        // Không toast lỗi ở đây để tránh spam nếu mạng lag, chỉ log
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  // 2. LOAD BÀI VIẾT (Khi chọn một lớp)
  useEffect(() => {
    if (!selectedClass) return;
    
    const fetchPosts = async () => {
      setLoadingPosts(true);
      try {
        const res = await api.get(`/api/community/posts/${selectedClass.id}`);
        setPosts(res.data.posts || []);
      } catch (err) {
        toast.error('Không tải được bài thảo luận');
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchPosts();
    // Reset form
    setPostTitle('');
    setPostContent('');
    setCommentInputs({});
  }, [selectedClass]);

  // --- ACTION: ĐĂNG BÀI VIẾT ---
  const handleCreatePost = async () => {
    if (!postTitle.trim() || !postContent.trim() || !selectedClass) {
      toast.warning("Vui lòng nhập tiêu đề và nội dung");
      return;
    }

    setIsPosting(true);
    try {
      await api.post('/api/community/posts', {
        sessionId: selectedClass.id,
        title: postTitle,
        content: postContent
      });

      // Reload danh sách để cập nhật bài mới nhất
      const reload = await api.get(`/api/community/posts/${selectedClass.id}`);
      setPosts(reload.data.posts);

      toast.success('Đã đăng bài thảo luận!');
      setPostTitle('');
      setPostContent('');
    } catch (err) {
      toast.error('Lỗi khi đăng bài. Thử lại sau.');
    } finally {
      setIsPosting(false);
    }
  };

  // --- ACTION: GỬI BÌNH LUẬN ---
  const handleCreateComment = async (postId: number) => {
    const content = commentInputs[postId];
    if (!content?.trim()) return;

    setSubmittingComment(postId); // Loading state cho nút gửi cụ thể
    try {
      await api.post('/api/community/comments', {
        postId,
        content
      });

      // Cập nhật UI: Reload lại danh sách bài viết để thấy comment mới
      // (Cách này an toàn nhất để đồng bộ dữ liệu server)
      const reload = await api.get(`/api/community/posts/${selectedClass?.id}`);
      setPosts(reload.data.posts);

      // Xóa input
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      toast.success('Đã bình luận');
    } catch (err) {
      toast.error('Không thể gửi bình luận');
    } finally {
      setSubmittingComment(null);
    }
  };

  // --- UI: MÀN HÌNH DANH SÁCH LỚP HỌC ---
  if (!selectedClass) {
    return (
      <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen animate-in fade-in duration-500">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#0B5FA5] mb-4">
            CỘNG ĐỒNG HỌC TẬP
          </h1>
          <p className="text-gray-500 text-lg">Tham gia thảo luận, hỏi đáp cùng Tutor và các bạn cùng lớp</p>
        </div>

        {loading ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
             {[1,2,3].map(i => (
               <div key={i} className="h-64 bg-gray-100 rounded-3xl animate-pulse"></div>
             ))}
          </div>
        ) : classes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
            <Users className="w-32 h-32 mx-auto mb-6 text-gray-300" />
            <p className="text-2xl font-bold text-gray-500">Chưa có lớp học nào</p>
            <p className="text-gray-400 mt-2">Khi Tutor tạo lịch dạy, lớp sẽ hiện ở đây.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {classes.map((cls) => {
              const isOnline = cls.meetLink || cls.location?.toLowerCase().includes('meet');
              return (
                <Card
                  key={cls.id}
                  className="group cursor-pointer overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border-0 hover:-translate-y-2 bg-white"
                  onClick={() => setSelectedClass(cls)}
                >
                  <div className="bg-gradient-to-br from-[#0B5FA5] to-blue-600 p-6 text-white text-center relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <MessageCircle className="w-24 h-24" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2 line-clamp-2 relative z-10">
                      {cls.title}
                    </h3>
                    <div className="flex items-center justify-center gap-2 mt-4 relative z-10">
                      <Avatar className="w-10 h-10 border-2 border-white/50">
                        <AvatarFallback className="bg-white/20 text-white font-bold">
                          {cls.tutorName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="font-semibold text-sm leading-tight">{cls.tutorName}</p>
                        <p className="text-[10px] opacity-80 uppercase tracking-wider">Tutor</p>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-center text-sm font-medium text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <span className="flex items-center"><Clock className="w-4 h-4 mr-2 text-[#0B5FA5]" /> {dayNames[cls.dayOfWeek]}</span>
                      <span>{cls.startTime} - {cls.endTime}</span>
                    </div>

                    <div className="flex items-center justify-center">
                      {isOnline ? (
                        <span className="flex items-center text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full text-sm font-bold">
                          <Video className="w-4 h-4 mr-2" /> ONLINE
                        </span>
                      ) : (
                        <span className="flex items-center text-red-600 bg-red-50 px-4 py-1.5 rounded-full text-sm font-bold">
                          <MapPin className="w-4 h-4 mr-2" /> OFFLINE
                        </span>
                      )}
                    </div>

                    <Button className="w-full bg-[#0B5FA5] hover:bg-[#094a85] text-white font-bold py-6 rounded-xl shadow-md mt-2 transition-all group-hover:bg-blue-700">
                      Tham gia thảo luận
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // --- UI: MÀN HÌNH CHI TIẾT (PHÒNG THẢO LUẬN) ---
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50 animate-in slide-in-from-right duration-300">
      {/* HEADER LỚP HỌC */}
      <div className="bg-white border-b sticky top-0 z-20 px-4 md:px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedClass(null)}
            className="hover:bg-gray-100 rounded-full h-10 w-10"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </Button>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#0B5FA5] line-clamp-1">{selectedClass.title}</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">Tutor {selectedClass.tutorName}</span>
              <span>• {dayNames[selectedClass.dayOfWeek]} • {selectedClass.startTime}</span>
            </div>
          </div>
        </div>
        <div className="hidden md:flex gap-2">
           <Button variant="outline" className="text-gray-600 border-gray-200 hover:bg-gray-50">
             <Users className="w-4 h-4 mr-2" /> Thành viên
           </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row max-w-7xl mx-auto w-full">
        
        {/* CỘT TRÁI: DANH SÁCH BÀI VIẾT (Main Content) */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
          
          {/* Box đăng bài */}
          <Card className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden ring-1 ring-gray-100">
             <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2 text-gray-700 font-semibold">
               <PenSquare className="w-5 h-5" /> Tạo bài thảo luận mới
             </div>
             <CardContent className="p-4 space-y-4">
               <div className="flex gap-4">
                 <Avatar className="mt-1">
                   <AvatarFallback className="bg-[#0B5FA5] text-white font-bold">Tôi</AvatarFallback>
                 </Avatar>
                 <div className="flex-1 space-y-3">
                   <input
                     className="w-full font-bold text-lg border-b border-transparent focus:border-[#0B5FA5] outline-none placeholder-gray-400 pb-1 transition-all"
                     placeholder="Tiêu đề bài viết..."
                     value={postTitle}
                     onChange={(e) => setPostTitle(e.target.value)}
                   />
                   <textarea
                     className="w-full resize-none border-none outline-none text-gray-600 placeholder-gray-400 min-h-[80px] bg-transparent"
                     placeholder="Bạn muốn trao đổi gì với lớp hôm nay?"
                     value={postContent}
                     onChange={(e) => setPostContent(e.target.value)}
                   />
                 </div>
               </div>
               <div className="flex justify-end pt-2">
                 <Button 
                   onClick={handleCreatePost} 
                   disabled={isPosting || !postTitle || !postContent}
                   className={`${isPosting ? 'opacity-70' : ''} bg-[#0B5FA5] hover:bg-[#094a85] rounded-xl px-6`}
                 >
                   {isPosting ? 'Đang đăng...' : 'Đăng bài'} <Send className="w-4 h-4 ml-2" />
                 </Button>
               </div>
             </CardContent>
          </Card>

          {/* Loading Skeleton */}
          {loadingPosts && (
             <div className="space-y-4">
               {[1,2].map(i => (
                 <div key={i} className="h-48 bg-white rounded-2xl animate-pulse shadow-sm"></div>
               ))}
             </div>
          )}

          {/* Empty State */}
          {!loadingPosts && posts.length === 0 && (
            <div className="text-center py-16 opacity-60">
              <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-600">Chưa có bài viết nào.</p>
              <p className="text-sm">Hãy là người đầu tiên đặt câu hỏi!</p>
            </div>
          )}

          {/* Danh sách bài viết */}
          {posts.map((post) => (
            <Card key={post.id} className="border-0 shadow-sm hover:shadow-md transition-all bg-white rounded-2xl overflow-hidden ring-1 ring-gray-100">
              <div className="p-5">
                {/* Header bài viết */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border border-gray-100">
                      <AvatarFallback className="bg-gradient-to-tr from-blue-500 to-cyan-500 text-white font-semibold">
                        {post.author.name ? post.author.name.charAt(0) : '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-gray-900 text-sm md:text-base">{post.author.name || 'Người dùng ẩn danh'}</p>
                      <p className="text-xs text-gray-500 flex items-center">
                        {formatDistanceToNow(parseISO(post.createdAt), { addSuffix: true, locale: vi })}
                      </p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>

                {/* Nội dung */}
                <h3 className="text-lg md:text-xl font-bold text-[#0B5FA5] mb-2">{post.title}</h3>
                <p className="text-gray-700 whitespace-pre-line mb-6 leading-relaxed text-sm md:text-base">
                  {post.content}
                </p>

                {/* Khu vực bình luận */}
                <div className="bg-gray-50 rounded-xl p-4">
                  {/* Danh sách comment */}
                  {post.comments && post.comments.length > 0 && (
                    <div className="space-y-4 mb-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {post.comments.map((cmt) => (
                        <div key={cmt.id} className="flex gap-3 text-sm">
                          <Avatar className="w-8 h-8 mt-1 border border-white shadow-sm">
                            <AvatarFallback className="text-xs bg-gray-200 text-gray-600 font-bold">
                              {cmt.author.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 inline-block min-w-[150px]">
                              <div className="flex justify-between items-baseline mb-1 gap-4">
                                <span className="font-bold text-gray-800 text-xs">{cmt.author.name}</span>
                                <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                  {formatDistanceToNow(parseISO(cmt.createdAt), { locale: vi })}
                                </span>
                              </div>
                              <p className="text-gray-700">{cmt.content}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Input comment */}
                  <div className="flex gap-3 items-center mt-2">
                    <Avatar className="w-8 h-8 hidden md:block">
                      <AvatarFallback className="bg-gray-200 text-gray-500 text-xs">Tôi</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 relative">
                      <input
                        className="w-full bg-white border border-gray-200 rounded-full py-2.5 pl-4 pr-10 text-sm focus:outline-none focus:border-[#0B5FA5] focus:ring-1 focus:ring-[#0B5FA5] transition-all shadow-sm"
                        placeholder="Viết bình luận..."
                        value={commentInputs[post.id] || ''}
                        onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !submittingComment) handleCreateComment(post.id);
                        }}
                        disabled={submittingComment === post.id}
                      />
                      <button 
                        onClick={() => handleCreateComment(post.id)}
                        disabled={submittingComment === post.id || !commentInputs[post.id]}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#0B5FA5] hover:bg-blue-50 p-1.5 rounded-full transition-colors disabled:opacity-50"
                      >
                        {submittingComment === post.id ? (
                           <span className="block w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                           <Send className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          
          <div className="h-4"></div> {/* Spacer bottom */}
        </div>

        {/* CỘT PHẢI: THÔNG TIN LỚP (Chỉ hiện trên Desktop) */}
        <div className="hidden lg:block w-80 bg-white border-l p-6 space-y-6 h-full overflow-y-auto">
           <div className="sticky top-0">
             <h3 className="font-bold text-gray-900 mb-4 flex items-center text-lg">
               <Users className="w-5 h-5 mr-2 text-[#0B5FA5]" /> Thông tin lớp
             </h3>
             <div className="space-y-4 text-sm text-gray-600 bg-gray-50 p-5 rounded-2xl border border-gray-100 shadow-sm">
               <div>
                 <p className="text-xs text-gray-400 uppercase font-bold mb-1">Môn học</p>
                 <p className="font-semibold text-gray-800 text-base">{selectedClass.title}</p>
               </div>
               <div>
                 <p className="text-xs text-gray-400 uppercase font-bold mb-1">Giảng viên</p>
                 <div className="flex items-center gap-2">
                   <Avatar className="w-6 h-6">
                     <AvatarFallback className="text-[10px] bg-[#0B5FA5] text-white">
                       {selectedClass.tutorName.charAt(0)}
                     </AvatarFallback>
                   </Avatar>
                   <p className="font-semibold text-gray-800">{selectedClass.tutorName}</p>
                 </div>
               </div>
               <div>
                 <p className="text-xs text-gray-400 uppercase font-bold mb-1">Lịch học</p>
                 <p className="font-medium">{dayNames[selectedClass.dayOfWeek]}</p>
                 <p className="font-medium">{selectedClass.startTime} - {selectedClass.endTime}</p>
               </div>
               
               <div className="pt-3 border-t border-gray-200 mt-2">
                 <p className="text-xs text-gray-400 uppercase font-bold mb-2">Địa điểm</p>
                 {selectedClass.meetLink || (selectedClass.location && selectedClass.location.includes('http')) ? (
                   <a 
                     href={selectedClass.meetLink || selectedClass.location} 
                     target="_blank" 
                     rel="noreferrer"
                     className="bg-blue-100 text-blue-700 hover:bg-blue-200 flex items-center justify-center font-bold py-2 rounded-lg transition-colors"
                   >
                     <Video className="w-4 h-4 mr-2" /> Vào lớp Online
                   </a>
                 ) : (
                   <span className="bg-gray-200 text-gray-700 flex items-center justify-center font-medium py-2 rounded-lg">
                     <MapPin className="w-4 h-4 mr-2" /> {selectedClass.location || 'Chưa cập nhật'}
                   </span>
                 )}
               </div>
             </div>
             
             <div className="mt-6 p-4 rounded-2xl border border-dashed border-gray-300 text-center bg-gray-50/50">
               <p className="text-sm text-gray-500">Tài liệu lớp học sẽ sớm được cập nhật tại đây.</p>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}