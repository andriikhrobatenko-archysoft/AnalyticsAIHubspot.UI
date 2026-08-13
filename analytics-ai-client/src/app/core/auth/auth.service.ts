import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, finalize, map, shareReplay, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoginResponse } from '../models/login-response.model';
import { UserRole } from '../models/user-role.model';
import { AuthStorageService } from './auth-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(AuthStorageService);

  private readonly _accessToken = signal<string | null>(null);
  private readonly _role = signal<UserRole | null>(null);
  private readonly _username = signal<string | null>(null);

  readonly accessToken = this._accessToken.asReadonly();
  readonly role = this._role.asReadonly();
  readonly username = this._username.asReadonly();
  readonly isAuthenticated = computed(() => this._accessToken() !== null);
  readonly isAdmin = computed(() => this._role() === 'Admin');

  // Guards against every 401 firing its own refresh call: while one refresh is in flight, every
  // caller (e.g. several requests that all expired at once) is handed this same Observable
  // instead of starting a new HTTP call — the refresh token is single-use, so a second concurrent
  // call would just fail against the one the first call already rotated out.
  private refreshInFlight$: Observable<string> | null = null;

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiBaseUrl}/api/auth/login`, { username, password })
      .pipe(tap((response) => this.applySession(response, username)));
  }

  /**
   * Attempts to restore a session from a persisted refresh token — called once at app startup so
   * a returning user with a still-valid refresh token doesn't have to log in again. Resolves
   * `true` if a session was restored, `false` if there was nothing to restore or it failed.
   */
  restoreSession(): Observable<boolean> {
    const refreshToken = this.storage.getRefreshToken();
    if (!refreshToken) {
      return of(false);
    }

    const storedUsername = this.storage.getUsername();
    if (storedUsername) {
      this._username.set(storedUsername);
    }

    return this.refreshAccessToken().pipe(
      map(() => true),
      catchError(() => {
        this.clearSession();
        return of(false);
      }),
    );
  }

  refreshAccessToken(): Observable<string> {
    if (this.refreshInFlight$) {
      return this.refreshInFlight$;
    }

    const refreshToken = this.storage.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available.'));
    }

    this.refreshInFlight$ = this.http
      .post<LoginResponse>(`${environment.apiBaseUrl}/api/auth/refresh`, { refreshToken })
      .pipe(
        tap((response) => this.applySession(response, this._username())),
        map((response) => response.accessToken),
        shareReplay(1),
        finalize(() => {
          this.refreshInFlight$ = null;
        }),
      );

    return this.refreshInFlight$;
  }

  /** Revokes the refresh token server-side (best effort) and clears the local session either way. */
  logout(): void {
    const refreshToken = this.storage.getRefreshToken();
    this.clearSession();

    if (refreshToken) {
      this.http.post(`${environment.apiBaseUrl}/api/auth/logout`, { refreshToken }).subscribe({
        error: () => undefined,
      });
    }
  }

  private applySession(response: LoginResponse, username: string | null): void {
    this._accessToken.set(response.accessToken);
    this._role.set(response.role);
    this._username.set(username);

    this.storage.setRefreshToken(response.refreshToken);
    if (username) {
      this.storage.setUsername(username);
    }
  }

  private clearSession(): void {
    this._accessToken.set(null);
    this._role.set(null);
    this._username.set(null);
    this.storage.clear();
  }
}
