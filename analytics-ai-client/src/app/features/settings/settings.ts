import { Component, inject, signal } from '@angular/core';
import { SettingsService } from './services/settings.service';

@Component({
  selector: 'app-settings',
  imports: [],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {
  private readonly settingsService = inject(SettingsService);

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
}
