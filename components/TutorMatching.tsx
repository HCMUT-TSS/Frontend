import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, UserPlus, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function TutorMatching() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFaculty, setFilterFaculty] = useState('all');

  const students = [
    { id: 'S2012345', name: 'Nguyễn Văn A', faculty: 'CSE', needs: ['Lập trình C++', 'Giải tích'], status: 'Chưa ghép' },
    { id: 'S2012346', name: 'Trần Thị B', faculty: 'CSE', needs: ['Cấu trúc dữ liệu'], status: 'Chưa ghép' },
    { id: 'S2012347', name: 'Lê Văn C', faculty: 'EE', needs: ['Mạch điện'], status: 'Chưa ghép' },
  ];

  const tutors = [
    { id: 'T2012345', name: 'Phạm Văn D', faculty: 'CSE', expertise: ['Lập trình C++', 'Giải tích', 'Cấu trúc dữ liệu'], available: true },
    { id: 'T2012346', name: 'Hoàng Thị E', faculty: 'CSE', expertise: ['Python', 'AI'], available: true },
    { id: 'T2012347', name: 'Võ Văn F', faculty: 'EE', expertise: ['Mạch điện', 'Điện tử'], available: true },
  ];

  const autoMatches = [
    {
      student: { id: 'S2012348', name: 'Đặng Thị G', needs: ['Lập trình C++'] },
      tutor: { id: 'T2012345', name: 'Phạm Văn D', expertise: ['Lập trình C++'] },
      matchScore: 95,
    },
    {
      student: { id: 'S2012349', name: 'Bùi Văn H', needs: ['Mạch điện'] },
      tutor: { id: 'T2012347', name: 'Võ Văn F', expertise: ['Mạch điện'] },
      matchScore: 90,
    },
  ];

  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [selectedTutor, setSelectedTutor] = useState<string | null>(null);

  const handleManualMatch = () => {
    if (selectedStudent && selectedTutor) {
      toast.success('Ghép đôi thành công!');
      setSelectedStudent(null);
      setSelectedTutor(null);
    } else {
      toast.error('Vui lòng chọn cả sinh viên và tutor!');
    }
  };

  const handleAutoMatch = (accept: boolean, index: number) => {
    if (accept) {
      toast.success('Đã chấp nhận ghép đôi tự động!');
    } else {
      toast.info('Đã từ chối ghép đôi này');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Ghép đôi Tutor - Sinh viên</CardTitle>
          <CardDescription>
            Quản lý việc ghép đôi tutor với sinh viên cần hỗ trợ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="manual" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="manual">Thủ công</TabsTrigger>
              <TabsTrigger value="auto">Tự động</TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-6">
              {/* Filters */}
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Tìm kiếm theo tên hoặc mã số..."
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
                    <SelectItem value="CSE">CSE</SelectItem>
                    <SelectItem value="EE">EE</SelectItem>
                    <SelectItem value="ME">ME</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Students List */}
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2">
                    Sinh viên cần hỗ trợ
                    <Badge variant="secondary">{students.length}</Badge>
                  </h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {students.map((student) => (
                      <div
                        key={student.id}
                        onClick={() => setSelectedStudent(student.id)}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedStudent === student.id
                            ? 'border-[#0B5FA5] bg-blue-50'
                            : 'hover:border-gray-400'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4>{student.name}</h4>
                            <p className="text-sm text-gray-500">{student.id}</p>
                          </div>
                          <Badge variant="outline">{student.faculty}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {student.needs.map((need) => (
                            <Badge key={need} variant="secondary" className="text-xs">
                              {need}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tutors List */}
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2">
                    Tutor có sẵn
                    <Badge variant="secondary">{tutors.length}</Badge>
                  </h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {tutors.map((tutor) => (
                      <div
                        key={tutor.id}
                        onClick={() => setSelectedTutor(tutor.id)}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedTutor === tutor.id
                            ? 'border-[#0B5FA5] bg-blue-50'
                            : 'hover:border-gray-400'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4>{tutor.name}</h4>
                            <p className="text-sm text-gray-500">{tutor.id}</p>
                          </div>
                          <Badge
                            className={tutor.available ? 'bg-green-500' : 'bg-gray-400'}
                          >
                            {tutor.available ? 'Có sẵn' : 'Bận'}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {tutor.expertise.map((skill) => (
                            <Badge key={skill} className="text-xs bg-[#0B5FA5]">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={handleManualMatch}
                  className="bg-[#0B5FA5] hover:bg-[#094A7F]"
                  disabled={!selectedStudent || !selectedTutor}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Ghép đôi đã chọn
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="auto" className="space-y-4">
              <div className="mb-4">
                <h3 className="mb-2">Đề xuất ghép đôi tự động</h3>
                <p className="text-sm text-gray-500">
                  Hệ thống đã phân tích và đề xuất các cặp ghép đôi phù hợp dựa trên chuyên môn và nhu cầu
                </p>
              </div>

              <div className="space-y-4">
                {autoMatches.map((match, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-500 mb-1">Sinh viên</p>
                          <h4>{match.student.name}</h4>
                          <p className="text-sm text-gray-500">{match.student.id}</p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {match.student.needs.map((need) => (
                              <Badge key={need} variant="secondary" className="text-xs">
                                {need}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-2">
                            <span className="text-green-600">{match.matchScore}%</span>
                          </div>
                          <p className="text-sm text-gray-500">Độ phù hợp</p>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm text-gray-500 mb-1">Tutor</p>
                          <h4>{match.tutor.name}</h4>
                          <p className="text-sm text-gray-500">{match.tutor.id}</p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {match.tutor.expertise.map((skill) => (
                              <Badge key={skill} className="text-xs bg-[#0B5FA5]">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4 mt-4 justify-center">
                        <Button
                          onClick={() => handleAutoMatch(true, index)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Chấp nhận
                        </Button>
                        <Button
                          onClick={() => handleAutoMatch(false, index)}
                          variant="outline"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Từ chối
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
