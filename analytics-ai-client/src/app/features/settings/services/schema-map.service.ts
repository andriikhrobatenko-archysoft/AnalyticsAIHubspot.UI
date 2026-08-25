import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SchemaMapCheckResult } from '../models/schema-map-check-result.model';

@Injectable({ providedIn: 'root' })
export class SchemaMapService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/schema-map`;

  /** Admin-only on the backend — deletes and rebuilds schema-map.json from the live Business DB. */
  regenerate(): Observable<SchemaMapCheckResult> {
    return this.http.post<SchemaMapCheckResult>(`${this.baseUrl}/regenerate-schema`, {});
  }
}
