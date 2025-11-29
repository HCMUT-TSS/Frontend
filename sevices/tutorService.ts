import { apiClient } from './api';

export interface Schedule {
  id: number;
  tutorId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface BookingRequest {
  id: number;
  studentName: string;
  studentId: string;
  subject: string;
  preferredDate: string;
  preferredTime?: string;
  startTime?: string;
  endTime?: string;
  type: 'online' | 'offline';
  location?: string;
  status: 'pending' | 'approved' | 'rejected' | 'confirmed';
  note?: string;
  description?: string;
  student?: {
    user: {
      name: string;
      ssoSub: string;
      faculty: string;
    };
  };
}

export interface ScheduleResponse {
  schedules: Schedule[];
}

export interface BookingRequestsResponse {
  requests: BookingRequest[];
}

export const tutorService = {
  // Get tutor's schedule
  async getMySchedule(): Promise<ScheduleResponse> {
    return apiClient.get<ScheduleResponse>('/tutor/schedule');
  },

  // Create new schedule
  async createSchedule(data: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }): Promise<{ message: string; schedule: Schedule }> {
    return apiClient.post('/tutor/schedule', data);
  },

  // Delete schedule
  async deleteSchedule(id: number): Promise<{ message: string }> {
    return apiClient.delete(`/tutor/schedule/${id}`);
  },

  // Get pending booking requests
  async getPendingRequests(): Promise<BookingRequestsResponse> {
    return apiClient.get<BookingRequestsResponse>('/tutor/booking-requests');
  },

  // Confirm booking request
  async confirmRequest(id: number): Promise<{ message: string; booking: BookingRequest }> {
    return apiClient.patch(`/tutor/booking-requests/${id}/confirm`);
  },

  // Reject booking request
  async rejectRequest(id: number): Promise<{ message: string; booking: BookingRequest }> {
    return apiClient.patch(`/tutor/booking-requests/${id}/reject`);
  },
};
