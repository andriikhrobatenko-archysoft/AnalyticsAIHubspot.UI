import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withHashLocation } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';
import { AuthService } from './core/auth/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Hash-based routing (#/chat, #/login, ...): the Electron shell loads index.html over the
    // file:// protocol, which has no server to resolve a deep path like /chat on refresh — hash
    // routing keeps everything resolving against the one real file.
    provideRouter(routes, withHashLocation()),
    provideHttpClient(withInterceptors([authInterceptor])),
    // Attempts a silent token refresh before the app renders, so a returning user with a
    // still-valid refresh token lands straight on the app instead of flashing the login page.
    provideAppInitializer(() => firstValueFrom(inject(AuthService).restoreSession())),
  ],
};
