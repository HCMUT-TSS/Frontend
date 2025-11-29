import { apiClient } from './api';

export interface AvailableSlot {
  tutorId: number;
  tutorName: string;
  faculty: string;
  mssv: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface AvailableSlotsResponse {
  total: number;
  slots: AvailableSlot[];
}

export interface Booking {
  id: number;
  type?: '1-1' | 'group';
  tutorId?: number;
  studentId?: number;
  subject?: string;
  description?: string;
  preferredDate: string;
  startTime?: string;
  endTime?: string;
  status: string;
  tutor?: {
    user: {
      name: string;
    };
  };
  student?: {
    user: {
      name: string;
    };
  };
}

export interface MyBookingsResponse {
  bookings: Booking[];
}

export const bookingService = {
  // Get available slots for students
  async getAvailableSlots(days: number = 14): Promise<AvailableSlotsResponse> {
    return apiClient.get<AvailableSlotsResponse>(`/availabilities?days=${days}`);
  },

  // Create booking request (1-1)
  async createBookingRequest(data: {
    tutorId: number;
    preferredDate: string;
    startTime: string;
    endTime: string;
    subject?: string;
    description?: string;
  }): Promise<{ message: string; booking: Booking }> {
    return apiClient.post('/bookings/request', data);
  },

  // Get my bookings (student or tutor)
  async getMyBookings(): Promise<MyBookingsResponse> {
    return apiClient.get<MyBookingsResponse>('/my/bookings');
  },
};
