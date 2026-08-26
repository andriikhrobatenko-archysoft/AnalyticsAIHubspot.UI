import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';
import { AuthService } from './core/auth/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Plain path-based routing (/chat, /login, ...), not hash-based — this app is served by a
    // real server now (AnalyticsAI.Api's SPA fallback), which can resolve a deep link like
    // /chat on refresh. Hash routing was only ever needed for the abandoned Electron build,
    // which loaded index.html over file:// with no server to ask.
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    // Attempts a silent token refresh before the app renders, so a returning user with a
    // still-valid refresh token lands straight on the app instead of flashing the login page.
    provideAppInitializer(() => firstValueFrom(inject(AuthService).restoreSession())),
  ],
};
