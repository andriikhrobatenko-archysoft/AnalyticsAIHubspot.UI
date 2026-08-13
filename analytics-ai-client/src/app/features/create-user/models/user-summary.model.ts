import { UserRole } from '../../../core/models/user-role.model';

export interface UserSummary {
  id: string;
  username: string;
  role: UserRole;
}
