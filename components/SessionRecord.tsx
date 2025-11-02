import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Upload, Save, Share2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SessionRecord() {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    student: '',
    topic: '',
    content: '',
    progress: [50],
    notes: '',
    nextSteps: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Đã lưu ghi nhận buổi tư vấn!');
  };

  const handleShare = () => {
    toast.success('Đã chia sẻ với sinh viên!');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Ghi nhận buổi tư vấn</CardTitle>
          <CardDescription>
            Ghi lại thông tin và tiến độ của buổi tư vấn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Session Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Ngày tư vấn *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Thời gian *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="student">Sinh viên *</Label>
                <Select
                  value={formData.student}
                  onValueChange={(value) => setFormData({ ...formData, student: value })}
                >
                  <SelectTrigger id="student">
                    <SelectValue placeholder="Chọn sinh viên" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="S2012345">Nguyễn Văn A - S2012345</SelectItem>
                    <SelectItem value="S2012346">Trần Thị B - S2012346</SelectItem>
                    <SelectItem value="S2012347">Lê Văn C - S2012347</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Topic */}
            <div className="space-y-2">
              <Label htmlFor="topic">Chủ đề tư vấn *</Label>
              <Input
                id="topic"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="Ví dụ: Lập trình C++ - Con trỏ và mảng động"
                required
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Nội dung buổi tư vấn *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Mô tả chi tiết nội dung đã tư vấn..."
                rows={4}
                required
              />
            </div>

            {/* Progress */}
            <div className="space-y-4">
              <Label htmlFor="progress">Tiến độ học tập của sinh viên</Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="progress"
                  value={formData.progress}
                  onValueChange={(value) => setFormData({ ...formData, progress: value })}
                  max={100}
                  step={5}
                  className="flex-1"
                />
                <div className="w-16 text-center p-2 border rounded">
                  {formData.progress[0]}%
                </div>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Chưa hiểu</span>
                <span>Hiểu cơ bản</span>
                <span>Thành thạo</span>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Nhận xét và đánh giá</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Ghi chú về thái độ học tập, điểm mạnh, điểm cần cải thiện..."
                rows={4}
              />
            </div>

            {/* Next Steps */}
            <div className="space-y-2">
              <Label htmlFor="nextSteps">Kế hoạch tiếp theo</Label>
              <Textarea
                id="nextSteps"
                value={formData.nextSteps}
                onChange={(e) => setFormData({ ...formData, nextSteps: e.target.value })}
                placeholder="Các bước học tập tiếp theo, bài tập được giao..."
                rows={3}
              />
            </div>

            {/* Documents */}
            <div className="space-y-2">
              <Label>Tài liệu đính kèm</Label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500 mb-1">
                  Kéo thả file hoặc click để tải lên
                </p>
                <p className="text-xs text-gray-400">
                  PDF, DOC, PPT (tối đa 10MB)
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t">
              <Button type="submit" className="bg-[#0B5FA5] hover:bg-[#094A7F]">
                <Save className="w-4 h-4 mr-2" />
                Lưu ghi nhận
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Chia sẻ với sinh viên
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Recent Records */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Ghi nhận gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { date: '25/10/2025', student: 'Nguyễn Văn A', topic: 'Lập trình C++', progress: 75 },
              { date: '20/10/2025', student: 'Trần Thị B', topic: 'Cấu trúc dữ liệu', progress: 60 },
              { date: '18/10/2025', student: 'Lê Văn C', topic: 'Giải tích', progress: 85 },
            ].map((record, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex-1">
                  <h4>{record.topic}</h4>
                  <p className="text-sm text-gray-500">
                    {record.student} • {record.date}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Tiến độ</p>
                    <p className="text-[#0B5FA5]">{record.progress}%</p>
                  </div>
                  <div className="w-16 h-16">
                    <svg className="transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#0B5FA5"
                        strokeWidth="3"
                        strokeDasharray={`${record.progress}, 100`}
                      />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
