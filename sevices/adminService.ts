import { apiClient } from './api';

export interface PendingTutor {
  userId: number;
  status: string;
  appliedAt: string;
  user: {
    id: number;
    ssoSub: string;
    name: string;
    email: string;
    phoneNumber: string;
    faculty: string;
  };
}

export interface PendingTutorsResponse {
  data: PendingTutor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const adminService = {
  // Get pending tutors
  async getPendingTutors(page: number = 1, limit: number = 10): Promise<PendingTutorsResponse> {
    return apiClient.get<PendingTutorsResponse>(`/admin/pending-tutors?page=${page}&limit=${limit}`);
  },

  // Approve tutor
  async approveTutor(userId: number): Promise<{ message: string; tutor: PendingTutor }> {
    return apiClient.patch(`/admin/tutors/${userId}/approve`);
  },

  // Reject tutor
  async rejectTutor(userId: number): Promise<{ message: string; tutor: PendingTutor }> {
    return apiClient.patch(`/admin/tutors/${userId}/reject`);
  },
};
