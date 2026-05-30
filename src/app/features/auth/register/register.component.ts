import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, RouterLink],
  template: `
    <div class="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div class="card shadow p-4" style="width: 100%; max-width: 420px;">
        <h4 class="card-title text-center mb-4">
          <i class="bi bi-wallet2 me-2 text-primary"></i>Finance Tracker
        </h4>
        <h5 class="text-center text-muted mb-4">{{ 'auth.register' | translate }}</h5>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="row">
            <div class="col mb-3">
              <label class="form-label">{{ 'auth.firstName' | translate }}</label>
              <input type="text" class="form-control" formControlName="firstName"
                     [class.is-invalid]="form.get('firstName')?.invalid && form.get('firstName')?.touched">
            </div>
            <div class="col mb-3">
              <label class="form-label">{{ 'auth.lastName' | translate }}</label>
              <input type="text" class="form-control" formControlName="lastName"
                     [class.is-invalid]="form.get('lastName')?.invalid && form.get('lastName')?.touched">
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">{{ 'auth.email' | translate }}</label>
            <input type="email" class="form-control" formControlName="email"
                   [class.is-invalid]="form.get('email')?.invalid && form.get('email')?.touched">
          </div>
          <div class="mb-3">
            <label class="form-label">{{ 'auth.password' | translate }}</label>
            <input type="password" class="form-control" formControlName="password"
                   [class.is-invalid]="form.get('password')?.invalid && form.get('password')?.touched">
          </div>

          @if (error()) {
            <div class="alert alert-danger py-2">{{ error() }}</div>
          }

          <button type="submit" class="btn btn-primary w-100" [disabled]="loading()">
            @if (loading()) {
              <span class="spinner-border spinner-border-sm me-2"></span>
            }
            {{ 'auth.registerBtn' | translate }}
          </button>
        </form>

        <p class="text-center mt-3 mb-0">
          {{ 'auth.hasAccount' | translate }}
          <a routerLink="/auth/login">{{ 'auth.login' | translate }}</a>
        </p>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  loading = signal(false);
  error = signal('');

  onSubmit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    const { firstName, lastName, email, password } = this.form.value;
    this.authService.register(firstName!, lastName!, email!, password!).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => {
        this.error.set('Erreur lors de l\'inscription');
        this.loading.set(false);
      }
    });
  }
}
