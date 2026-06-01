import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { SettingsService } from './settings.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule, PageHeaderComponent],
  templateUrl: './settings.component.html'
})
export class SettingsComponent implements OnInit {
  private service = inject(SettingsService);
  private auth = inject(AuthService);
  private notification = inject(NotificationService);
  private fb = inject(FormBuilder);

  savingProfile = signal(false);
  savingPassword = signal(false);
  showCurrentPassword = signal(false);
  showNewPassword = signal(false);

  profileForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName:  ['', Validators.required],
    email:     ['', [Validators.required, Validators.email]]
  });

  passwordForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword:     ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  });

  ngOnInit(): void {
    const user = this.auth.currentUser();
    if (user) {
      this.profileForm.patchValue({ firstName: user.firstName, lastName: user.lastName, email: user.email });
    }
  }

  submitProfile(): void {
    if (this.profileForm.invalid) return;
    this.savingProfile.set(true);
    const { firstName, lastName, email } = this.profileForm.getRawValue();
    this.service.updateProfile({ firstName: firstName!, lastName: lastName!, email: email! }).subscribe({
      next: res => {
        localStorage.setItem('token', res.token);
        this.auth.updateCurrentUser(res.user);
        this.notification.success('settings.profile_saved');
        this.savingProfile.set(false);
      },
      error: () => { this.notification.error('common.error_save'); this.savingProfile.set(false); }
    });
  }

  submitPassword(): void {
    if (this.passwordForm.invalid) return;
    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.getRawValue();
    if (newPassword !== confirmPassword) {
      this.notification.error('settings.passwords_mismatch');
      return;
    }
    this.savingPassword.set(true);
    this.service.updatePassword({ currentPassword: currentPassword!, newPassword: newPassword! }).subscribe({
      next: () => {
        this.notification.success('settings.password_saved');
        this.passwordForm.reset();
        this.savingPassword.set(false);
      },
      error: () => { this.notification.error('settings.wrong_password'); this.savingPassword.set(false); }
    });
  }
}
