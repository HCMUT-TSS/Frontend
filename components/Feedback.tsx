import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Star, ThumbsUp, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface FeedbackProps {
  userRole: string;
}

export default function Feedback({ userRole }: FeedbackProps) {
  const [ratings, setRatings] = useState({
    effectiveness: 0,
    support: 0,
    communication: 0,
    overall: 0,
  });
  const [comment, setComment] = useState('');

  const handleRating = (category: keyof typeof ratings, value: number) => {
    setRatings({ ...ratings, [category]: value });
  };

  const handleSubmit = () => {
    toast.success('Cảm ơn bạn đã gửi đánh giá!');
    setRatings({ effectiveness: 0, support: 0, communication: 0, overall: 0 });
    setComment('');
  };

  const ratingCategories = [
    { key: 'effectiveness' as const, label: 'Hiệu quả tư vấn', icon: ThumbsUp },
    { key: 'support' as const, label: 'Sự hỗ trợ', icon: MessageSquare },
    { key: 'communication' as const, label: 'Kỹ năng giao tiếp', icon: Star },
    { key: 'overall' as const, label: 'Đánh giá chung', icon: Star },
  ];

  const previousFeedback = [
    {
      date: '25/10/2025',
      session: 'Lập trình C++ - Con trỏ',
      tutor: 'Phạm Văn D',
      rating: 5,
      comment: 'Tutor giải thích rất dễ hiểu, nhiệt tình hỗ trợ.',
    },
    {
      date: '20/10/2025',
      session: 'Cấu trúc dữ liệu - Cây',
      tutor: 'Hoàng Thị E',
      rating: 4,
      comment: 'Buổi học bổ ích, cần thêm ví dụ thực tế.',
    },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Rate Session */}
      {userRole === 'student' && (
        <Card>
          <CardHeader>
            <CardTitle>Đánh giá buổi tư vấn</CardTitle>
            <CardDescription>
              Chia sẻ trải nghiệm của bạn để giúp cải thiện chất lượng dịch vụ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Session Selection */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="mb-1">Lập trình C++ - Con trỏ và mảng động</h4>
              <p className="text-sm text-gray-500">
                Tutor: Phạm Văn D • 01/11/2025 • 14:00 - 15:30
              </p>
            </div>

            {/* Rating Categories */}
            <div className="space-y-4">
              {ratingCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <div key={category.key} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-gray-500" />
                      <Label>{category.label}</Label>
                    </div>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRating(category.key, star)}
                          className="focus:outline-none transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= ratings[category.key]
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-gray-500 self-center">
                        {ratings[category.key] > 0 ? `${ratings[category.key]}/5` : 'Chưa đánh giá'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <Label htmlFor="comment">Nhận xét chi tiết</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Chia sẻ thêm về trải nghiệm của bạn..."
                rows={4}
              />
            </div>

            <Button
              onClick={handleSubmit}
              className="bg-[#0B5FA5] hover:bg-[#094A7F]"
            >
              Gửi đánh giá
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tutor View - Received Feedback */}
      {userRole === 'tutor' && (
        <Card>
          <CardHeader>
            <CardTitle>Phản hồi từ sinh viên</CardTitle>
            <CardDescription>
              Xem các đánh giá và nhận xét từ sinh viên
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-2xl">4.8</span>
                </div>
                <p className="text-sm text-gray-500">Đánh giá chung</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2">4.7</div>
                <p className="text-sm text-gray-500">Hiệu quả</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2">4.9</div>
                <p className="text-sm text-gray-500">Hỗ trợ</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2">4.8</div>
                <p className="text-sm text-gray-500">Giao tiếp</p>
              </div>
            </div>

            {/* Feedback List */}
            <div className="space-y-4">
              {previousFeedback.map((item, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4>{item.session}</h4>
                      <p className="text-sm text-gray-500">{item.date}</p>
                    </div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < item.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{item.comment}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feedback History */}
      {userRole === 'student' && (
        <Card>
          <CardHeader>
            <CardTitle>Lịch sử đánh giá</CardTitle>
            <CardDescription>
              Các đánh giá bạn đã gửi trước đó
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {previousFeedback.map((item, index) => (
                <div key={index} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4>{item.session}</h4>
                      <p className="text-sm text-gray-500">
                        Tutor: {item.tutor} • {item.date}
                      </p>
                    </div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < item.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{item.comment}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="text-sm">
      {children}
    </label>
  );
}
