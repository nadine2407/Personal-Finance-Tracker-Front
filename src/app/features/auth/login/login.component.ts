import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [TranslatePipe],
  template: `<p>{{ 'auth.login' | translate }}</p>`
})
export class LoginComponent {}
