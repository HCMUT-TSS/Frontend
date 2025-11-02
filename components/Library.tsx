import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, BookOpen, Download, Share2, FileText, Video, Archive } from 'lucide-react';
import { toast } from 'sonner';

export default function Library() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const documents = [
    {
      id: 1,
      title: 'Bài giảng Lập trình C++ Cơ bản',
      author: 'TS. Nguyễn Văn A',
      category: 'Lập trình',
      type: 'pdf',
      size: '2.5 MB',
      downloads: 324,
      date: '15/10/2025',
    },
    {
      id: 2,
      title: 'Video hướng dẫn Cấu trúc dữ liệu',
      author: 'TS. Trần Thị B',
      category: 'Lập trình',
      type: 'video',
      size: '45 MB',
      downloads: 256,
      date: '18/10/2025',
    },
    {
      id: 3,
      title: 'Tài liệu Giải tích 1',
      author: 'PGS. Lê Văn C',
      category: 'Toán',
      type: 'pdf',
      size: '3.8 MB',
      downloads: 412,
      date: '12/10/2025',
    },
    {
      id: 4,
      title: 'Bài tập Vật lý đại cương',
      author: 'TS. Phạm Thị D',
      category: 'Vật lý',
      type: 'pdf',
      size: '1.9 MB',
      downloads: 189,
      date: '20/10/2025',
    },
    {
      id: 5,
      title: 'Slide bài giảng Mạch điện',
      author: 'TS. Hoàng Văn E',
      category: 'Điện tử',
      type: 'pptx',
      size: '5.2 MB',
      downloads: 203,
      date: '22/10/2025',
    },
    {
      id: 6,
      title: 'Đề thi và đáp án Hóa học',
      author: 'TS. Võ Thị F',
      category: 'Hóa học',
      type: 'zip',
      size: '8.7 MB',
      downloads: 167,
      date: '25/10/2025',
    },
  ];

  const categories = [
    { value: 'all', label: 'Tất cả', count: documents.length },
    { value: 'programming', label: 'Lập trình', count: 2 },
    { value: 'math', label: 'Toán', count: 1 },
    { value: 'physics', label: 'Vật lý', count: 1 },
    { value: 'electronics', label: 'Điện tử', count: 1 },
    { value: 'chemistry', label: 'Hóa học', count: 1 },
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-5 h-5" />;
      case 'zip':
        return <Archive className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const handleDownload = (doc: any) => {
    toast.success(`Đang tải xuống: ${doc.title}`);
  };

  const handleShare = (doc: any) => {
    toast.success('Đã sao chép liên kết chia sẻ!');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Thư viện HCMUT</CardTitle>
          <CardDescription>
            Truy cập tài liệu học tập từ HCMUT_LIBRARY
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm sách, bài giảng, tài liệu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label} ({cat.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline">
              <BookOpen className="w-4 h-4 mr-2" />
              Tải lên
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Popular Categories */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <Button
            key={cat.value}
            variant={categoryFilter === cat.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategoryFilter(cat.value)}
            className={categoryFilter === cat.value ? 'bg-[#0B5FA5]' : ''}
          >
            {cat.label}
            <Badge variant="secondary" className="ml-2">
              {cat.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <Card key={doc.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-[#0B5FA5]/10 rounded-lg flex items-center justify-center text-[#0B5FA5]">
                  {getFileIcon(doc.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="line-clamp-2 mb-1">{doc.title}</h4>
                  <p className="text-sm text-gray-500">{doc.author}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary" className="text-xs">
                  {doc.category}
                </Badge>
                <span className="text-xs text-gray-500">{doc.size}</span>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>{doc.date}</span>
                <span className="flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  {doc.downloads}
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 bg-[#0B5FA5] hover:bg-[#094A7F]"
                  onClick={() => handleDownload(doc)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Tải xuống
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleShare(doc)}
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Uploads */}
      <Card>
        <CardHeader>
          <CardTitle>Tài liệu mới nhất</CardTitle>
          <CardDescription>
            Các tài liệu được cập nhật gần đây
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {documents.slice(0, 4).map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 bg-[#0B5FA5]/10 rounded flex items-center justify-center text-[#0B5FA5]">
                    {getFileIcon(doc.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm truncate">{doc.title}</h4>
                    <p className="text-xs text-gray-500">
                      {doc.author} • {doc.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {doc.category}
                  </Badge>
                  <Button size="sm" variant="ghost">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl mb-2">1,234</div>
              <p className="text-sm text-gray-500">Tổng tài liệu</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl mb-2">8,456</div>
              <p className="text-sm text-gray-500">Lượt tải xuống</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl mb-2">45</div>
              <p className="text-sm text-gray-500">Tài liệu mới (tháng này)</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
