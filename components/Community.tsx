import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { MessageSquare, ThumbsUp, MessageCircle, Calendar, Pin, Plus, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function Community() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);

  const posts = [
    {
      id: 1,
      author: 'Nguyễn Văn A',
      avatar: 'NVA',
      role: 'Sinh viên',
      time: '2 giờ trước',
      category: 'Học thuật',
      title: 'Cách tối ưu hóa thuật toán sắp xếp',
      content: 'Mình đang gặp khó khăn với việc tối ưu hóa thuật toán sắp xếp trong bài tập lớn. Các bạn có thể chia sẻ kinh nghiệm không?',
      likes: 12,
      comments: 5,
      isPinned: false,
    },
    {
      id: 2,
      author: 'Trần Thị B',
      avatar: 'TTB',
      role: 'Tutor',
      time: '5 giờ trước',
      category: 'Kỹ năng',
      title: 'Tips quản lý thời gian hiệu quả',
      content: 'Chia sẻ một số mẹo quản lý thời gian giúp mình cân bằng việc học và hoạt động ngoại khóa...',
      likes: 28,
      comments: 12,
      isPinned: true,
    },
    {
      id: 3,
      author: 'Lê Văn C',
      avatar: 'LVC',
      role: 'Sinh viên',
      time: '1 ngày trước',
      category: 'Sự kiện',
      title: 'Workshop: Lập trình Python cơ bản',
      content: 'Tuần sau sẽ có workshop về Python cơ bản. Ai quan tâm có thể tham gia nhé!',
      likes: 45,
      comments: 18,
      isPinned: false,
    },
  ];

  const events = [
    {
      title: 'Workshop: Git & GitHub',
      date: '05/11/2025',
      time: '14:00 - 16:00',
      location: 'Phòng H1-302',
      participants: 25,
    },
    {
      title: 'Seminar: Kỹ năng học tập',
      date: '08/11/2025',
      time: '09:00 - 11:00',
      location: 'Hội trường A',
      participants: 50,
    },
  ];

  const handleCreatePost = () => {
    setIsDialogOpen(false);
    toast.success('Đã đăng bài thành công!');
  };

  const handleLike = (postId: number) => {
    toast.success('Đã thích bài viết!');
  };

  const handleComment = (post: any) => {
    setSelectedPost(post);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Cộng đồng Tutor-Mentee</CardTitle>
                  <CardDescription>
                    Diễn đàn trao đổi và chia sẻ kiến thức
                  </CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#0B5FA5] hover:bg-[#094A7F]">
                      <Plus className="w-4 h-4 mr-2" />
                      Tạo bài viết
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Tạo bài viết mới</DialogTitle>
                      <DialogDescription>
                        Chia sẻ câu hỏi, kiến thức hoặc thông báo với cộng đồng
                      </DialogDescription>
                    </DialogHeader>
                    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleCreatePost(); }}>
                      <div className="space-y-2">
                        <Label htmlFor="category">Danh mục</Label>
                        <select
                          id="category"
                          className="w-full px-3 py-2 border rounded-md"
                          required
                        >
                          <option value="">Chọn danh mục</option>
                          <option value="academic">Học thuật</option>
                          <option value="skills">Kỹ năng</option>
                          <option value="events">Sự kiện</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="title">Tiêu đề</Label>
                        <Input id="title" placeholder="Nhập tiêu đề..." required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="content">Nội dung</Label>
                        <Textarea
                          id="content"
                          placeholder="Viết nội dung bài đăng..."
                          rows={6}
                          required
                        />
                      </div>
                      <div className="flex gap-4">
                        <Button type="submit" className="flex-1 bg-[#0B5FA5] hover:bg-[#094A7F]">
                          Đăng bài
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Hủy
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="all">Tất cả</TabsTrigger>
                  <TabsTrigger value="academic">Học thuật</TabsTrigger>
                  <TabsTrigger value="skills">Kỹ năng</TabsTrigger>
                  <TabsTrigger value="events">Sự kiện</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                  {posts.map((post) => (
                    <Card key={post.id}>
                      <CardContent className="pt-6">
                        {post.isPinned && (
                          <div className="flex items-center gap-1 text-sm text-[#0B5FA5] mb-2">
                            <Pin className="w-4 h-4" />
                            <span>Đã ghim</span>
                          </div>
                        )}
                        <div className="flex items-start gap-3">
                          <Avatar>
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-[#0B5FA5] text-white">
                              {post.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm">{post.author}</h4>
                              <Badge variant="secondary" className="text-xs">
                                {post.role}
                              </Badge>
                              <span className="text-xs text-gray-500">{post.time}</span>
                            </div>
                            <Badge className="mb-2 text-xs bg-[#0B5FA5]">
                              {post.category}
                            </Badge>
                            <h3 className="mb-2">{post.title}</h3>
                            <p className="text-sm text-gray-600 mb-4">{post.content}</p>
                            <div className="flex items-center gap-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleLike(post.id)}
                              >
                                <ThumbsUp className="w-4 h-4 mr-1" />
                                {post.likes}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleComment(post)}
                              >
                                <MessageCircle className="w-4 h-4 mr-1" />
                                {post.comments}
                              </Button>
                            </div>
                          </div>
                        </div>

                        {selectedPost?.id === post.id && (
                          <div className="mt-4 pt-4 border-t">
                            <div className="space-y-3 mb-4">
                              <div className="flex gap-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback className="bg-gray-300">U</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 bg-gray-50 rounded-lg p-3">
                                  <p className="text-sm mb-1">Phạm Văn D</p>
                                  <p className="text-sm text-gray-600">
                                    Bạn có thể tham khảo thuật toán Quick Sort với độ phức tạp O(n log n)
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Input placeholder="Viết bình luận..." className="flex-1" />
                              <Button size="sm" className="bg-[#0B5FA5]">
                                <Send className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="academic">
                  <p className="text-center text-gray-500 py-8">Chưa có bài viết học thuật</p>
                </TabsContent>
                <TabsContent value="skills">
                  <p className="text-center text-gray-500 py-8">Chưa có bài viết kỹ năng</p>
                </TabsContent>
                <TabsContent value="events">
                  <p className="text-center text-gray-500 py-8">Chưa có sự kiện</p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="w-5 h-5" />
                Sự kiện sắp tới
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {events.map((event, index) => (
                <div key={index} className="p-3 border rounded-lg hover:bg-gray-50">
                  <h4 className="text-sm mb-2">{event.title}</h4>
                  <div className="space-y-1 text-xs text-gray-500">
                    <p>📅 {event.date} • {event.time}</p>
                    <p>📍 {event.location}</p>
                    <p>👥 {event.participants} người tham gia</p>
                  </div>
                  <Button size="sm" className="w-full mt-2 bg-[#0B5FA5]">
                    Đăng ký
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Popular Topics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="w-5 h-5" />
                Chủ đề phổ biến
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {['Lập trình', 'Toán', 'Vật lý', 'Kỹ năng mềm', 'Nghiên cứu', 'Học bổng'].map(
                  (topic) => (
                    <Badge key={topic} variant="outline" className="cursor-pointer hover:bg-gray-100">
                      {topic}
                    </Badge>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Active Users */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thành viên hoạt động</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['Phạm Văn D', 'Hoàng Thị E', 'Võ Văn F', 'Trần Thị G'].map((user) => (
                  <div key={user} className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-[#0B5FA5] text-white text-xs">
                        {user.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{user}</span>
                    <div className="ml-auto w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Community Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quy tắc cộng đồng</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-gray-600">
                <li>• Tôn trọng ý kiến của mọi người</li>
                <li>• Không spam hoặc quảng cáo</li>
                <li>• Chia sẻ kiến thức hữu ích</li>
                <li>• Hỗ trợ lẫn nhau trong học tập</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
