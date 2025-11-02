import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PieLabelRenderProps } from "recharts";
import { Download, TrendingUp, Users, Calendar, Star } from 'lucide-react';

export default function Reports() {
  const [timeFilter, setTimeFilter] = useState('month');
  const [facultyFilter, setFacultyFilter] = useState('all');

  // Data for charts
  const participationData = [
    { month: 'T7', students: 45, sessions: 120 },
    { month: 'T8', students: 52, sessions: 145 },
    { month: 'T9', students: 68, sessions: 178 },
    { month: 'T10', students: 75, sessions: 195 },
    { month: 'T11', students: 82, sessions: 210 },
  ];

  const progressData = [
    { subject: 'Toán', progress: 78 },
    { subject: 'Lập trình', progress: 85 },
    { subject: 'Vật lý', progress: 72 },
    { subject: 'Hóa học', progress: 68 },
    { subject: 'Tiếng Anh', progress: 80 },
  ];

  const facultyDistribution = [
    { name: 'CSE', value: 35, color: '#0B5FA5' },
    { name: 'EE', value: 25, color: '#3B82F6' },
    { name: 'ME', value: 20, color: '#60A5FA' },
    { name: 'CE', value: 12, color: '#93C5FD' },
    { name: 'CHE', value: 8, color: '#DBEAFE' },
  ];

  const tutorPerformance = [
    { name: 'Phạm Văn D', sessions: 28, rating: 4.8, students: 15 },
    { name: 'Hoàng Thị E', sessions: 25, rating: 4.9, students: 13 },
    { name: 'Võ Văn F', sessions: 22, rating: 4.7, students: 12 },
    { name: 'Trần Thị G', sessions: 20, rating: 4.6, students: 11 },
    { name: 'Nguyễn Văn H', sessions: 18, rating: 4.8, students: 10 },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl mb-2">Báo cáo & Phân tích</h1>
          <p className="text-gray-500">
            Thống kê và phân tích hiệu quả chương trình hỗ trợ tutor
          </p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Xuất báo cáo
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn thời gian" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Tuần này</SelectItem>
                  <SelectItem value="month">Tháng này</SelectItem>
                  <SelectItem value="quarter">Quý này</SelectItem>
                  <SelectItem value="year">Năm này</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select value={facultyFilter} onValueChange={setFacultyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn khoa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả khoa</SelectItem>
                  <SelectItem value="CSE">Khoa KHMT</SelectItem>
                  <SelectItem value="EE">Khoa Điện - Điện tử</SelectItem>
                  <SelectItem value="ME">Khoa Cơ khí</SelectItem>
                  <SelectItem value="CE">Khoa Xây dựng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Tổng sinh viên</p>
                <p className="text-2xl">1,248</p>
                <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +12% so với tháng trước
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-[#0B5FA5]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Buổi tư vấn</p>
                <p className="text-2xl">3,456</p>
                <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +8% so với tháng trước
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Đánh giá TB</p>
                <p className="text-2xl">4.7/5.0</p>
                <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +0.3 điểm
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Tutor hoạt động</p>
                <p className="text-2xl">45</p>
                <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +5 tutor mới
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tỷ lệ tham gia theo tháng</CardTitle>
            <CardDescription>
              Số lượng sinh viên và buổi tư vấn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={participationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="students" fill="#0B5FA5" name="Sinh viên" />
                <Bar dataKey="sessions" fill="#60A5FA" name="Buổi tư vấn" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Phân bổ theo khoa</CardTitle>
            <CardDescription>
              Tỷ lệ sinh viên tham gia theo khoa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={facultyDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  //label={({ name, percent })  => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {facultyDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tiến độ học tập theo môn</CardTitle>
            <CardDescription>
              Mức độ cải thiện trung bình của sinh viên
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="progress"
                  stroke="#0B5FA5"
                  strokeWidth={2}
                  name="Tiến độ (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hiệu suất Tutor</CardTitle>
            <CardDescription>
              Top 5 tutor có hiệu suất cao nhất
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tutorPerformance.map((tutor, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#0B5FA5] text-white flex items-center justify-center text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4>{tutor.name}</h4>
                    <p className="text-sm text-gray-500">
                      {tutor.sessions} buổi • {tutor.students} sinh viên
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{tutor.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Tóm tắt báo cáo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="mb-2">Điểm nổi bật</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Tỷ lệ tham gia tăng 12% so với tháng trước</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Đánh giá trung bình tăng 0.3 điểm lên 4.7/5.0</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Tiến độ học tập của sinh viên cải thiện trung bình 15%</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2">Khuyến nghị</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">→</span>
                  <span>Tăng cường số lượng tutor cho khoa CSE do nhu cầu cao</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">→</span>
                  <span>Tổ chức training cho tutor về kỹ năng giao tiếp</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">→</span>
                  <span>Mở rộng thêm môn học: AI, Machine Learning</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
