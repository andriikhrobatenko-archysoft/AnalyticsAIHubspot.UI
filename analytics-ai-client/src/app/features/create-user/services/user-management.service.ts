import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { UserRole } from '../../../core/models/user-role.model';
import { CreateUserRequest } from '../models/create-user-request.model';
import { CreateUserResponse } from '../models/create-user-response.model';
import { UserSummary } from '../models/user-summary.model';

@Injectable({ providedIn: 'root' })
export class UserManagementService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/users`;

  listUsers(): Observable<UserSummary[]> {
    return this.http.get<UserSummary[]>(this.baseUrl);
  }

  createUser(request: CreateUserRequest): Observable<CreateUserResponse> {
    return this.http.post<CreateUserResponse>(this.baseUrl, request);
  }

  updateRole(userId: string, role: UserRole): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${userId}/role`, { role });
  }

  resetPassword(userId: string, password: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${userId}/password`, { password });
  }

  deleteUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${userId}`);
  }
}
