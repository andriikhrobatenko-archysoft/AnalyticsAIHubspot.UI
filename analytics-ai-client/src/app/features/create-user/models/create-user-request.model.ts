import { UserRole } from '../../../core/models/user-role.model';

export interface CreateUserRequest {
  username: string;
  password: string;
  role: UserRole;
}
