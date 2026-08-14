import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { UserSettings } from '../models/user-settings.model';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/settings`;

  get(): Observable<UserSettings> {
    return this.http.get<UserSettings>(this.baseUrl);
  }

  update(settings: UserSettings): Observable<void> {
    return this.http.put<void>(this.baseUrl, settings);
  }
}
