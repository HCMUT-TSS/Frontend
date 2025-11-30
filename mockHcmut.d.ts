// Backend/src/data/mockHcmut.d.ts

export interface Tutor {
  id: number;
  name: string;
  subject: string;
  available: boolean;
}

export interface AvailabilitySlot {
  id: number;
  tutorId: number;
  tutorName: string;
  date: string;
  time: string;
  booked: boolean;
}

export interface GroupSession {
  id: number;
  title: string;
  tutor: string;
  subject: string;
  date: string;
  time: string;
  location: string;
  type: 'online' | 'offline';
  enrolled: number;
  maxParticipants: number;
  program: string;
}

export interface OneOnOneRequest {
  id: number;
  studentName: string;
  studentId: string;
  subject: string;
  preferredDate: string;
  preferredTime: string;
  type: 'online' | 'offline';
  location?: string;
  status: 'pending' | 'approved' | 'rejected';
  note: string;
  tutorName: string;
}

export interface StudentBooking {
  id: number;
  type: '1-1' | 'group';
  tutor: string;
  date: string;
  time: string;
  subject: string;
  location: string;
  status: 'confirmed' | 'pending';
}

export const MOCK_TUTORS: Tutor[];
export const MOCK_TUTOR_AVAILABILITY: AvailabilitySlot[];
export const MOCK_GROUP_SESSIONS: GroupSession[];
export const MOCK_ONE_ON_ONE_REQUESTS: OneOnOneRequest[];
export const MOCK_STUDENT_BOOKINGS: StudentBooking[];