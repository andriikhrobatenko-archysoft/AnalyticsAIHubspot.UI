import { UserRole } from './user-role.model';

export interface LoginResponse {
  accessToken: string;
  expiresAtUtc: string;
  refreshToken: string;
  role: UserRole;
}
