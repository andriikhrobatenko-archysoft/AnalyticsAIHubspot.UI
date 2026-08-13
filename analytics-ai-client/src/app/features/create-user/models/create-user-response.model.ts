import { UserRole } from '../../../core/models/user-role.model';

export interface CreateUserResponse {
  id: string;
  username: string;
  role: UserRole;
}
