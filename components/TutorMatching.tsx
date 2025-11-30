// src/components/TutorMatching.tsx
import { useState, useMemo } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, UserPlus, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

// Import Mock Data
import { 
  HCMUT_DATABASE, 
  MOCK_TUTORS, 
  MOCK_ONE_ON_ONE_REQUESTS,
  MOCK_STUDENT_BOOKINGS 
} from '../mockHcmut';

export default function TutorMatching() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFaculty, setFilterFaculty] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<number | null>(null);
  const [selectedTutor, setSelectedTutor] = useState<number | null>(null);

  // --- 1. CHUẨN BỊ DỮ LIỆU ---

  // Danh sách sinh viên cần hỗ trợ (Lấy từ các Request đang Pending)
  const studentsNeedingHelp = useMemo(() => {
    return MOCK_ONE_ON_ONE_REQUESTS
      .filter(req => req.status === 'pending')
      .map(req => {
        // Tra cứu thông tin chi tiết từ DB để lấy Khoa
        const profile = Object.values(HCMUT_DATABASE).find(p => p.email.includes(req.studentId) || p.name === req.studentName);
        // Rút gọn tên khoa để hiển thị badge
        const shortFaculty = profile?.faculty?.includes('Máy tính') ? 'CSE' : 
                             profile?.faculty?.includes('Điện') ? 'EE' : 
                             profile?.faculty?.includes('Cơ khí') ? 'ME' : 'Other';
        return {
          requestId: req.id,
          studentId: req.studentId,
          name: req.studentName,
          faculty: shortFaculty,
          subject: req.subject,
          note: req.note
        };
      });
  }, []);

  // Danh sách Tutor (Lấy từ MOCK_TUTORS + tra cứu Khoa từ DB)
  const tutorList = useMemo(() => {
    return MOCK_TUTORS.map(tutor => {
      const profile = Object.values(HCMUT_DATABASE).find(p => p.name === tutor.name);
      const shortFaculty = profile?.faculty?.includes('Máy tính') ? 'CSE' : 
                           profile?.faculty?.includes('Điện') ? 'EE' : 
                           profile?.faculty?.includes('Cơ khí') ? 'ME' : 
                           profile?.faculty?.includes('Hóa') ? 'CHE' : 'Other';
      return {
        ...tutor,
        faculty: shortFaculty,
        // Chuyển string subject thành mảng để tái sử dụng giao diện cũ
        expertise: tutor.subject.split(',').map(s => s.trim()) 
      };
    });
  }, []);

  // --- 2. XỬ LÝ LỌC ---

  const filteredStudents = studentsNeedingHelp.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        s.studentId.includes(searchTerm);
    const matchFaculty = filterFaculty === 'all' || s.faculty === filterFaculty;
    return matchSearch && matchFaculty;
  });

  const filteredTutors = tutorList.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFaculty = filterFaculty === 'all' || t.faculty === filterFaculty;
    return matchSearch && matchFaculty;
  });

  // --- 3. TẠO GỢI Ý GHÉP ĐÔI TỰ ĐỘNG ---
  
  const autoMatches = useMemo(() => {
    const matches: any[] = [];
    studentsNeedingHelp.forEach(student => {
      // Tìm tutor có chuyên môn trùng khớp với môn học sinh viên yêu cầu
      tutorList.filter(t => t.available).forEach(tutor => {
        // Logic so sánh đơn giản: Kiểm tra xem subject của Tutor có chứa từ khóa trong request không
        const isSubjectMatch = tutor.expertise.some(skill => 
          student.subject.toLowerCase().includes(skill.toLowerCase()) || 
          skill.toLowerCase().includes(student.subject.split(' - ')[0].toLowerCase())
        );

        if (isSubjectMatch) {
          // Tính điểm giả lập
          const score = 80 + Math.floor(Math.random() * 20); // 80 - 99
          matches.push({
            student,
            tutor,
            matchScore: score
          });
        }
      });
    });
    // Sắp xếp theo điểm cao nhất
    return matches.sort((a, b) => b.matchScore - a.matchScore);
  }, [studentsNeedingHelp, tutorList]);


  // --- 4. HANDLERS ---

  const handleManualMatch = () => {
    if (selectedRequest && selectedTutor) {
      const request = studentsNeedingHelp.find(r => r.requestId === selectedRequest);
      const tutor = tutorList.find(t => t.id === selectedTutor);
      
      toast.success(`Đã ghép ${request?.name} với tutor ${tutor?.name} thành công!`);
      // Ở môi trường thật, đây sẽ là API call để update status request thành 'approved' và tạo booking
      setSelectedRequest(null);
      setSelectedTutor(null);
    } else {
      toast.error('Vui lòng chọn cả yêu cầu của sinh viên và tutor!');
    }
  };

  const handleAutoMatch = (accept: boolean, index: number) => {
    if (accept) {
      toast.success('Đã chấp nhận và tạo lịch hẹn!');
    } else {
      toast.info('Đã bỏ qua gợi ý này');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Ghép đôi Tutor - Sinh viên</CardTitle>
          <CardDescription>
            Quản lý và phân bổ Tutor cho các yêu cầu hỗ trợ (Dựa trên dữ liệu thực tế)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="manual" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="manual">Thủ công</TabsTrigger>
              <TabsTrigger value="auto">
                Tự động <Badge className="ml-2 bg-green-600">{autoMatches.length}</Badge>
              </TabsTrigger>
            </TabsList>

            {/* === TAB THỦ CÔNG === */}
            <TabsContent value="manual" className="space-y-6">
              {/* Filters */}
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Tìm kiếm sinh viên, tutor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterFaculty} onValueChange={setFilterFaculty}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Chọn khoa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả khoa</SelectItem>
                    <SelectItem value="CSE">KH&KT Máy tính</SelectItem>
                    <SelectItem value="EE">Điện - Điện tử</SelectItem>
                    <SelectItem value="CHE">Kỹ thuật Hóa học</SelectItem>
                    <SelectItem value="Other">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Students Requests List */}
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 font-medium">
                    Yêu cầu đang chờ (Pending)
                    <Badge variant="secondary">{filteredStudents.length}</Badge>
                  </h3>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                    {filteredStudents.length === 0 ? (
                        <div className="text-center p-8 border border-dashed rounded text-gray-400">Không có yêu cầu nào</div>
                    ) : filteredStudents.map((req) => (
                      <div
                        key={req.requestId}
                        onClick={() => setSelectedRequest(req.requestId)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedRequest === req.requestId
                            ? 'border-[#0B5FA5] bg-blue-50 shadow-md'
                            : 'hover:border-gray-400 bg-white'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold">{req.name}</h4>
                            <p className="text-xs text-gray-500">{req.studentId}</p>
                          </div>
                          <Badge variant="outline">{req.faculty}</Badge>
                        </div>
                        <div className="mb-2">
                            <span className="text-sm font-medium text-gray-700">Cần giúp: </span>
                            <span className="text-sm text-[#0B5FA5]">{req.subject}</span>
                        </div>
                        {req.note && (
                            <p className="text-xs text-gray-500 italic bg-gray-50 p-2 rounded">"{req.note}"</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tutors List */}
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 font-medium">
                    Danh sách Tutor
                    <Badge variant="secondary">{filteredTutors.length}</Badge>
                  </h3>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                    {filteredTutors.map((tutor) => (
                      <div
                        key={tutor.id}
                        onClick={() => setSelectedTutor(tutor.id)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedTutor === tutor.id
                            ? 'border-[#0B5FA5] bg-blue-50 shadow-md'
                            : 'hover:border-gray-400 bg-white'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold">{tutor.name}</h4>
                            <p className="text-xs text-gray-500">{tutor.faculty}</p>
                          </div>
                          <Badge className={tutor.available ? 'bg-green-500' : 'bg-gray-400'}>
                            {tutor.available ? 'Rảnh' : 'Bận'}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {tutor.expertise.map((skill) => (
                            <Badge key={skill} className="text-[10px] bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-4 border-t">
                <Button
                  onClick={handleManualMatch}
                  className="bg-[#0B5FA5] hover:bg-[#094A7F] w-full md:w-auto min-w-[200px]"
                  disabled={!selectedRequest || !selectedTutor}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Xác nhận ghép đôi
                </Button>
              </div>
            </TabsContent>

            {/* === TAB TỰ ĐỘNG === */}
            <TabsContent value="auto" className="space-y-4">
              <div className="mb-4 flex justify-between items-center">
                <div>
                    <h3 className="font-semibold text-lg">Gợi ý ghép đôi thông minh</h3>
                    <p className="text-sm text-gray-500">
                    Hệ thống tự động so khớp môn học cần hỗ trợ với chuyên môn của Tutor
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => toast.success('Đã làm mới gợi ý')}>
                    <RefreshCw className="w-4 h-4 mr-2" /> Làm mới
                </Button>
              </div>

              {autoMatches.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">Chưa tìm thấy cặp đôi nào phù hợp tự động.</p>
                  </div>
              ) : (
                <div className="space-y-4">
                    {autoMatches.map((match, index) => (
                    <Card key={index} className="overflow-hidden border-l-4 border-l-green-500">
                        <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
                            {/* Sinh viên */}
                            <div className="md:col-span-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Sinh viên yêu cầu</p>
                                <h4 className="font-bold text-[#0B5FA5]">{match.student.name}</h4>
                                <p className="text-sm font-medium mt-1">{match.student.subject}</p>
                                {match.student.note && <p className="text-xs text-gray-500 mt-2 italic">"{match.student.note}"</p>}
                            </div>

                            {/* Score */}
                            <div className="md:col-span-1 flex flex-col items-center justify-center">
                                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-1">
                                    <span className="text-green-700 font-bold text-sm">{match.matchScore}%</span>
                                </div>
                                <span className="text-[10px] text-gray-400 uppercase font-bold">Phù hợp</span>
                            </div>

                            {/* Tutor */}
                            <div className="md:col-span-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Tutor đề xuất</p>
                                <h4 className="font-bold text-[#0B5FA5]">{match.tutor.name}</h4>
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {match.tutor.expertise.map((skill: string) => (
                                        <Badge key={skill} variant="outline" className="bg-white text-[10px] border-blue-200">
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-4 justify-end border-t pt-4">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAutoMatch(false, index)}
                                className="text-gray-500"
                            >
                                <XCircle className="w-4 h-4 mr-2" /> Bỏ qua
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => handleAutoMatch(true, index)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                <CheckCircle className="w-4 h-4 mr-2" /> Chấp nhận & Tạo lịch
                            </Button>
                        </div>
                        </CardContent>
                    </Card>
                    ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}