import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { ProblemDetails } from './models/problem-details.model';
import { SchemaMapCheckResult } from './models/schema-map-check-result.model';
import { SchemaMapService } from './services/schema-map.service';
import { SettingsService } from './services/settings.service';

@Component({
  selector: 'app-settings',
  imports: [],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {
  private readonly settingsService = inject(SettingsService);
  private readonly schemaMapService = inject(SchemaMapService);
  protected readonly auth = inject(AuthService);

  protected readonly loading = signal(true);
  protected readonly detailedResponses = signal(false);
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  constructor() {
    this.settingsService.get().subscribe({
      next: (settings) => {
        this.detailedResponses.set(settings.detailedResponses);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not load settings.');
        this.loading.set(false);
      },
    });
  }

  protected toggleDetailedResponses(): void {
    const next = !this.detailedResponses();
    this.detailedResponses.set(next);
    this.saving.set(true);
    this.errorMessage.set(null);

    this.settingsService.update({ detailedResponses: next }).subscribe({
      next: () => this.saving.set(false),
      error: () => {
        this.saving.set(false);
        this.detailedResponses.set(!next);
        this.errorMessage.set('Could not save. Please try again.');
      },
    });
  }

  // --- Regenerate schema (Admin only) -------------------------------------

  protected readonly regenerating = signal(false);
  protected readonly regenerateResult = signal<SchemaMapCheckResult | null>(null);
  protected readonly regenerateError = signal<string | null>(null);

  protected regenerateSchema(): void {
    if (this.regenerating()) {
      return;
    }

    this.regenerating.set(true);
    this.regenerateResult.set(null);
    this.regenerateError.set(null);

    this.schemaMapService.regenerate().subscribe({
      next: (result) => {
        this.regenerating.set(false);
        this.regenerateResult.set(result);
      },
      error: (error: unknown) => {
        this.regenerating.set(false);
        this.regenerateError.set(this.extractError(error));
      },
    });
  }

  private extractError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const problem = error.error as ProblemDetails | null;
      const messages = problem?.errors ? Object.values(problem.errors).flat() : [];
      if (messages.length > 0) {
        return messages.join(' ');
      }      
      if (problem?.detail) {
        return problem.detail;
      }
      if (problem?.title) {
        return problem.title;
      }
    }
    return 'Something went wrong. Please try again.';
  }
}
