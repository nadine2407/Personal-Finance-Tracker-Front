import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [TranslatePipe],
  template: `<p>{{ 'auth.register' | translate }}</p>`
})
export class RegisterComponent {}
