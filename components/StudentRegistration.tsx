import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { toast } from 'sonner';

export default function StudentRegistration() {
  const [formData, setFormData] = useState({
    fullName: '',
    studentId: '',
    faculty: '',
    major: '',
    email: '',
    supportType: '',
    counselingArea: [] as string[],
    additionalInfo: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Đăng ký thành công! Chúng tôi sẽ liên hệ với bạn sớm.');
  };

  const counselingAreas = [
    'Toán cao cấp',
    'Vật lý đại cương',
    'Lập trình C/C++',
    'Cấu trúc dữ liệu',
    'Giải tích',
    'Hóa học',
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Đăng ký chương trình hỗ trợ</CardTitle>
          <CardDescription>
            Điền thông tin để đăng ký nhận hỗ trợ từ tutor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và tên *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Nguyễn Văn A"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="studentId">Mã sinh viên *</Label>
                <Input
                  id="studentId"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  placeholder="2012345"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="faculty">Khoa *</Label>
                <Select
                  value={formData.faculty}
                  onValueChange={(value) => setFormData({ ...formData, faculty: value })}
                >
                  <SelectTrigger id="faculty">
                    <SelectValue placeholder="Chọn khoa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cse">Khoa Khoa học và Kỹ thuật Máy tính</SelectItem>
                    <SelectItem value="ee">Khoa Điện - Điện tử</SelectItem>
                    <SelectItem value="me">Khoa Cơ khí</SelectItem>
                    <SelectItem value="ce">Khoa Kỹ thuật Xây dựng</SelectItem>
                    <SelectItem value="che">Khoa Kỹ thuật Hóa học</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="major">Ngành học *</Label>
                <Input
                  id="major"
                  value={formData.major}
                  onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                  placeholder="Khoa học máy tính"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email học thuật *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ten.sv@hcmut.edu.vn"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supportType">Loại hỗ trợ *</Label>
                <Select
                  value={formData.supportType}
                  onValueChange={(value) => setFormData({ ...formData, supportType: value })}
                >
                  <SelectTrigger id="supportType">
                    <SelectValue placeholder="Chọn loại hỗ trợ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic">Học thuật</SelectItem>
                    <SelectItem value="skills">Kỹ năng mềm</SelectItem>
                    <SelectItem value="both">Cả hai</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Lĩnh vực tư vấn *</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {counselingAreas.map((area) => (
                  <div key={area} className="flex items-center space-x-2">
                    <Checkbox
                      id={area}
                      checked={formData.counselingArea.includes(area)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({
                            ...formData,
                            counselingArea: [...formData.counselingArea, area],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            counselingArea: formData.counselingArea.filter((a) => a !== area),
                          });
                        }
                      }}
                    />
                    <label htmlFor={area} className="text-sm cursor-pointer">
                      {area}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalInfo">Thông tin bổ sung</Label>
              <Textarea
                id="additionalInfo"
                value={formData.additionalInfo}
                onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                placeholder="Mô tả chi tiết về nhu cầu hỗ trợ của bạn..."
                rows={4}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="bg-[#0B5FA5] hover:bg-[#094A7F]">
                Gửi đăng ký
              </Button>
              <Button type="button" variant="outline">
                Hủy
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
