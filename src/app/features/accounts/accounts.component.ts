import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [TranslatePipe],
  template: `<p>{{ 'nav.accounts' | translate }}</p>`
})
export class AccountsComponent {}
