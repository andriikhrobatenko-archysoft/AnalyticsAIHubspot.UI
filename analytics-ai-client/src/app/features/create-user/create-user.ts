import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { UserRole } from '../../core/models/user-role.model';
import { PasswordInput } from '../../shared/password-input/password-input';
import { ProblemDetails } from './models/problem-details.model';
import { UserSummary } from './models/user-summary.model';
import { UserManagementService } from './services/user-management.service';

@Component({
  selector: 'app-create-user',
  imports: [ReactiveFormsModule, FormsModule, PasswordInput],
  templateUrl: './create-user.html',
  styleUrl: './create-user.scss',
})
export class CreateUser {
  private readonly fb = inject(FormBuilder);
  private readonly userManagement = inject(UserManagementService);
  protected readonly auth = inject(AuthService);

  protected readonly roles: UserRole[] = ['User', 'Admin'];

  // --- Create user -------------------------------------------------------

  protected readonly form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
    role: this.fb.nonNullable.control<UserRole>('User', Validators.required),
  });

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly showCreateForm = signal(false);

  protected toggleCreateForm(): void {
    this.showCreateForm.update((open) => !open);
  }

  protected submit(): void {
    if (this.form.invalid || this.submitting()) {
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.userManagement.createUser(this.form.getRawValue()).subscribe({
      next: (response) => {
        this.submitting.set(false);
        this.successMessage.set(`User "${response.username}" created with role ${response.role}.`);
        this.form.reset({ username: '', password: '', role: 'User' });
        this.loadUsers();
      },
      error: (error: unknown) => {
        this.submitting.set(false);
        this.errorMessage.set(this.extractError(error));
      },
    });
  }

  // --- User list -----------------------------------------------------------

  protected readonly users = signal<UserSummary[]>([]);
  protected readonly loadingUsers = signal(false);
  protected readonly actionError = signal<string | null>(null);

  protected readonly roleUpdatingId = signal<string | null>(null);
  protected readonly resettingUserId = signal<string | null>(null);
  protected readonly resetPasswordValue = signal('');
  protected readonly resetSubmitting = signal(false);
  protected readonly deletingId = signal<string | null>(null);

  constructor() {
    this.loadUsers();
  }

  protected isSelf(user: UserSummary): boolean {
    return user.username === this.auth.username();
  }

  protected changeRole(user: UserSummary, role: UserRole): void {
    if (role === user.role) {
      return;
    }

    this.roleUpdatingId.set(user.id);
    this.actionError.set(null);

    this.userManagement.updateRole(user.id, role).subscribe({
      next: () => {
        this.roleUpdatingId.set(null);
        this.users.update((all) => all.map((u) => (u.id === user.id ? { ...u, role } : u)));
      },
      error: (error: unknown) => {
        this.roleUpdatingId.set(null);
        this.actionError.set(this.extractError(error));
      },
    });
  }

  protected toggleReset(userId: string): void {
    this.resettingUserId.set(this.resettingUserId() === userId ? null : userId);
    this.resetPasswordValue.set('');
    this.actionError.set(null);
  }

  protected submitReset(userId: string): void {
    const password = this.resetPasswordValue();
    if (!password || this.resetSubmitting()) {
      return;
    }

    this.resetSubmitting.set(true);
    this.actionError.set(null);

    this.userManagement.resetPassword(userId, password).subscribe({
      next: () => {
        this.resetSubmitting.set(false);
        this.resettingUserId.set(null);
        this.resetPasswordValue.set('');
      },
      error: (error: unknown) => {
        this.resetSubmitting.set(false);
        this.actionError.set(this.extractError(error));
      },
    });
  }

  protected deleteUser(user: UserSummary): void {
    if (!confirm(`Delete the user "${user.username}"? This cannot be undone.`)) {
      return;
    }

    this.deletingId.set(user.id);
    this.actionError.set(null);

    this.userManagement.deleteUser(user.id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.users.update((all) => all.filter((u) => u.id !== user.id));
      },
      error: (error: unknown) => {
        this.deletingId.set(null);
        this.actionError.set(this.extractError(error));
      },
    });
  }

  private loadUsers(): void {
    this.loadingUsers.set(true);
    this.userManagement.listUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loadingUsers.set(false);
      },
      error: () => {
        this.actionError.set('Could not load users.');
        this.loadingUsers.set(false);
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
      if (problem?.title) {
        return problem.title;
      }
    }
    return 'Something went wrong. Please try again.';
  }
}
