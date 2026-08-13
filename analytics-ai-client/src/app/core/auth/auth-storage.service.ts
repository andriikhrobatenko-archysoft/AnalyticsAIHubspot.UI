import { Injectable } from '@angular/core';

const REFRESH_TOKEN_KEY = 'analyticsai.refreshToken';
const USERNAME_KEY = 'analyticsai.username';

/**
 * Wraps localStorage so the rest of the app never touches browser storage APIs directly — only
 * the refresh token and a display-only username are persisted. The access token is never
 * persisted: it's short-lived (15 min) and only ever held in memory (AuthService's signal), so a
 * restart always goes through a fresh refresh rather than trusting a possibly-stale stored token.
 */
@Injectable({ providedIn: 'root' })
export class AuthStorageService {
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  setRefreshToken(token: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }

  getUsername(): string | null {
    return localStorage.getItem(USERNAME_KEY);
  }

  setUsername(username: string): void {
    localStorage.setItem(USERNAME_KEY, username);
  }

  clear(): void {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
  }
}
