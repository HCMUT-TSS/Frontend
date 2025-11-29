// src/data/mockSessions.ts
// File này chứa toàn bộ dữ liệu giả lập – sau này bạn chỉ cần thay bằng API

export const MOCK_TUTORS = [
  { id: 1, name: "Nguyễn Minh Tâm", subject: "C++ & Cấu trúc dữ liệu", available: true },
  { id: 2, name: "Nguyễn Phúc Gia Khiêm", subject: "Giải tích & Đại số", available: true },
  { id: 3, name: "Trần Trung Toàn", subject: "Mạch điện & Điện tử", available: true },
  { id: 4, name: "Phạm Minh Tuấn", subject: "Vật lý đại cương", available: true },
];

export const MOCK_TUTOR_AVAILABILITY = [
  { id: 101, tutorId: 1, tutorName: "Nguyễn Minh Tâm", date: "2025-12-02", time: "14:00 - 16:00", booked: false, status: "available" as const },
  { id: 102, tutorId: 1, tutorName: "Nguyễn Minh Tâm", date: "2025-12-04", time: "10:00 - 12:00", booked: false, status: "available" as const },
  { id: 201, tutorId: 2, tutorName: "Nguyễn Phúc Gia Khiêm", date: "2025-12-03", time: "09:00 - 11:00", booked: false, status: "available" as const },
  { id: 202, tutorId: 2, tutorName: "Nguyễn Phúc Gia Khiêm", date: "2025-12-05", time: "16:00 - 18:00", booked: true, status: "booked" as const },
  { id: 301, tutorId: 3, tutorName: "Trần Trung Toàn", date: "2025-12-06", time: "19:00 - 21:00", booked: false, status: "available" as const },
];

export const MOCK_GROUP_SESSIONS = [
  {
    id: 1,
    title: "Ôn tập C++ cơ bản",
    tutor: "Nguyễn Minh Tâm",
    date: "2025-12-01",
    time: "14:00 - 16:00",
    location: "Phòng H1-302",
    type: "offline" as const,
    enrolled: 14,
    maxParticipants: 20,
    program: "Hỗ trợ học tập K23",
    subject: "Lập trình C++",
  },
  {
    id: 2,
    title: "Giải tích 1 – Giới hạn & Đạo hàm",
    tutor: "Nguyễn Phúc Gia Khiêm",
    date: "2025-12-05",
    time: "09:00 - 11:00",
    location: "Google Meet",
    type: "online" as const,
    enrolled: 18,
    maxParticipants: 25,
    program: "Hỗ trợ học tập K22",
    subject: "Giải tích",
  },
];

export const MOCK_ONE_ON_ONE_REQUESTS = [
  {
    id: 1,
    studentName: "Nguyễn Mai Huy Phát",
    studentId: "2312589",
    subject: "Linked List & Pointer",
    preferredDate: "2025-12-04",
    preferredTime: "14:00 - 15:30",
    type: "online" as const,
    status: "pending" as const,
    note: "Em đang lỗi khi implement Doubly Linked List",
  },
  {
    id: 2,
    studentName: "Hồ Anh Duy",
    studentId: "2310460",
    subject: "Định luật bảo toàn cơ năng",
    preferredDate: "2025-12-07",
    preferredTime: "13:00 - 14:00",
    type: "online" as const,
    status: "approved" as const,
    note: "",
  },
];

export const MOCK_STUDENT_BOOKINGS = [
  {
    id: 101,
    type: "1-1" as const,
    tutor: "Nguyễn Minh Tâm",
    date: "2025-12-02",
    time: "14:00 - 15:30",
    subject: "OOP trong C++",
    location: "Google Meet",
    status: "confirmed" as const,
  },
  {
    id: 102,
    type: "group" as const,
    tutor: "Nguyễn Phúc Gia Khiêm",
    date: "2025-12-05",
    time: "09:00 - 11:00",
    subject: "Giải tích 1",
    location: "Google Meet Link",
    status: "confirmed" as const,
    title: "Giải tích 1 – Giới hạn & Đạo hàm",
  },
];

export const MOCK_PROGRAMS = [
  { id: 1, name: "Chương trình hỗ trợ học tập K23", sessions: 15, students: 248 },
  { id: 2, name: "Chương trình hỗ trợ học tập K22", sessions: 10, students: 182 },
];