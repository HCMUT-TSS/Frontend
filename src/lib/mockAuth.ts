// src/lib/mockAuth.ts
import { getProfileFromDATACORE } from '../mock/mockHcmut';

export type Role = 'student' | 'tutor' | 'admin';

export type LoginResult =
  | { success: true; user: { name: string; email: string; role: Role } }
  | { success: false; error: string };

export const mockLoginWithEmail = async (email: string): Promise<LoginResult> => {
  await new Promise(r => setTimeout(r, 800 + Math.random() * 600));

  try {
    const profile = getProfileFromDATACORE(email);
    return {
      success: true,
      user: {
        name: profile.name,
        email: profile.email,
        role: profile.role as Role, // ép kiểu ở đây luôn → sạch sẽ nhất
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Không tìm thấy tài khoản' };
  }
};