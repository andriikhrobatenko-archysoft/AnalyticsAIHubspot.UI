import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserRole } from '../../core/models/user-role.model';
import { ProblemDetails } from './models/problem-details.model';
import { UserManagementService } from './services/user-management.service';
import { PasswordInput } from '../../shared/password-input/password-input';

@Component({
  selector: 'app-create-user',
  imports: [ReactiveFormsModule, PasswordInput],
  templateUrl: './create-user.html',
  styleUrl: './create-user.scss',
})
export class CreateUser {
  private readonly fb = inject(FormBuilder);
  private readonly userManagement = inject(UserManagementService);

  protected readonly roles: UserRole[] = ['User', 'Admin'];

  protected readonly form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
    role: this.fb.nonNullable.control<UserRole>('User', Validators.required),
  });

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

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
      },
      error: (error: unknown) => {
        this.submitting.set(false);
        this.errorMessage.set(this.extractError(error));
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
    }
    return 'Could not create the user. Please try again.';
  }
}
